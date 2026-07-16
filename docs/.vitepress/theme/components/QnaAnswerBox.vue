<template>
  <div v-if="isQnaPost" class="qna-answer-section">
    <div class="answers-header">
      <h3>💬 답변 작성하기</h3>
    </div>
    
    <div v-if="isLocalhost" class="answer-form">
      <div class="form-row">
        <input 
          v-model="writer" 
          type="text" 
          placeholder="작성자 이름 (예: 나 / 친구이름)" 
          class="writer-input" 
        />
      </div>
      <textarea 
        v-model="content" 
        placeholder="질문에 대한 답변을 입력해 주세요. 마크다운 및 수식 사용이 가능합니다." 
        class="answer-textarea"
      ></textarea>
      <button @click="submitAnswer" class="btn-submit" :disabled="!isValid">
        답변 등록
      </button>
    </div>
    
    <div v-else class="production-notice">
      💡 답변 작성은 로컬 개발 서버(npm run dev)에서 가능하며, 작성 완료 후 git push 하시면 여기에 게시됩니다.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const isLocalhost = ref(false)
const writer = ref('')
const content = ref('')

onMounted(() => {
  isLocalhost.value = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
})

const path = computed(() => route.path)

// QnA 상세 글인지 판별
const isQnaPost = computed(() => {
  const p = path.value
  const qnaPostMatch = p.match(/^\/qna\/([^\/]+)(\.html)?$/)
  return qnaPostMatch && qnaPostMatch[1] !== 'index'
})

const filename = computed(() => {
  const p = path.value
  const qnaPostMatch = p.match(/^\/qna\/([^\/]+)/)
  return qnaPostMatch ? qnaPostMatch[1].replace(/\.html$/, '') : ''
})

const isValid = computed(() => {
  return writer.value.trim() && content.value.trim()
})

const submitAnswer = async () => {
  if (!isValid.value) return
  
  try {
    const res = await fetch('/api/add-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: filename.value,
        writer: writer.value.trim(),
        content: content.value.trim()
      })
    })
    const json = await res.json()
    if (json.success) {
      alert('답변이 등록되었습니다!')
      content.value = ''
      // Reload current page to see the appended answer
      window.location.reload()
    }
  } catch (e) {
    alert('답변 등록에 실패했습니다.')
  }
}
</script>

<style scoped>
.qna-answer-section {
  margin-top: 40px;
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 24px;
}
.answers-header h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.answer-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 16px;
}
.writer-input {
  width: 250px;
  padding: 8px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  outline: none;
  font-size: 0.9rem;
}
.writer-input:focus {
  border-color: var(--vp-c-brand-1);
}
.answer-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  outline: none;
  font-size: 0.95rem;
  resize: vertical;
  font-family: var(--vp-font-family-base);
}
.answer-textarea:focus {
  border-color: var(--vp-c-brand-1);
}
.btn-submit {
  align-self: flex-start;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  background: var(--vp-c-brand-1);
  color: #ffffff;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-submit:hover {
  opacity: 0.9;
}
.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.production-notice {
  padding: 16px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}
</style>
