import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import AdminActions from './components/AdminActions.vue'
import QnaAnswerBox from './components/QnaAnswerBox.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // 문서 본문 시작 지점에 CMS 관리 액션 바 삽입
      'doc-before': () => h(AdminActions),
      // 문서 본문 종료 지점에 QnA 답변 입력 영역 삽입
      'doc-after': () => h(QnaAnswerBox)
    })
  }
}
