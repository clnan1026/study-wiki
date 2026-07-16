# 📚 공동 공부 위키 (Study Wiki)

친구와 함께 선형대수학, 딥러닝, 논문 평가 지표 등을 공부하고 기록하는 공간입니다.  
VitePress로 제작되었으며, LaTeX 수학 공식 렌더링이 내장되어 있습니다.

---

## 🛠️ 로컬에서 실행하고 테스트하기

1. **프로젝트 폴더로 이동**  
   터미널을 열고 본 프로젝트 폴더로 이동합니다.
   ```bash
   cd "/Users/JCLee/Desktop/Important Things/Development/study-wiki"
   ```

2. **패키지 설치**  
   VitePress 구동을 위한 필요한 라이브러리를 설치합니다. (Node.js가 설치되어 있어야 합니다.)
   ```bash
   npm install
   ```

3. **로컬 개발 서버 구동**  
   ```bash
   npm run dev
   ```
   * 실행 후 터미널에 표시되는 주소 (기본값: `http://localhost:5173`)로 브라우저에서 접속하면 작성된 위키를 미리 볼 수 있습니다.
   * 로컬에서 마크다운 파일을 편집하고 저장하면 화면이 실시간으로 반영(Hot Reload)됩니다.

---

## ✍️ 새 글 작성 및 사이드바 등록 방법

1. **문서 추가**  
   `docs` 폴더 내에 마크다운(`.md`) 파일을 생성합니다.  
   * 예: `docs/deep-learning/cnn.md`

2. **메뉴(사이드바)에 등록**  
   [docs/.vitepress/config.mjs](file:///Users/JCLee/Desktop/Important%20Things/Development/study-wiki/docs/.vitepress/config.mjs) 파일을 열어 좌측 메뉴 구조(`sidebar`)에 등록하고자 하는 링크를 추가합니다.
   ```javascript
   // 예시: 딥러닝 사이드바 항목 아래에 추가
   { text: 'CNN 기초 개념', link: '/deep-learning/cnn' }
   ```

3. **수식(LaTeX) 작성 예시**  
   * **인라인 수식**: 문장 중에 `$E=mc^2$`와 같이 앞뒤에 `$` 기호를 한 개씩 감싸 적습니다.
   * **블록 수식**: 수식을 단독 행에 크게 표시하고 싶을 때 앞뒤에 `$$` 기호 두 개로 감쌉니다.
     ```markdown
     $$
     y = \sigma(\mathbf{w}^T \mathbf{x} + b)
     $$
     ```

---

## 🚀 깃허브 배포 가이드 (GitHub Pages)

작성된 글을 자동으로 빌드하여 친구와 공유할 수 있는 무료 웹페이지를 생성하는 과정입니다.

1. **깃허브 저장소 생성 및 친구 초대**  
   * GitHub에서 새로운 Repository를 만듭니다. (공개/비공개 상관없음)
   * 저장소의 `Settings` > `Collaborators`에서 같이 공부할 친구를 공동작업자로 초대합니다.

2. **코드 깃허브로 업로드**  
   터미널에서 아래 명령을 순서대로 실행합니다.
   ```bash
   # git 초기화 및 첫 커밋
   git init
   git add .
   git commit -m "Initialize study wiki templates"
   
   # 기본 브랜치 이름을 main으로 변경
   git branch -M main
   
   # 깃허브 원격 저장소 주소 추가 (본인의 주소로 변경해주세요)
   git remote add origin https://github.com/내_계정이름/저장소_이름.git
   
   # 코드 push
   git push -u origin main
   ```

3. **GitHub Pages 배포 설정 변경 (중요)**  
   * 깃허브 저장소 웹페이지로 이동합니다.
   * 상단 메뉴에서 **Settings** > 좌측 메뉴에서 **Pages**를 클릭합니다.
   * **Build and deployment** 섹션 아래의 **Source** 값을 `Deploy from a branch`에서 **`GitHub Actions`**로 변경합니다.
   * 설정 변경 후, 상단의 **Actions** 탭으로 가보면 자동으로 사이트가 빌드 및 배포되는 과정을 볼 수 있으며, 완료되면 배포된 사이트 링크가 나타납니다!
