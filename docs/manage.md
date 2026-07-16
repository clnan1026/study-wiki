---
layout: page
outline: false
---

<div class="cms-header" v-if="isLocalhost">
<h1 class="cms-title">⚙️ 위키 관리 및 삭제</h1>
<p class="cms-subtitle">작성된 모든 학습 노트와 카테고리를 조회하고 수정하거나 다중 선택하여 일괄 삭제할 수 있습니다.</p>
</div>

<div class="cms-container" v-if="isLocalhost">

<div class="tab-content">
<h3 class="tab-title">📂 전체 문서 리스트 및 관리</h3>

<!-- QnA 게시판 관리 -->
<div class="manage-section">
<div class="manage-header">
<h4>💬 QnA (질문과 답변)</h4>
<button 
@click="deleteSelected('qna')" 
class="btn-sm btn-danger" 
:disabled="!selectedPosts['qna'] || selectedPosts['qna'].length === 0"
>
선택 삭제 ({{ selectedPosts['qna'] ? selectedPosts['qna'].length : 0 }}개)
</button>
</div>
<ul class="manage-list">
<li v-for="item in qnaItems" :key="item.link" class="manage-item">
<div class="item-left">
<input 
type="checkbox" 
:value="getFilenameFromLink(item.link)" 
v-model="selectedPosts['qna']" 
class="cms-checkbox" 
/>
<span class="item-text">📄 {{ item.text }}</span>
</div>
<div class="item-actions">
<button @click="startEdit('qna', item)" class="btn-sm btn-edit">수정</button>
</div>
</li>
<li v-if="qnaItems.length === 0" class="empty-item">QnA 게시판에 작성된 질문이 없습니다.</li>
</ul>
</div>

<!-- 일반 과목 게시판 관리 -->
<div v-for="board in boards" :key="board.id" class="manage-section">
<div class="manage-header">
<h4>{{ board.name }}</h4>
<div class="header-actions">
<button 
@click="deleteSelected(board.id)" 
class="btn-sm btn-danger" 
:disabled="!selectedPosts[board.id] || selectedPosts[board.id].length === 0"
>
선택 삭제/초기화 ({{ selectedPosts[board.id] ? selectedPosts[board.id].length : 0 }}개)
</button>
<button @click="deleteBoard(board)" class="btn-sm btn-danger-dark">게시판 자체 삭제</button>
</div>
</div>
<ul class="manage-list">
<li v-for="item in board.items" :key="item.link" class="manage-item" :class="{ 'index-item': isIndexFile(item.link) }">
<div class="item-left">
<input 
type="checkbox" 
:value="getFilenameFromLink(item.link)" 
v-model="selectedPosts[board.id]" 
class="cms-checkbox" 
/>
<span class="item-text">
<span v-if="isIndexFile(item.link)">🏠 <strong>대문 페이지</strong> ({{ item.text }})</span>
<span v-else>📄 {{ item.text }}</span>
</span>
</div>
<div class="item-actions">
<button @click="startEdit(board.id, item)" class="btn-sm btn-edit">수정</button>
</div>
</li>
<li v-if="board.items.length === 0" class="empty-item">작성된 글이 없습니다.</li>
</ul>
</div>

</div>

</div>

<div class="cms-error" v-else>
<p>🚨 현재 이 페이지는 정식 배포된 웹사이트(GitHub Pages 등) 환경에서 조회 중입니다.</p>
<p>웹 브라우저를 통한 직접적인 파일 삭제/수정 기능은 보안 및 기술적 한계로 인해 **로컬 개발 서버 실행 중일 때만 제공**됩니다.</p>
<p><strong>💡 사용 방법:</strong></p>
<ol>
<li>내 컴퓨터 터미널에서 <code>npm run dev</code>로 로컬 서버를 켭니다.</li>
<li>로컬 주소(<code>http://localhost:5173/manage</code>)로 접속하여 문서를 관리합니다.</li>
<li>작업이 완료되면 터미널에서 <code>git push</code>를 실행하여 배포 사이트에 업데이트합니다.</li>
</ol>
</div>

<script setup>
import { ref, onMounted, computed } from 'vue'

const isLocalhost = ref(false)
const sidebarData = ref({})
const boards = ref([])
const qnaItems = ref([])
const selectedPosts = ref({ qna: [] })

// 로컬서버 여부 확인 및 데이터 로드
onMounted(async () => {
  isLocalhost.value = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  if (isLocalhost.value) {
    await loadData()
  }
})

// 파일명 링크로부터 파일명만 파싱하는 Helper (대문페이지는 'index'로 리턴)
const getFilenameFromLink = (link) => {
  if (link.endsWith('/')) {
    return 'index'
  }
  const parts = link.split('/')
  return parts[parts.length - 1]
}

// 대문 페이지 여부 확인
const isIndexFile = (link) => {
  return link.endsWith('/')
}

// API로부터 사이드바 정보 가져오기
const loadData = async () => {
  try {
    const res = await fetch('/api/data')
    const json = await res.json()
    sidebarData.value = json.sidebar

    // 과목 게시판들 파싱
    const parsedBoards = []
    const parsedQna = []
    const initialSelected = { qna: [] }

    for (const key in json.sidebar) {
      if (key === '/qna/') {
        parsedQna.push(...json.sidebar[key][0].items.filter(item => item.link !== '/qna/'))
      } else if (key.startsWith('/board/') && key !== '/board/') {
        const id = key.replace(/\/board\/([^\/]+)\//, '$1')
        const group = json.sidebar[key][0]
        parsedBoards.push({
          id,
          name: group.text,
          items: group.items
        })
        initialSelected[id] = []
      }
    }

    boards.value = parsedBoards
    qnaItems.value = parsedQna
    selectedPosts.value = initialSelected
  } catch (e) {
    console.error('데이터 로드 실패', e)
  }
}

// 글 수정 시작 (write 페이지로 파라미터 전달하여 이동)
const startEdit = (boardId, item) => {
  const filename = getFilenameFromLink(item.link)
  window.location.href = `/write?editBoard=${boardId}&editFile=${filename}`
}

// 선택 글 다중 삭제 API 호출
const deleteSelected = async (boardId) => {
  const filenames = selectedPosts.value[boardId] || []
  if (filenames.length === 0) return
  
  const hasIndex = filenames.includes('index')
  let confirmMsg = `🗑️ 선택한 ${filenames.length}개의 글을 정말로 삭제하시겠습니까?`
  if (hasIndex) {
    confirmMsg = `⚠️ 대문 페이지(index)가 선택 목록에 포함되어 있습니다. \n대문 페이지는 실제 파일이 삭제되지 않고 내용이 '비어있는 상태'로 초기화됩니다. \n정말로 진행하시겠습니까?`
  }
  
  if (confirm(confirmMsg)) {
    try {
      const res = await fetch('/api/delete-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardId, filenames })
      })
      const json = await res.json()
      if (json.success) {
        alert('성공적으로 삭제/초기화 처리가 완료되었습니다.')
        selectedPosts.value[boardId] = []
        await loadData()
      }
    } catch (e) {
      alert('삭제 중 오류가 발생했습니다.')
    }
  }
}

// 카테고리 전체 삭제 API 호출 (게시판 자체 삭제)
const deleteBoard = async (board) => {
  if (confirm(`⚠️ 경고: '${board.name}' 게시판을 삭제하면 해당 폴더가 내 컴퓨터에서 실제로 영구 삭제되며 복구할 수 없습니다. 정말 삭제하시겠습니까?`)) {
    try {
      const res = await fetch('/api/delete-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardId: board.id, filename: 'index' })
      })
      const json = await res.json()
      if (json.success) {
        alert('게시판 자체 삭제가 완료되었습니다.')
        await loadData()
      }
    } catch (e) {
      alert('삭제 중 오류가 발생했습니다.')
    }
  }
}
</script>

<style scoped>
.cms-header {
  margin-top: 10px;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: var(--vp-c-bg-mute);
  border-radius: 12px;
  border-left: 4px solid var(--vp-c-brand-1);
}
.cms-title {
  margin: 0 0 8px 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  border: none;
}
.cms-subtitle {
  margin: 0;
  font-size: 0.95rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.cms-container {
  font-family: var(--vp-font-family-base);
}

.tab-content {
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
.tab-title {
  margin-top: 0;
  margin-bottom: 20px;
  font-weight: 600;
}

/* 관리 목록 스타일 */
.manage-section {
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 1px dashed var(--vp-c-divider);
}
.manage-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}
.manage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.manage-header h4 {
  margin: 0;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.header-actions {
  display: flex;
  gap: 10px;
}
.manage-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.manage-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  margin-bottom: 8px;
}
.index-item {
  background: var(--vp-c-bg-mute);
  border-style: dashed;
}
.item-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cms-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}
.item-text {
  font-size: 0.95rem;
  color: var(--vp-c-text-1);
}
.item-actions {
  display: flex;
  gap: 8px;
}
.empty-item {
  padding: 12px;
  font-size: 0.9rem;
  color: var(--vp-c-text-3);
  text-align: center;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
  border-radius: 4px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}
.btn-sm:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.btn-edit {
  background: var(--vp-c-brand-2);
  color: #ffffff;
}
.btn-danger {
  background: #f87171;
  color: #ffffff;
}
.btn-danger-dark {
  background: #dc2626;
  color: #ffffff;
}

/* 에러 컨테이너 */
.cms-error {
  margin-top: 24px;
  padding: 24px;
  background: var(--vp-c-warning-bg);
  border: 1px solid var(--vp-c-warning-border);
  border-radius: 8px;
  color: var(--vp-c-warning-text);
}
.cms-error code {
  background: rgba(0,0,0,0.05);
  padding: 2px 6px;
  border-radius: 4px;
}
.cms-error ol {
  margin-top: 10px;
  padding-left: 20px;
}
.cms-error li {
  margin-bottom: 6px;
}
</style>
