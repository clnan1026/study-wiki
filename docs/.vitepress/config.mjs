import { defineConfig } from 'vitepress'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const sidebarPath = path.resolve(__dirname, '../sidebar.json')

// sidebar.json 파일 읽기 Helper
const readSidebar = () => {
  try {
    return JSON.parse(fs.readFileSync(sidebarPath, 'utf-8'))
  } catch (err) {
    console.error("sidebar.json 읽기 실패, 빈 구조로 대체합니다.", err)
    return {}
  }
}

// QnA index.md를 sidebar.json을 기반으로 자동 재빌드하는 Helper
const rebuildQnaIndex = () => {
  const sidebar = readSidebar()
  let listItems = ''
  if (sidebar['/qna/'] && sidebar['/qna/'][0]) {
    const items = sidebar['/qna/'][0].items.filter(item => item.link !== '/qna/')
    for (const item of items) {
      listItems += `*   [${item.text}](${item.link})\n`
    }
  }
  
  const content = `# 💬 QnA (질문과 답변)

공부하면서 해결되지 않았거나 헷갈리는 질문을 남기고 자유롭게 답글로 토론하는 공간입니다.

---

## 📌 이용 규칙
1. 질문하고자 하는 내용(수식, 코드 에러, 개념 등)을 마크다운 문법으로 자유롭게 적어주세요.
2. 친구의 질문 글을 확인하고 알고 있는 내용이 있다면 댓글이나 내용을 수정해 답변을 보완해 줍니다.

---

## 🙋 최근 올라온 질문

${listItems || '*   **[질문 대기 중]**\n    *아직 등록된 질문이 없습니다. 공부하다가 막히는 부분이 생기면 여기에 질문 글을 새로 작성해 주세요!*'}`

  fs.writeFileSync(path.resolve(__dirname, '../qna/index.md'), content, 'utf-8')
}

// sidebar.json 파일 쓰기 Helper (VitePress 설정 리로드 유도를 위해 config.mjs 터치)
const writeSidebar = (data) => {
  fs.writeFileSync(sidebarPath, JSON.stringify(data, null, 2), 'utf-8')
  rebuildBoardIndex()
  rebuildQnaIndex()
  const configPath = path.resolve(__dirname, './config.mjs')
  const now = new Date()
  try {
    fs.utimesSync(configPath, now, now)
  } catch (err) {
    let content = fs.readFileSync(configPath, 'utf-8')
    fs.writeFileSync(configPath, content, 'utf-8')
  }
}

// 공부게시판 index.md를 sidebar.json을 기반으로 자동 재빌드하는 Helper
const rebuildBoardIndex = () => {
  const sidebar = readSidebar()
  let listItems = ''
  for (const key in sidebar) {
    if (key.startsWith('/board/') && key !== '/board/') {
      const group = sidebar[key][0]
      listItems += `*   [${group.text}](${key})\n`
    }
  }
  
  const content = `# 📋 공부게시판

친구와 함께 공부한 내용을 기록하고 분류하는 공간입니다. 아래의 과목 폴더를 클릭하여 학습 노트를 확인하세요.

::: info 💡 과목별 문서 및 수식 사용 안내
각 과목 문서 안에서는 복잡한 수학 공식(LaTeX)이 자동으로 깔끔하게 렌더링되어 보입니다.
새로운 과목을 추가하려면 아래의 **새 공부 카테고리 추가** 버튼을 클릭해 보세요.
:::

## 📂 과목 목록

${listItems || '*   *등록된 공부 카테고리가 없습니다.*'}`
  
  fs.writeFileSync(path.resolve(__dirname, '../board/index.md'), content, 'utf-8')
}

export default defineConfig({
  title: "공부 위키",
  description: "선형대수학, 딥러닝, 논문 평가 지표 등을 기록하고 공유하는 공간",
  lang: 'ko-KR',
  markdown: {
    math: true
  },
  themeConfig: {
    siteTitle: '📚 공부 위키',
    
    nav: [
      { text: '홈', link: '/' },
      { text: '공부게시판', link: '/board/' },
      { text: 'QnA', link: '/qna/' }
    ],

    sidebar: readSidebar(),

    socialLinks: [
      { icon: 'github', link: 'https://github.com' }
    ],

    footer: {
      message: '친구와 함께하는 공동 공부방',
      copyright: 'Copyright © 2026'
    },

    darkModeSwitchLabel: '화면 테마',
    sidebarMenuLabel: '목차',
    returnToTopLabel: '맨 위로',
    outlineTitle: '현재 페이지 목차',
    
    docFooter: {
      prev: '이전 글',
      next: '다음 글'
    }
  },

  // Vite 개발 서버용 로컬 파일 조작 API 미들웨어 세팅
  vite: {
    plugins: [
      {
        name: 'vitepress-local-cms-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
            
            // 1. GET /api/data : 사이드바 및 보드 구조 조회
            if (req.method === 'GET' && url.pathname === '/api/data') {
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify({ sidebar: readSidebar() }))
              return
            }

            // POST 요청에 대한 Body 파싱 및 API 핸들러
            if (req.method === 'POST') {
              let body = ''
              req.on('data', chunk => { body += chunk })
              req.on('end', async () => {
                let data = {}
                try {
                  data = JSON.parse(body || '{}')
                } catch (e) {
                  res.statusCode = 400
                  res.end('Invalid JSON')
                  return
                }

                res.setHeader('Content-Type', 'application/json; charset=utf-8')

                // 2. POST /api/create-board : 게시판 카테고리 폴더 생성
                if (url.pathname === '/api/create-board') {
                  const { boardId, boardName, icon } = data
                  const boardPath = path.resolve(__dirname, `../board/${boardId}`)
                  
                  // 폴더 생성
                  if (!fs.existsSync(boardPath)) {
                    fs.mkdirSync(boardPath, { recursive: true })
                  }
                  
                  // 기본 index.md 생성
                  const indexContent = `# ${icon} ${boardName}\n\n이곳은 ${boardName} 게시판입니다. 공부한 내용을 아래에 기록해 보세요.\n`
                  fs.writeFileSync(path.resolve(boardPath, 'index.md'), indexContent, 'utf-8')

                  // sidebar.json 추가
                  const sidebar = readSidebar()
                  const key = `/board/${boardId}/`
                  sidebar[key] = [
                    {
                      text: `${icon} ${boardName}`,
                      collapsed: false,
                      items: [
                        { text: '소개 및 개요', link: `/board/${boardId}/` }
                      ]
                    }
                  ]
                  writeSidebar(sidebar)
                  rebuildBoardIndex()

                  res.end(JSON.stringify({ success: true, link: key }))
                  return
                }

                // 3. POST /api/save-post : 마크다운 게시글 생성 및 수정
                if (url.pathname === '/api/save-post') {
                  const { boardId, filename, title, content, isNew } = data
                  
                  let folderPath = ''
                  let linkPath = ''
                  let sidebarKey = ''

                  if (boardId === 'qna') {
                    folderPath = path.resolve(__dirname, '../qna')
                    linkPath = `/qna/${filename}`
                    sidebarKey = '/qna/'
                  } else {
                    folderPath = path.resolve(__dirname, `../board/${boardId}`)
                    linkPath = filename === 'index' ? `/board/${boardId}/` : `/board/${boardId}/${filename}`
                    sidebarKey = `/board/${boardId}/`
                  }

                  // 파일 생성/덮어쓰기
                  const fileContent = `# ${title}\n\n${content}\n`
                  fs.writeFileSync(path.resolve(folderPath, `${filename}.md`), fileContent, 'utf-8')

                  // sidebar.json 링크 목록 업데이트
                  const sidebar = readSidebar()
                  if (sidebar[sidebarKey] && sidebar[sidebarKey][0]) {
                    const items = sidebar[sidebarKey][0].items
                    const existingIndex = items.findIndex(item => item.link === linkPath)

                    if (existingIndex > -1) {
                      // 기존 글 수정 시 제목 업데이트
                      items[existingIndex].text = title
                    } else {
                      // 새 글 등록 시 추가
                      items.push({ text: title, link: linkPath })
                    }
                    writeSidebar(sidebar)
                  }

                  res.end(JSON.stringify({ success: true, link: linkPath }))
                  return
                }

                // 7. POST /api/upload-file : 파일 업로드 (Base64)
                if (url.pathname === '/api/upload-file') {
                  const { filename, base64Data } = data
                  const matches = base64Data.match(/^data:(.+);base64,(.+)$/)
                  if (!matches) {
                    res.statusCode = 400
                    res.end(JSON.stringify({ error: 'Invalid base64 data format' }))
                    return
                  }
                  
                  const buffer = Buffer.from(matches[2], 'base64')
                  
                  // Ensure docs/public/uploads exists
                  const uploadDir = path.resolve(__dirname, '../public/uploads')
                  if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true })
                  }
                  
                  const ext = path.extname(filename)
                  const base = path.basename(filename, ext)
                  // 파일명 특수문자 및 자소분리(NFD/NFC) 오류 방지를 위한 정제 작업
                  const cleanBase = base
                    .normalize('NFD')
                    .replace(/[^a-zA-Z0-9\-_]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '')
                  const uniqueFilename = `${cleanBase || 'upload'}-${Date.now()}${ext}`
                  
                  const filePath = path.resolve(uploadDir, uniqueFilename)
                  fs.writeFileSync(filePath, buffer)
                  
                  const fileUrl = `/uploads/${uniqueFilename}`
                  res.end(JSON.stringify({ success: true, url: fileUrl, originalName: filename }))
                  return
                }

                // 4. POST /api/delete-post : 게시글 또는 전체 게시판 삭제
                if (url.pathname === '/api/delete-post') {
                  const { boardId, filename } = data

                  const sidebar = readSidebar()

                  if (filename === 'index') {
                    // 4-1. 게시판(폴더) 전체 삭제
                    const boardPath = path.resolve(__dirname, `../board/${boardId}`)
                    if (fs.existsSync(boardPath)) {
                      fs.rmSync(boardPath, { recursive: true, force: true })
                    }
                    
                    const sidebarKey = `/board/${boardId}/`
                    delete sidebar[sidebarKey]
                    writeSidebar(sidebar)
                    rebuildBoardIndex()

                    res.end(JSON.stringify({ success: true, redirect: '/board/' }))
                    return
                  } else {
                    // 4-2. 개별 글 삭제
                    let filePath = ''
                    let linkPath = ''
                    let sidebarKey = ''

                    if (boardId === 'qna') {
                      filePath = path.resolve(__dirname, `../qna/${filename}.md`)
                      linkPath = `/qna/${filename}`
                      sidebarKey = '/qna/'
                    } else {
                      filePath = path.resolve(__dirname, `../board/${boardId}/${filename}.md`)
                      linkPath = `/board/${boardId}/${filename}`
                      sidebarKey = `/board/${boardId}/`
                    }

                    if (fs.existsSync(filePath)) {
                      fs.unlinkSync(filePath)
                    }

                    if (sidebar[sidebarKey] && sidebar[sidebarKey][0]) {
                      const items = sidebar[sidebarKey][0].items
                      sidebar[sidebarKey][0].items = items.filter(item => item.link !== linkPath)
                      writeSidebar(sidebar)
                    }

                    res.end(JSON.stringify({ success: true, redirect: sidebarKey }))
                    return
                  }
                }

                // 5. POST /api/delete-posts : 여러 개의 글 선택 일괄 삭제
                if (url.pathname === '/api/delete-posts') {
                  const { boardId, filenames } = data
                  const sidebar = readSidebar()
                  const sidebarKey = boardId === 'qna' ? '/qna/' : `/board/${boardId}/`

                  for (const filename of filenames) {
                    if (filename === '' || filename === 'index') {
                      // 대문 페이지 초기화 (삭제 대신 비어있는 대문 페이지로 초기화)
                      const indexPath = path.resolve(__dirname, `../board/${boardId}/index.md`)
                      if (fs.existsSync(indexPath) && sidebar[sidebarKey] && sidebar[sidebarKey][0]) {
                        const boardTitle = sidebar[sidebarKey][0].text
                        const content = `# ${boardTitle}\n\n이 게시판은 비어있습니다. 새로운 글을 작성해 보세요!\n`
                        fs.writeFileSync(indexPath, content, 'utf-8')
                        // 사이드바의 첫 번째 항목(대문 링크) 텍스트를 '소개 및 개요'로 변경
                        sidebar[sidebarKey][0].items[0].text = '소개 및 개요'
                      }
                    } else {
                      let filePath = ''
                      let linkPath = ''

                      if (boardId === 'qna') {
                        filePath = path.resolve(__dirname, `../qna/${filename}.md`)
                        linkPath = `/qna/${filename}`
                      } else {
                        filePath = path.resolve(__dirname, `../board/${boardId}/${filename}.md`)
                        linkPath = `/board/${boardId}/${filename}`
                      }

                      if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath)
                      }

                      if (sidebar[sidebarKey] && sidebar[sidebarKey][0]) {
                        const items = sidebar[sidebarKey][0].items
                        sidebar[sidebarKey][0].items = items.filter(item => item.link !== linkPath)
                      }
                    }
                  }

                  writeSidebar(sidebar)
                  res.end(JSON.stringify({ success: true }))
                  return
                }

                // 6. POST /api/add-answer : QnA 질문에 답변 추가
                if (url.pathname === '/api/add-answer') {
                  const { filename, writer, content } = data
                  const filePath = path.resolve(__dirname, `../qna/${filename}.md`)

                  if (fs.existsSync(filePath)) {
                    const appendText = `\n---\n\n### 💬 답변 (작성자: ${writer})\n\n${content}\n`
                    fs.appendFileSync(filePath, appendText, 'utf-8')
                    
                    // Touch config.mjs to trigger HMR reload of this page
                    const configPath = path.resolve(__dirname, './config.mjs')
                    const now = new Date()
                    try {
                      fs.utimesSync(configPath, now, now)
                    } catch (e) {}
                    
                    res.end(JSON.stringify({ success: true }))
                  } else {
                    res.statusCode = 404
                    res.end('File Not Found')
                  }
                  return
                }

                // 매칭 안 될 시 통과
                res.statusCode = 404
                res.end('Not Found')
              })
              return
            }

            next()
          })
        }
      }
    ]
  }
})
