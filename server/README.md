# 커피 주문 앱 백엔드 서버

Express.js를 사용한 RESTful API 서버입니다.

## 설치

```bash
npm install
```

## 환경 변수 설정

`.env` 파일에 필요한 환경 변수를 설정하세요.

```bash
# 서버 포트 설정
PORT=3000

# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=5432
DB_NAME=order_app
DB_USER=postgres
DB_PASSWORD=your_password

# 환경 설정
NODE_ENV=development
```

**데이터베이스 설정 방법**:
1. PostgreSQL이 실행 중인지 확인
2. 데이터베이스 생성: `createdb order_app` (또는 psql에서 `CREATE DATABASE order_app;`)
3. `.env` 파일에 위의 데이터베이스 정보를 입력

## 실행

### 개발 모드 (nodemon 사용)
```bash
npm run dev
```

### 프로덕션 모드
```bash
npm start
```

서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## API 엔드포인트

### 메뉴 관련
- `GET /api/menus` - 메뉴 목록 조회
- `GET /api/menus/:id` - 특정 메뉴 조회
- `PATCH /api/menus/:id/stock` - 재고 수정

### 주문 관련
- `POST /api/orders` - 주문 생성
- `GET /api/orders` - 주문 목록 조회
- `GET /api/orders/:id` - 특정 주문 조회
- `PATCH /api/orders/:id/status` - 주문 상태 변경

## 기술 스택

- Node.js
- Express.js
- PostgreSQL
- pg (PostgreSQL 클라이언트)

