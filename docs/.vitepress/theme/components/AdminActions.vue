<template>
  <div v-if="isLocalhost && showActions" class="admin-actions-bar">
    <!-- 1. 공부게시판 메인 (/board/) -->
    <template v-if="pageType === 'board-main'">
      <button @click="navigate('/write?tab=board')" class="admin-btn btn-create-board">
        ➕ 새 공부 카테고리(게시판) 추가
      </button>
      <button @click="navigate('/manage')" class="admin-btn btn-manage">
        ⚙️ 위키 관리 및 삭제
      </button>
    </template>

    <!-- 2. 과목 메인 (/board/{boardId}/) -->
    <template v-else-if="pageType === 'board-category'">
      <button @click="navigate(`/write?tab=post&boardId=${boardId}`)" class="admin-btn btn-create-post">
        ✏️ 이 카테고리에 새 글 쓰기
      </button>
      <button @click="navigate(`/write?editBoard=${boardId}&editFile=index`)" class="admin-btn btn-edit">
        ✍️ 대문 페이지 수정하기
      </button>
      <button @click="deleteBoard" class="admin-btn btn-delete-category">
        🗑️ 카테고리 전체 삭제
      </button>
    </template>

    <!-- 3. 과목 상세 글 (/board/{boardId}/{filename}) -->
    <template v-else-if="pageType === 'board-post'">
      <button @click="navigate(`/write?editBoard=${boardId}&editFile=${filename}`)" class="admin-btn btn-edit">
        ✍️ 이 글 수정하기
      </button>
      <button @click="deletePost" class="admin-btn btn-delete">
        🗑️ 이 글 삭제하기
      </button>
    </template>

    <!-- 4. QnA 메인 (/qna/) -->
    <template v-else-if="pageType === 'qna-main'">
      <button @click="navigate('/write?tab=post&boardId=qna')" class="admin-btn btn-create-post">
        ✏️ 새 질문 등록하기
      </button>
    </template>

    <!-- 5. QnA 상세 글 (/qna/{filename}) -->
    <template v-else-if="pageType === 'qna-post'">
      <button @click="navigate(`/write?editBoard=qna&editFile=${filename}`)" class="admin-btn btn-edit">
        ✍️ 질문 수정하기
      </button>
      <button @click="deletePost" class="admin-btn btn-delete">
        🗑️ 질문 삭제하기
      </button>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const isLocalhost = ref(false)

onMounted(() => {
  isLocalhost.value = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
})

// 현재 경로 파싱
const path = computed(() => route.path)

const pageType = computed(() => {
  const p = path.value
  
  // 1. 공부게시판 메인
  if (p === '/board/' || p === '/board/index.html' || p === '/board/index') {
    return 'board-main'
  }
  
  // 2. QnA 메인
  if (p === '/qna/' || p === '/qna/index.html' || p === '/qna/index') {
    return 'qna-main'
  }
  
  // 3. 과목 메인 (예: /board/linear-algebra/ 또는 /board/linear-algebra/index.html)
  const categoryMatch = p.match(/^\/board\/([^\/]+)\/(index(\.html)?)?$/) || p.match(/^\/board\/([^\/]+)\/$/)
  if (categoryMatch) {
    return 'board-category'
  }
  
  // 4. 과목 상세 글 (예: /board/linear-algebra/multiplication.html)
  const postMatch = p.match(/^\/board\/([^\/]+)\/([^\/]+)(\.html)?$/)
  if (postMatch && postMatch[2] !== 'index') {
    return 'board-post'
  }
  
  // 5. QnA 상세 글 (예: /qna/question.html)
  const qnaPostMatch = p.match(/^\/qna\/([^\/]+)(\.html)?$/)
  if (qnaPostMatch && qnaPostMatch[1] !== 'index') {
    return 'qna-post'
  }
  
  return 'other'
})

// 과목 ID 파싱
const boardId = computed(() => {
  const p = path.value
  const match = p.match(/^\/board\/([^\/]+)/)
  return match ? match[1] : ''
})

// 파일 이름 파싱 (.html 확장자 제거)
const filename = computed(() => {
  const p = path.value
  const postMatch = p.match(/^\/board\/[^\/]+\/([^\/]+)/)
  if (postMatch && postMatch[1] !== 'index') {
    return postMatch[1].replace(/\.html$/, '')
  }
  const qnaPostMatch = p.match(/^\/qna\/([^\/]+)/)
  if (qnaPostMatch && qnaPostMatch[1] !== 'index') {
    return qnaPostMatch[1].replace(/\.html$/, '')
  }
  return ''
})

const showActions = computed(() => pageType.value !== 'other')

const navigate = (url) => {
  window.location.href = url
}

// 개별 글 삭제
const deletePost = async () => {
  const bId = boardId.value || 'qna'
  const fName = filename.value
  if (confirm('🗑️ 이 글을 정말로 삭제하시겠습니까?')) {
    try {
      const res = await fetch('/api/delete-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardId: bId, filename: fName })
      })
      const json = await res.json()
      if (json.success) {
        alert('글 삭제가 완료되었습니다.')
        window.location.href = json.redirect
      }
    } catch (e) {
      alert('삭제 중 오류가 발생했습니다.')
    }
  }
}

// 카테고리 전체 삭제
const deleteBoard = async () => {
  const bId = boardId.value
  if (confirm(`⚠️ 경고: 이 카테고리를 삭제하면 하위 폴더와 그 안의 모든 글이 영구 삭제됩니다. 정말 삭제하시겠습니까?`)) {
    try {
      const res = await fetch('/api/delete-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardId: bId, filename: 'index' })
      })
      const json = await res.json()
      if (json.success) {
        alert('카테고리 전체 삭제가 완료되었습니다.')
        window.location.href = json.redirect
      }
    } catch (e) {
      alert('삭제 중 오류가 발생했습니다.')
    }
  }
}
</script>

<style scoped>
.admin-actions-bar {
  display: flex;
  gap: 12px;
  margin-top: 10px;
  margin-bottom: 24px;
  padding: 12px 16px;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
.admin-btn {
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
  display: inline-flex;
  align-items: center;
}
.admin-btn:hover {
  opacity: 0.9;
}
.btn-create-board {
  background: var(--vp-c-brand-1);
  color: #ffffff;
}
.btn-manage {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}
.btn-create-post {
  background: var(--vp-c-brand-2);
  color: #ffffff;
}
.btn-edit {
  background: var(--vp-c-brand-1);
  color: #ffffff;
}
.btn-delete {
  background: #f87171;
  color: #ffffff;
}
.btn-delete-category {
  background: #f87171;
  color: #ffffff;
  margin-left: auto;
}
</style>
