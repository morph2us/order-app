# Render.com 배포 가이드

이 문서는 커피 주문 앱을 Render.com에 배포하는 방법을 설명합니다.

## 배포 순서

### 1단계: PostgreSQL 데이터베이스 생성

1. **Render.com 대시보드 접속**
   - https://dashboard.render.com 접속
   - 로그인 또는 회원가입

2. **PostgreSQL 데이터베이스 생성**
   - "New +" 버튼 클릭
   - "PostgreSQL" 선택
   - 다음 정보 입력:
     - **Name**: `coffee-order-db` (또는 원하는 이름)
     - **Database**: `coffee_order_db`
     - **User**: `postgres` (기본값)
     - **Region**: 가장 가까운 지역 선택 (예: `Singapore`)
     - **PostgreSQL Version**: 최신 버전 선택
     - **Plan**: Free tier 선택 (또는 유료 플랜)
   - "Create Database" 클릭

3. **데이터베이스 정보 저장**
   - 생성 후 표시되는 **Internal Database URL** 복사
   - 예: `postgresql://postgres:password@dpg-xxxxx-a.singapore-postgres.render.com/coffee_order_db`
   - 이 정보는 다음 단계에서 사용됩니다.

4. **데이터베이스 초기화 (선택사항)**
   - 로컬에서 데이터베이스 스키마를 생성하려면:
   ```bash
   # 로컬에서 .env 파일에 Render 데이터베이스 URL 설정
   DB_HOST=dpg-xxxxx-a.singapore-postgres.render.com
   DB_PORT=5432
   DB_NAME=coffee_order_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   # 스키마 생성 및 초기 데이터 삽입
   cd server
   node src/db/init.js
   ```

---

### 2단계: 백엔드 서버 배포

1. **GitHub 저장소 준비**
   - 프로젝트를 GitHub에 푸시
   - 저장소 URL 확인

2. **Render.com에서 Web Service 생성**
   - "New +" 버튼 클릭
   - "Web Service" 선택
   - GitHub 저장소 연결
   - 다음 정보 입력:
     - **Name**: `coffee-order-api` (또는 원하는 이름)
     - **Region**: 데이터베이스와 같은 지역 선택
     - **Branch**: `main` (또는 기본 브랜치)
     - **Root Directory**: `server`
     - **Runtime**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free tier 선택

3. **환경 변수 설정**
   - "Environment" 탭으로 이동
   - 다음 환경 변수 추가:
     ```
     PORT=10000
     NODE_ENV=production
     DB_HOST=dpg-xxxxx-a.singapore-postgres.render.com
     DB_PORT=5432
     DB_NAME=coffee_order_db
     DB_USER=postgres
     DB_PASSWORD=your_password_from_database
     ```
   - **주의**: `DB_PASSWORD`는 1단계에서 생성한 데이터베이스의 비밀번호입니다.

4. **서비스 생성 및 배포**
   - "Create Web Service" 클릭
   - 자동으로 빌드 및 배포 시작
   - 배포 완료 후 서비스 URL 확인 (예: `https://coffee-order-api.onrender.com`)

5. **데이터베이스 초기화**
   - 배포 완료 후, 서비스가 실행 중이면:
   - Render.com의 서비스 터미널에서:
     ```bash
     node src/db/init.js
     ```
   - 또는 로컬에서 Render 데이터베이스에 직접 연결하여 실행

---

### 3단계: 프런트엔드 배포

1. **Static Site 생성**
   - "New +" 버튼 클릭
   - "Static Site" 선택
   - GitHub 저장소 연결
   - 다음 정보 입력:
     - **Name**: `coffee-order-app` (또는 원하는 이름)
     - **Branch**: `main` (또는 기본 브랜치)
     - **Root Directory**: `ui`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`
     - **Plan**: Free tier 선택

2. **환경 변수 설정**
   - "Environment" 탭으로 이동
   - 다음 환경 변수 추가:
     ```
     VITE_API_BASE_URL=https://coffee-order-api.onrender.com
     ```
   - **주의**: `coffee-order-api.onrender.com`은 2단계에서 생성한 백엔드 서비스 URL입니다.

3. **서비스 생성 및 배포**
   - "Create Static Site" 클릭
   - 자동으로 빌드 및 배포 시작
   - 배포 완료 후 사이트 URL 확인 (예: `https://coffee-order-app.onrender.com`)

---

## 배포 후 확인 사항

### 1. 백엔드 API 확인
```bash
# API 서버 상태 확인
curl https://coffee-order-api.onrender.com/

# 메뉴 목록 확인
curl https://coffee-order-api.onrender.com/api/menus
```

### 2. 프런트엔드 확인
- 브라우저에서 프런트엔드 URL 접속
- 주문하기 화면에서 메뉴가 정상적으로 로드되는지 확인
- 관리자 화면에서 주문 현황이 정상적으로 표시되는지 확인

### 3. 데이터베이스 연결 확인
- 백엔드 서비스 로그에서 데이터베이스 연결 메시지 확인
- API를 통해 데이터가 정상적으로 조회되는지 확인

---

## 문제 해결

### 백엔드 서비스가 시작되지 않는 경우
1. **환경 변수 확인**: 모든 필수 환경 변수가 설정되었는지 확인
2. **로그 확인**: Render.com 대시보드의 "Logs" 탭에서 에러 메시지 확인
3. **데이터베이스 연결 확인**: 데이터베이스 URL과 비밀번호가 정확한지 확인

### 프런트엔드에서 API 호출 실패
1. **CORS 설정 확인**: 백엔드의 CORS 설정이 프런트엔드 도메인을 허용하는지 확인
2. **API URL 확인**: `VITE_API_BASE_URL` 환경 변수가 올바른지 확인
3. **네트워크 탭 확인**: 브라우저 개발자 도구의 Network 탭에서 실제 요청 URL 확인

### 데이터베이스 연결 실패
1. **Internal Database URL 사용**: Render.com의 PostgreSQL은 내부 네트워크 URL을 사용해야 합니다.
2. **방화벽 설정**: Render.com의 PostgreSQL은 자동으로 같은 계정의 서비스만 접근 가능합니다.
3. **비밀번호 확인**: 데이터베이스 비밀번호가 정확한지 확인

---

## 추가 설정 (선택사항)

### 자동 배포 설정
- GitHub에 푸시할 때마다 자동으로 배포되도록 설정되어 있습니다.
- 특정 브랜치만 배포하려면 "Settings" → "Auto-Deploy"에서 설정 가능합니다.

### 커스텀 도메인 설정
- "Settings" → "Custom Domain"에서 커스텀 도메인을 추가할 수 있습니다.
- DNS 설정이 필요합니다.

### 환경 변수 관리
- 민감한 정보는 환경 변수로 관리하세요.
- `.env` 파일은 Git에 커밋하지 마세요 (이미 `.gitignore`에 포함되어 있습니다).

---

## 참고 사항

- **Free tier 제한사항**:
  - 서비스가 15분간 비활성 상태이면 자동으로 sleep 모드로 전환됩니다.
  - 첫 요청 시 깨어나는 데 시간이 걸릴 수 있습니다 (약 30초~1분).
  - 월 750시간 무료 사용 가능합니다.

- **성능 최적화**:
  - 프로덕션 환경에서는 데이터베이스 연결 풀 크기를 조정할 수 있습니다.
  - 캐싱 전략을 고려해보세요.

- **보안**:
  - 프로덕션 환경에서는 HTTPS를 사용하세요 (Render.com은 자동으로 제공).
  - 환경 변수에 민감한 정보를 저장하세요.
  - SQL Injection 방지를 위해 파라미터화된 쿼리를 사용하세요 (이미 구현되어 있습니다).

