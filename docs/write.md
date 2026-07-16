---
layout: page
outline: false
---

<div class="cms-header" v-if="isLocalhost">
<h1 class="cms-title">✏️ 위키 글쓰기 및 카테고리 추가</h1>
<p class="cms-subtitle">새로운 공부 카테고리를 추가하거나, 노션 스타일 편집기에서 마크다운 및 LaTeX 수식을 사용해 학습 노트를 작성하고 편집할 수 있습니다.</p>
</div>

::: warning ⚠️ 실행 환경 안내
이 도구는 **로컬 환경(npm run dev)**에서 실행 중일 때만 작동합니다. 작성 완료 후 터미널에서 **`git push`**를 수행하셔야 깃허브 페이지 웹사이트에 정상적으로 반영됩니다.
:::

<div class="cms-container" v-if="isLocalhost">

<div class="tabs">
<button :class="{ active: activeTab === 'post' }" @click="setTab('post')">📝 글 작성 / 수정</button>
<button :class="{ active: activeTab === 'board' }" @click="setTab('board')">📂 게시판 추가</button>
</div>

<!-- 1. 글 작성 및 수정 탭 -->
<div v-if="activeTab === 'post'" class="tab-content">
<h3 class="tab-title">{{ isEditing ? '✍️ 글 수정하기' : '📝 새 글 작성하기' }}</h3>

<div class="form-group">
<label>게시판 선택</label>
<select v-model="postForm.boardId" :disabled="isEditing" class="cms-select">
<option value="" disabled>글을 등록할 게시판을 선택해 주세요</option>
<option value="qna">💬 QnA (질문과 답변)</option>
<option v-for="board in boards" :key="board.id" :value="board.id">
{{ board.name }}
</option>
</select>
</div>

<div class="form-group">
<label>파일 이름 (영문/하이픈만 허용, 예: matrix-multiplication)</label>
<input 
v-model="postForm.filename" 
type="text" 
:disabled="isEditing" 
placeholder="영문 소문자와 하이픈(-)만 사용해 주세요" 
class="cms-input"
@input="sanitizeFilename"
/>
</div>

<!-- 📎 파일 업로드 영역 -->
<div class="form-group upload-section">
<label>📎 파일 업로드 (PDF, 이미지 등)</label>
<div class="file-upload-wrapper">
<input 
type="file" 
@change="handleFileChange" 
class="cms-file-input" 
/>
<button 
@click="uploadFile" 
class="btn btn-secondary btn-upload" 
:disabled="!selectedFile || isUploading"
>
{{ isUploading ? '업로드 중...' : '업로드 실행' }}
</button>
</div>
<div v-if="uploadedFileUrl" class="upload-result">
<p class="success-text">🎉 파일 업로드 성공! (본문 맨 아래에 자동 삽입되었습니다)</p>
<div class="code-copy-buttons">
<button @click="copyMarkdownLink('image')" class="btn-copy-sm">📋 이미지 마크다운 복사</button>
<button @click="copyMarkdownLink('pdf')" class="btn-copy-sm">📋 PDF 뷰어 코드 복사</button>
<button @click="copyMarkdownLink('file')" class="btn-copy-sm">📋 일반 다운로드 링크 복사</button>
</div>
<p class="info-text">원하는 문구를 복사해서 다른 위치에 수동으로 붙여넣기(Ctrl+V) 하실 수도 있습니다.</p>
</div>
</div>

<!-- 노션 스타일 편집기 영역 -->
<div class="notion-editor">
<input 
v-model="postForm.title" 
type="text" 
placeholder="제목을 입력하세요" 
class="notion-title" 
/>
<div class="editor-divider"></div>
<textarea 
v-model="postForm.content" 
placeholder="이곳에 공부한 내용을 자유롭게 마크다운으로 작성하세요. 수식은 $E=mc^2$ 또는 $$수식$$으로 작성할 수 있습니다." 
class="notion-body"
></textarea>
</div>

<div class="button-group">
<button @click="savePost" class="btn btn-primary" :disabled="!isPostFormValid">
{{ isEditing ? '수정 완료' : '저장하기' }}
</button>
<button @click="cancelEdit" class="btn btn-secondary">
{{ isEditing ? '취소' : '입력 초기화' }}
</button>
</div>
</div>

<!-- 2. 게시판 추가 탭 -->
<div v-if="activeTab === 'board'" class="tab-content">
<h3 class="tab-title">📂 새로운 공부 카테고리(게시판) 추가</h3>

<div class="form-group">
<label>게시판 영문 ID (폴더명으로 사용됩니다. 예: machine-learning)</label>
<input 
v-model="boardForm.boardId" 
type="text" 
placeholder="영문 소문자와 하이픈(-)만 사용해 주세요" 
class="cms-input"
@input="sanitizeBoardId"
/>
</div>

<div class="form-group">
<label>게시판 한글 이름</label>
<input 
v-model="boardForm.boardName" 
type="text" 
placeholder="예: 머신러닝 기초" 
class="cms-input"
/>
</div>

<div class="form-group">
<label>대표 아이콘 (이모지)</label>
<input 
v-model="boardForm.icon" 
type="text" 
placeholder="예: 🤖" 
class="cms-input"
/>
</div>

<div class="button-group">
<button @click="createBoard" class="btn btn-primary" :disabled="!isBoardFormValid">
게시판 생성하기
</button>
</div>
</div>

</div>

<div class="cms-error" v-else>
<p>🚨 현재 이 페이지는 정식 배포된 웹사이트(GitHub Pages 등) 환경에서 조회 중입니다.</p>
<p>웹 브라우저를 통한 직접적인 파일 쓰기/수정 기능은 보안 및 기술적 한계로 인해 **로컬 개발 서버 실행 중일 때만 제공**됩니다.</p>
<p><strong>💡 사용 방법:</strong></p>
<ol>
<li>내 컴퓨터 터미널에서 <code>npm run dev</code>로 로컬 서버를 켭니다.</li>
<li>로컬 주소(<code>http://localhost:5173/write</code>)로 접속하여 글을 작성합니다.</li>
<li>작성이 완료되면 터미널에서 <code>git push</code>를 실행하여 배포 사이트에 업데이트합니다.</li>
</ol>
</div>

<script setup>
import { ref, onMounted, computed } from 'vue'

const isLocalhost = ref(false)
const activeTab = ref('post')
const sidebarData = ref({})
const boards = ref([])

// 글쓰기 폼
const postForm = ref({
  boardId: '',
  filename: '',
  title: '',
  content: ''
})
const isEditing = ref(false)

// 파일 업로드 관련 상태
const selectedFile = ref(null)
const isUploading = ref(false)
const uploadedFileUrl = ref('')
const uploadedFilename = ref('')

// 게시판 폼
const boardForm = ref({
  boardId: '',
  boardName: '',
  icon: '📚'
})

// 로컬서버 여부 확인 및 데이터 로드
onMounted(async () => {
  isLocalhost.value = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  if (isLocalhost.value) {
    await loadData()
    
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    if (tab) {
      activeTab.value = tab
    }
    
    const bId = params.get('boardId')
    if (bId) {
      postForm.value.boardId = bId
    }
    
    const editBoard = params.get('editBoard')
    const editFile = params.get('editFile')
    if (editBoard && editFile) {
      const link = editBoard === 'qna' ? `/qna/${editFile}` : `/board/${editBoard}/${editFile}`
      const simulatedItem = { link: editFile === 'index' ? `/board/${editBoard}/` : link }
      startEdit(editBoard, simulatedItem)
    }
  }
})

// 탭 스위치
const setTab = (tab) => {
  activeTab.value = tab
}

// 파일명 특수문자 및 공백 제거
const sanitizeFilename = () => {
  postForm.value.filename = postForm.value.filename
    .toLowerCase()
    .replace(/[^a-z0-9\-]/g, '')
}

// 게시판 ID 특수문자 및 공백 제거
const sanitizeBoardId = () => {
  boardForm.value.boardId = boardForm.value.boardId
    .toLowerCase()
    .replace(/[^a-z0-9\-]/g, '')
}

// 파일 선택 핸들러
const handleFileChange = (e) => {
  selectedFile.value = e.target.files[0] || null
}

// 파일 업로드 API 호출
const uploadFile = async () => {
  if (!selectedFile.value) return
  isUploading.value = true
  uploadedFileUrl.value = ''
  
  const file = selectedFile.value
  const reader = new FileReader()
  
  reader.onload = async (event) => {
    try {
      const base64Data = event.target.result
      const res = await fetch('/api/upload-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          base64Data
        })
      })
      const json = await res.json()
      if (json.success) {
        uploadedFileUrl.value = json.url
        uploadedFilename.value = json.originalName
        
        // 업로드 성공 시 에디터 본문 내용 맨 하단에 마크다운 코드를 자동으로 추가 삽입합니다!
        const ext = file.name.split('.').pop().toLowerCase()
        let insertText = ''
        
        if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
          insertText = `\n\n![이미지 설명](${json.url})\n`
        } else if (ext === 'pdf') {
          insertText = `\n\n[📎 첨부파일 다운로드: ${file.name}](${json.url})\n\n<iframe src="${json.url}" width="100%" height="800px" style="border: 1px solid var(--vp-c-divider); border-radius: 8px; margin-top: 16px;"></iframe>\n`
        } else {
          insertText = `\n\n[📎 첨부파일 다운로드: ${file.name}](${json.url})\n`
        }
        
        postForm.value.content += insertText
        alert('파일이 업로드되었으며, 본문에 마크다운 코드가 자동 삽입되었습니다!')
      } else {
        alert('업로드 실패: ' + (json.error || '알 수 없는 오류'))
      }
    } catch (e) {
      alert('서버 전송 중 오류가 발생했습니다.')
    } finally {
      isUploading.value = false
    }
  }
  reader.readAsDataURL(file)
}

// 마크다운 링크 클립보드 복사
const copyMarkdownLink = (type) => {
  if (!uploadedFileUrl.value) return
  
  let linkText = ''
  if (type === 'image') {
    linkText = `![이미지 설명](${uploadedFileUrl.value})`
  } else if (type === 'pdf') {
    linkText = `<iframe src="${uploadedFileUrl.value}" width="100%" height="800px" style="border: 1px solid var(--vp-c-divider); border-radius: 8px;"></iframe>`
  } else {
    linkText = `[다운로드: ${uploadedFilename.value}](${uploadedFileUrl.value})`
  }
    
  navigator.clipboard.writeText(linkText)
    .then(() => alert('마크다운 코드가 클립보드에 복사되었습니다! 에디터 창에 붙여넣기(Ctrl+V) 하세요.'))
    .catch(() => alert('클립보드 복사에 실패했습니다. 직접 아래 문구를 드래그 복사해 주세요: ' + linkText))
}

// 글 폼 정방성 확인
const isPostFormValid = computed(() => {
  return postForm.value.boardId && postForm.value.filename && postForm.value.title.trim() && postForm.value.content.trim()
})

// 게시판 폼 정방성 확인
const isBoardFormValid = computed(() => {
  return boardForm.value.boardId && boardForm.value.boardName.trim()
})

// API로부터 사이드바 정보 가져오기
const loadData = async () => {
  try {
    const res = await fetch('/api/data')
    const json = await res.json()
    sidebarData.value = json.sidebar

    const parsedBoards = []
    for (const key in json.sidebar) {
      if (key.startsWith('/board/') && key !== '/board/') {
        const id = key.replace(/\/board\/([^\/]+)\//, '$1')
        const group = json.sidebar[key][0]
        parsedBoards.push({
          id,
          name: group.text
        })
      }
    }
    boards.value = parsedBoards
  } catch (e) {
    console.error('데이터 로드 실패', e)
  }
}

// 게시판 생성 API 호출
const createBoard = async () => {
  try {
    const res = await fetch('/api/create-board', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(boardForm.value)
    })
    const json = await res.json()
    if (json.success) {
      alert(`📂 '${boardForm.value.boardName}' 게시판이 성공적으로 추가되었습니다!`)
      boardForm.value.boardId = ''
      boardForm.value.boardName = ''
      boardForm.value.icon = '📚'
      await loadData()
      activeTab.value = 'post'
    }
  } catch (e) {
    alert('게시판 생성 중 오류가 발생했습니다.')
  }
}

// 글 저장 API 호출 (신규 작성 & 수정 공용)
const savePost = async () => {
  try {
    const res = await fetch('/api/save-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...postForm.value,
        isNew: !isEditing.value
      })
    })
    const json = await res.json()
    if (json.success) {
      alert(isEditing.value ? '✍️ 글이 정상적으로 수정되었습니다!' : '🎉 새 글이 성공적으로 등록되었습니다!')
      
      const link = json.link
      cancelEdit()
      await loadData()
      
      window.location.href = link
    }
  } catch (e) {
    alert('글 저장 중 오류가 발생했습니다.')
  }
}

// 글 수정 시작 (기존 정보 불러오기)
const startEdit = async (boardId, item) => {
  isEditing.value = true
  activeTab.value = 'post'
  
  let filename = ''
  let fetchUrl = ''
  
  if (item.link.endsWith('/')) {
    filename = 'index'
    fetchUrl = `${item.link}index.md`
  } else {
    const linkParts = item.link.split('/')
    filename = linkParts[linkParts.length - 1]
    fetchUrl = `${item.link}.md`
  }
  
  postForm.value.boardId = boardId
  postForm.value.filename = filename

  try {
    const response = await fetch(fetchUrl)
    const text = await response.text()
    
    const titleMatch = text.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1] : ''
    const content = text.replace(/^#\s+.+$/m, '').trim()

    postForm.value.title = title
    postForm.value.content = content
  } catch (e) {
    alert('기존 글 내용을 불러오는데 실패했습니다.')
  }
}

// 수정 취소 및 초기화
const cancelEdit = () => {
  isEditing.value = false
  postForm.value = {
    boardId: '',
    filename: '',
    title: '',
    content: ''
  }
  selectedFile.value = null
  uploadedFileUrl.value = ''
  uploadedFilename.value = ''
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

/* 탭 바 */
.tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 8px;
  margin-bottom: 24px;
}
.tabs button {
  padding: 8px 16px;
  border: none;
  background: none;
  font-weight: 500;
  color: var(--vp-c-text-2);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}
.tabs button:hover {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
}
.tabs button.active {
  background: var(--vp-c-brand-1);
  color: #ffffff;
}

/* 탭 컨텐츠 */
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

/* 폼 요소 */
.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 6px;
  color: var(--vp-c-text-1);
}
.cms-input, .cms-select {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  outline: none;
  font-size: 0.95rem;
}
.cms-input:focus, .cms-select:focus {
  border-color: var(--vp-c-brand-1);
}

/* 파일 업로드 스타일 */
.upload-section {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 14px;
}
.file-upload-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cms-file-input {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}
.btn-upload {
  font-size: 0.85rem;
  padding: 8px 14px !important;
}
.upload-result {
  margin-top: 12px;
  padding: 10px 12px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
}
.success-text {
  font-size: 0.85rem;
  color: #10b981;
  font-weight: 600;
  margin: 0 0 8px 0;
}
.code-copy-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 6px;
}
.btn-copy-sm {
  background: var(--vp-c-brand-2);
  color: #ffffff;
  border: none;
  font-size: 0.8rem;
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
}
.info-text {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
}

/* 노션 스타일 편집기 */
.notion-editor {
  margin-top: 30px;
  padding: 24px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
.notion-title {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  padding: 0;
  margin-bottom: 12px;
}
.notion-title::placeholder {
  color: var(--vp-c-text-3);
}
.editor-divider {
  height: 1px;
  background: var(--vp-c-divider);
  margin-bottom: 20px;
}
.notion-body {
  width: 100%;
  min-height: 350px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--vp-c-text-1);
  resize: vertical;
  padding: 0;
  font-family: var(--vp-font-family-base);
}
.notion-body::placeholder {
  color: var(--vp-c-text-3);
}

/* 버튼 스타일 */
.button-group {
  margin-top: 24px;
  display: flex;
  gap: 12px;
}
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn:hover {
  opacity: 0.9;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-primary {
  background: var(--vp-c-brand-1);
  color: #ffffff;
}
.btn-secondary {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
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
