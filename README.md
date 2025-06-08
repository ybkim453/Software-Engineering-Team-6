# Software-Engineering-Team-6

본 레포지토리는 사용자가 원하는 날짜에 예약을 할 수 있는 웹 기반 레스토랑 예약 시스템을 구현하는 코드를 제공한다.

---
## 프로젝트 개요
* **목표**: 사용자가 원하는 날짜에 예약을 할 수 있는 웹 기반 레스토랑 예약 시스템 웹사이트 만들기
* **주요 기능**
    * **회원기능**: 사용자는 웹 브라우저를 통해 회원가입, 로그인, 로그아웃을 할 수 있다.
    * **테이블 조회**: 로그인한 사용자는 테이블의 위치와 수용 인원이 포함된 예약 가능 테이블을 조회할 수 있다.
    * **예약 기능**: 로그인한 사용자는 한 달 이내의 날짜에 대해 정보를 입력하고 테이블을 예약할 수 있다.
    * **예약 취소 기능**: 사용자는 자신의 예약을 최소 하루 전까지 직접 취소할 수 있다.


## 기술 스택 & Tools

### 협업
![js](https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=white) ![js](https://img.shields.io/badge/GIT-E44C30?style=for-the-badge&logo=git&logoColor=white) ![js](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)

### Frontend
![js](https://img.shields.io/badge/HTML-239120?style=for-the-badge&logo=html5&logoColor=white) ![js](https://img.shields.io/badge/CSS-239120?&style=for-the-badge&logo=css3&logoColor=white) ![js](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=white) ![js](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

### Backend
![js](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white) ![js](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white) ![js](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)


## ⚙️ 환경 세팅 & 실행 방법

### 1. 사전 준비

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Backend
```bash
cd backend
pip install -r requirements.txt
```

### 2. 실행

#### Frontend
```bash
npm run dev
```

#### Backend
```bash
python main.py
```


## 폴더 구조
```
📁 Software-Engineering-Team-6/
├── backend/                                       # 🐍 Flask 백엔드
│   ├── app.py                                     # Flask 실행 파일
│   ├── database/                                  # DB 연결 및 초기화
│   │   └── db.py               
│   ├── models/                                    # SQLAlchemy 모델 정의
│   ├── routes/                                    # Flask 라우팅
│   ├── services/                                  # 비즈니스 로직 처리
│   ├── utils/                                     # 공통 유틸리티 함수
│   │   └── validators.py               
│   └── requirements.txt                           # 필요 패키지 목록
│
├── frontend/                                      # ⚛️ React 프론트엔드
│   └── restaurant_reservation/
│       ├── public/
│       │   └── vite.svg
│       ├── src/
│       │   ├── assets/                            # 이미지, 아이콘 등
│       │   ├── components/                        # 공통 컴포넌트
│       │   ├── contexts/                          # 전역 상태
│       │   ├── pages/                             # 페이지별 컴포넌트
│       │   ├── routes/                            # react-router-dom 라우팅
│       │   ├── services/                          # axios 기반 API 호출 모듈
│       │   ├── styles/                            # 전역 스타일 및 모듈 CSS
│       │   ├── App.jsx
│       │   ├── main.jsx
│       │   └── index.css
│       ├── index.html
│       └── vite.config.js
├── rest_client/                                   # REST API 테스트용
└── README.md
```


