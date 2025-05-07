
멘토링 기수 관련 API:

GET    /api/cohorts          - 모든 기수 조회
GET    /api/cohorts/:id      - 특정 기수 조회
POST   /api/cohorts          - 새 기수 생성
PUT    /api/cohorts/:id      - 기수 정보 수정
DELETE /api/cohorts/:id      - 기수 삭제


멘토링 과목 관련 API:
GET    /api/subjects                    - 모든 과목 조회
GET    /api/subjects/cohort/:cohortId   - 특정 기수의 과목 조회
GET    /api/subjects/:id                - 특정 과목 조회
POST   /api/subjects                    - 새 과목 생성
PUT    /api/subjects/:id                - 과목 정보 수정
DELETE /api/subjects/:id                - 과목 삭제


게시판 관련 API:
GET    /api/boards/subject/:subjectId           - 과목의 모든 게시물 조회
GET    /api/boards/subject/:subjectId/type/:type - 과목의 특정 타입 게시물 조회
GET    /api/boards/:id                          - 특정 게시물 조회
POST   /api/boards                              - 새 게시물 생성
PUT    /api/boards/:id                          - 게시물 수정
DELETE /api/boards/:id                          - 게시물 삭제


게시물 생성 시 필요한 데이터 형식:
{
  "subjectId": "과목ID",
  "type": "progress|materials|qa|notice|suggestion",
  "title": "게시물 제목",
  "content": "게시물 내용",
  "author": "작성자 이름",
  "week": 1,  // progress 타입일 때만 필요
  "attachments": [  // 선택사항
    {
      "filename": "파일명.pdf",
      "url": "파일URL",
      "uploadedAt": "2024-03-14T12:00:00Z"
    }
  ]
}


구조를 설명드리면:
1. 기수(Cohort) 관리
    예: 36기, 37기 등
    각 기수는 시작일, 종료일, LMS URL, Fun시스템 URL을 가짐
    현재 활성화된 기수인지 여부도 관리 (isActive)
2. 과목(Subject) 관리
    각 기수 아래에 여러 과목들이 존재
    예: 36기 아래에 "자바스크립트 기초", "리액트 심화" 등
    각 과목은 멘토와 멘티들의 정보를 포함
3. 게시판(Board) 관리
    각 과목 안에 4가지 타입의 게시판이 존재:
    progress: 멘토링 진행 게시판 (주차별 진행사항)
    materials: 멘토링 자료 게시판
    qa: Q&A 게시판
    notice: 공지사항 게시판
    suggestion: 건의 게시판

예시 데이터 흐름
36기 (Cohort)
├── 자바스크립트 기초 (Subject)
│   ├── 진행 게시판 (Board type: progress)
│   │   ├── 1주차 진행사항
│   │   ├── 2주차 진행사항
│   │   └── ...
│   ├── 자료 게시판 (Board type: materials)
│   │   ├── 강의 자료 1
│   │   ├── 강의 자료 2
│   │   └── ...
│   ├── Q&A 게시판 (Board type: qa)
│   │   ├── 질문 1
│   │   ├── 질문 2
│   │   └── ...
│   └── 공지사항 (Board type: notice)
│       ├── 공지 1
│       ├── 공지 2
│       └── ...
└── 리액트 심화 (Subject)
    ├── 진행 게시판
    ├── 자료 게시판
    ├── Q&A 게시판
    └── 공지사항

