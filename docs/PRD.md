# 커피 주문 앱

## 1. 프로젝트 개요

### 1.1 프로젝트명
커피 주문 앱

### 1.2 프로젝트 목적
사용자가 커피 메뉴를 주문하고, 관리자가 주문을 관리할 수 있는 간단한 풀스택 앱

### 1.3 개발 범위
- 주문하기 화면 (메뉴 선택 및 장바구니 기능)
- 관리자 화면 (재고 관리 및 주문 상태 관리)
- 데이터를 생성/조회/수정/삭제할 수 있는 기능

## 2. 기술 스택
- 프런트엔드 : HTML, CSS, 리액트, 자바스크립트
- 백엔드 : Node.js, Express
- 데이터베이스 : PostgreSQL

## 3. 기본 사항
- 프런트엔드와 백엔드를 따로 개발
- 기본적인 웹 기술만 사용
- 학습 목적이므로 사용자 인증이나 결제 기능은 제외
- 메뉴는 커피 메뉴만 있음

## 4. 주문하기 화면

### 4.1 화면 개요
사용자가 커피 메뉴를 선택하고 장바구니에 담아 주문할 수 있는 메인 화면입니다.

### 4.2 화면 구성

#### 4.2.1 헤더 영역
- **위치**: 화면 상단
- **구성 요소**:
  - **로고**: 좌측에 "COZY" 텍스트가 들어간 다크 그린 배경의 박스
  - **주문하기 버튼**: 헤더 우측에 위치한 버튼 (현재 화면 표시)
  - **관리자 버튼**: 헤더 우측에 위치한 버튼 (관리자 화면으로 이동)

#### 4.2.2 메뉴 아이템 섹션
- **위치**: 헤더 아래, 화면 중앙
- **레이아웃**: 메뉴 카드들이 가로로 배치 (그리드 또는 플렉스 레이아웃)
- **메뉴 카드 구성 요소**:
  1. **이미지 영역**: 메뉴 이미지를 표시하는 영역 (플레이스홀더 지원)
  2. **메뉴 이름**: 커피 메뉴의 이름 (예: "아메리카노(ICE)", "아메리카노(HOT)", "카페라떼")
  3. **가격**: 원화(원) 단위로 표시 (예: "4,000원", "5,000원")
  4. **설명**: 메뉴에 대한 간단한 설명 텍스트 (예: "간단한 설명...")
  5. **커스터마이징 옵션**: 체크박스 형태의 옵션 선택
     - "샷 추가 (+500원)" - 선택 시 가격에 500원 추가
     - "시럽 추가 (+0원)" - 선택 시 가격 변동 없음
  6. **담기 버튼**: 회색 배경의 버튼으로, 클릭 시 해당 메뉴를 장바구니에 추가

#### 4.2.3 장바구니 섹션
- **위치**: 화면 하단
- **구성 요소**:
  1. **제목**: "장바구니" 텍스트
  2. **아이템 목록**: 선택한 메뉴 아이템들의 목록
     - 각 아이템 표시 형식: "메뉴명 (옵션) X 수량"
     - 각 아이템의 개별 가격 표시
     - 예시:
       - "아메리카노(ICE) (샷 추가) X 1" - 4,500원
       - "아메리카노(HOT) X 2" - 8,000원
  3. **총 금액**: "총 금액" 레이블과 함께 굵은 글씨로 표시 (예: "12,500원")
  4. **주문하기 버튼**: 회색 배경의 버튼으로, 클릭 시 주문을 완료

### 4.3 기능 요구사항

#### 4.3.1 메뉴 표시
- 데이터베이스에서 커피 메뉴 목록을 조회하여 화면에 표시
- 각 메뉴는 카드 형태로 표시되며, 이미지, 이름, 가격, 설명이 포함됨

#### 4.3.2 커스터마이징 옵션
- 각 메뉴 카드에서 옵션을 선택할 수 있음
- 옵션 선택 시 가격이 실시간으로 반영되어야 함 (샷 추가 시 +500원)
- 여러 옵션을 동시에 선택 가능

#### 4.3.3 장바구니 기능
- **담기**: 메뉴 카드의 "담기" 버튼 클릭 시 장바구니에 추가
- **중복 추가**: 같은 메뉴와 옵션 조합을 다시 담으면 수량이 증가
- **수량 표시**: 장바구니에 담긴 각 아이템의 수량을 표시
- **가격 계산**: 
  - 각 아이템의 가격 = (기본 가격 + 옵션 추가 가격) × 수량
  - 총 금액 = 모든 아이템 가격의 합계
- **실시간 업데이트**: 장바구니에 아이템이 추가되거나 수량이 변경되면 총 금액이 자동으로 업데이트

#### 4.3.4 주문하기
- 장바구니에 아이템이 있을 때만 "주문하기" 버튼 활성화
- "주문하기" 버튼 클릭 시:
  - 주문 데이터를 서버로 전송
  - 주문 완료 후 장바구니 초기화
  - 사용자에게 주문 완료 피드백 제공

### 4.4 데이터 구조

#### 4.4.1 메뉴 데이터
```javascript
{
  id: number,
  name: string,
  price: number,
  description: string,
  imageUrl: string,
  options: [
    {
      id: number,
      name: string,
      price: number
    }
  ]
}
```

#### 4.4.2 장바구니 아이템 데이터
```javascript
{
  menuId: number,
  menuName: string,
  basePrice: number,
  selectedOptions: [
    {
      optionId: number,
      optionName: string,
      optionPrice: number
    }
  ],
  quantity: number,
  totalPrice: number
}
```

#### 4.4.3 주문 데이터
```javascript
{
  items: [
    {
      menuId: number,
      menuName: string,
      options: [
        {
          optionId: number,
          optionName: string
        }
      ],
      quantity: number,
      price: number
    }
  ],
  totalAmount: number,
  orderDate: timestamp
}
```

### 4.5 UI/UX 요구사항
- 깔끔하고 미니멀한 디자인
- 화이트 배경에 다크 그레이 텍스트
- COZY 로고는 다크 그린 배경 사용
- 버튼은 회색 배경 사용
- 반응형 디자인 고려 (모바일/데스크톱)
- 사용자 액션에 대한 명확한 피드백 제공

## 5. 관리자 화면

### 5.1 화면 개요
관리자가 주문 현황을 확인하고 관리하며, 재고를 조정할 수 있는 관리자 대시보드 화면입니다.

### 5.2 화면 구성

#### 5.2.1 헤더 영역
- **위치**: 화면 상단
- **구성 요소**:
  - **로고**: 좌측에 "COZY" 텍스트가 들어간 다크 그레이 배경의 박스
  - **주문하기 버튼**: 헤더 우측에 위치한 버튼 (주문하기 화면으로 이동)
  - **관리자 버튼**: 헤더 우측에 위치한 버튼 (현재 화면 표시)

#### 5.2.2 관리자 대시보드 개요 섹션
- **위치**: 헤더 아래, 화면 상단
- **제목**: "관리자 대시보드"
- **통계 정보**: 주문 상태별 통계를 카드 형태로 표시
  - **총 주문**: 전체 주문 건수
  - **주문 접수**: 접수된 주문 건수
  - **제조 중**: 현재 제조 중인 주문 건수
  - **제조 완료**: 제조가 완료된 주문 건수

#### 5.2.3 재고 현황 섹션
- **위치**: 대시보드 개요 섹션 아래
- **제목**: "재고 현황"
- **레이아웃**: 메뉴별 재고 카드들이 가로로 배치
- **재고 카드 구성 요소**:
  1. **메뉴 이름**: 커피 메뉴의 이름 (예: "아메리카노 (ICE)", "아메리카노 (HOT)", "카페라떼")
  2. **재고 수량**: 현재 재고 수량을 "N개" 형식으로 표시 (예: "10개")
  3. **재고 조정 버튼**:
     - **+ 버튼**: 재고 수량 증가
     - **- 버튼**: 재고 수량 감소

#### 5.2.4 주문 현황 섹션
- **위치**: 화면 하단
- **제목**: "주문 현황"
- **주문 목록**: 주문 목록을 카드 형태로 표시
- **주문 카드 구성 요소**:
  1. **주문 시간**: 주문이 접수된 날짜와 시간 (예: "7월 31일 13:00")
  2. **주문 아이템**: 주문한 메뉴와 수량 (예: "아메리카노(ICE) x 1")
  3. **주문 금액**: 해당 주문의 총 금액 (예: "4,000원")
  4. **주문 상태 버튼**: 주문 상태에 따른 액션 버튼
     - "주문 접수" 버튼: 대기 중인 주문을 접수할 때
     - 기타 상태 변경 버튼 (제조 중, 제조 완료 등)

### 5.3 기능 요구사항

#### 5.3.1 대시보드 통계
- **실시간 업데이트**: 주문 상태가 변경되면 통계가 자동으로 업데이트
- **통계 계산**:
  - 총 주문: 모든 주문의 총 건수
  - 주문 접수: 상태가 "접수됨"인 주문 건수
  - 제조 중: 상태가 "제조 중"인 주문 건수
  - 제조 완료: 상태가 "제조 완료"인 주문 건수

#### 5.3.2 재고 관리
- **재고 조회**: 데이터베이스에서 각 메뉴의 현재 재고 수량을 조회하여 표시
- **재고 증가**: "+" 버튼 클릭 시 해당 메뉴의 재고 수량이 1 증가
- **재고 감소**: "-" 버튼 클릭 시 해당 메뉴의 재고 수량이 1 감소
- **재고 업데이트**: 재고 변경 시 즉시 데이터베이스에 반영
- **실시간 반영**: 재고 변경 후 화면에 즉시 반영

#### 5.3.3 주문 관리
- **주문 목록 조회**: 데이터베이스에서 주문 목록을 조회하여 표시
- **주문 상태별 필터링**: 주문 상태에 따라 주문을 필터링하여 표시 가능
- **주문 접수**: "주문 접수" 버튼 클릭 시:
  - 주문 상태를 "접수됨"으로 변경
  - 대시보드 통계 업데이트
  - 해당 주문의 재고 차감 (주문한 메뉴의 재고 감소)
- **주문 상태 변경**: 주문 상태를 단계별로 변경 가능
  - 대기 → 접수됨 → 제조 중 → 제조 완료
- **주문 정보 표시**: 각 주문의 상세 정보 표시
  - 주문 시간, 메뉴, 수량, 옵션, 금액 등

### 5.4 데이터 구조

#### 5.4.1 재고 데이터
```javascript
{
  menuId: number,
  menuName: string,
  stock: number
}
```

#### 5.4.2 주문 상태 통계 데이터
```javascript
{
  totalOrders: number,
  receivedOrders: number,
  manufacturingOrders: number,
  completedOrders: number
}
```

#### 5.4.3 주문 현황 데이터
```javascript
{
  id: number,
  orderDate: timestamp,
  items: [
    {
      menuId: number,
      menuName: string,
      options: [
        {
          optionId: number,
          optionName: string
        }
      ],
      quantity: number,
      price: number
    }
  ],
  totalAmount: number,
  status: 'pending' | 'received' | 'manufacturing' | 'completed'
}
```

### 5.5 비즈니스 로직

#### 5.5.1 재고 관리 규칙
- 재고는 0 이상의 정수 값만 허용
- 재고가 0인 경우 주문 접수 시 경고 표시 (선택 사항)
- 재고 차감은 주문 접수 시점에 수행

#### 5.5.2 주문 상태 흐름
1. **대기 (pending)**: 주문이 생성되었지만 아직 접수되지 않은 상태
2. **접수됨 (received)**: 관리자가 주문을 접수한 상태 (재고 차감 발생)
3. **제조 중 (manufacturing)**: 커피 제조가 시작된 상태
4. **제조 완료 (completed)**: 커피 제조가 완료된 상태

### 5.6 UI/UX 요구사항
- 깔끔하고 미니멀한 디자인
- 화이트 배경에 다크 그레이 텍스트
- COZY 로고는 다크 그레이 배경 사용 (관리자 화면)
- 버튼은 회색 배경 사용
- 통계 카드는 시각적으로 구분되도록 디자인
- 재고 카드는 각 메뉴별로 명확하게 구분
- 주문 카드는 시간순으로 정렬 (최신 주문이 상단)
- 반응형 디자인 고려 (모바일/데스크톱)
- 상태 변경 시 명확한 피드백 제공
- 재고 조정 시 즉각적인 시각적 피드백 제공

## 6. 백엔드 개발

### 6.1 데이터 모델

#### 6.1.1 Menus (메뉴)
커피 메뉴 정보를 저장하는 테이블입니다.

**필드**:
- `id` (Primary Key, Auto Increment): 메뉴 고유 ID
- `name` (VARCHAR): 커피 이름 (예: "아메리카노(ICE)", "카페라떼")
- `description` (TEXT): 메뉴 설명
- `price` (INTEGER): 기본 가격 (원 단위)
- `image_url` (VARCHAR): 메뉴 이미지 URL
- `stock` (INTEGER): 재고 수량 (기본값: 0)
- `created_at` (TIMESTAMP): 생성 일시
- `updated_at` (TIMESTAMP): 수정 일시

**제약 조건**:
- `name`은 필수이며 중복 불가
- `price`는 0 이상의 정수
- `stock`은 0 이상의 정수

#### 6.1.2 Options (옵션)
메뉴에 추가할 수 있는 옵션 정보를 저장하는 테이블입니다.

**필드**:
- `id` (Primary Key, Auto Increment): 옵션 고유 ID
- `name` (VARCHAR): 옵션 이름 (예: "샷 추가", "시럽 추가")
- `price` (INTEGER): 옵션 추가 가격 (원 단위, 기본값: 0)
- `menu_id` (Foreign Key): 연결된 메뉴 ID (Menus 테이블 참조)
- `created_at` (TIMESTAMP): 생성 일시
- `updated_at` (TIMESTAMP): 수정 일시

**제약 조건**:
- `name`은 필수
- `price`는 0 이상의 정수
- `menu_id`는 Menus 테이블의 유효한 ID여야 함

**관계**:
- 하나의 메뉴는 여러 옵션을 가질 수 있음 (1:N 관계)

#### 6.1.3 Orders (주문)
주문 정보를 저장하는 테이블입니다.

**필드**:
- `id` (Primary Key, Auto Increment): 주문 고유 ID
- `order_date` (TIMESTAMP): 주문 일시 (기본값: 현재 시간)
- `total_amount` (INTEGER): 주문 총 금액 (원 단위)
- `status` (VARCHAR): 주문 상태 ('pending', 'received', 'manufacturing', 'completed')
- `created_at` (TIMESTAMP): 생성 일시
- `updated_at` (TIMESTAMP): 수정 일시

**제약 조건**:
- `total_amount`는 0 이상의 정수
- `status`는 지정된 값 중 하나여야 함

#### 6.1.4 OrderItems (주문 아이템)
주문에 포함된 각 메뉴 아이템 정보를 저장하는 테이블입니다.

**필드**:
- `id` (Primary Key, Auto Increment): 주문 아이템 고유 ID
- `order_id` (Foreign Key): 주문 ID (Orders 테이블 참조)
- `menu_id` (Foreign Key): 메뉴 ID (Menus 테이블 참조)
- `menu_name` (VARCHAR): 메뉴 이름 (주문 시점의 이름 저장)
- `quantity` (INTEGER): 주문 수량
- `price` (INTEGER): 아이템 단가 (기본 가격 + 옵션 가격)
- `created_at` (TIMESTAMP): 생성 일시

**제약 조건**:
- `quantity`는 1 이상의 정수
- `price`는 0 이상의 정수

**관계**:
- 하나의 주문은 여러 주문 아이템을 가질 수 있음 (1:N 관계)

#### 6.1.5 OrderItemOptions (주문 아이템 옵션)
주문 아이템에 선택된 옵션 정보를 저장하는 테이블입니다.

**필드**:
- `id` (Primary Key, Auto Increment): 주문 아이템 옵션 고유 ID
- `order_item_id` (Foreign Key): 주문 아이템 ID (OrderItems 테이블 참조)
- `option_id` (Foreign Key): 옵션 ID (Options 테이블 참조)
- `option_name` (VARCHAR): 옵션 이름 (주문 시점의 이름 저장)
- `option_price` (INTEGER): 옵션 가격 (주문 시점의 가격 저장)
- `created_at` (TIMESTAMP): 생성 일시

**관계**:
- 하나의 주문 아이템은 여러 옵션을 가질 수 있음 (1:N 관계)

### 6.2 데이터 스키마를 위한 사용자 흐름

#### 6.2.1 메뉴 조회 및 표시
1. **프런트엔드**: '주문하기' 화면 접속 시 메뉴 목록 요청
2. **백엔드**: `GET /api/menus` 엔드포인트 호출
3. **데이터베이스**: Menus 테이블에서 모든 메뉴 조회
4. **데이터베이스**: 각 메뉴에 연결된 Options 조회 (JOIN 또는 별도 쿼리)
5. **백엔드**: 메뉴와 옵션 정보를 조합하여 응답
6. **프런트엔드**: 받은 데이터를 화면에 표시
   - 주문하기 화면: 메뉴 이름, 가격, 설명, 이미지, 옵션 표시
   - 관리자 화면: 재고 수량도 함께 표시

#### 6.2.2 장바구니 관리
1. **프런트엔드**: 사용자가 메뉴를 선택하고 옵션을 선택
2. **프런트엔드**: 선택한 정보를 로컬 상태(장바구니)에 저장
3. **프런트엔드**: 장바구니에 담긴 아이템 목록과 총 금액 표시
   - 재고 확인: Menus 테이블의 stock 필드와 비교하여 재고 부족 시 주문 제한

#### 6.2.3 주문 생성
1. **프런트엔드**: 장바구니에서 '주문하기' 버튼 클릭
2. **프런트엔드**: 주문 정보를 서버로 전송 (`POST /api/orders`)
3. **백엔드**: 주문 데이터 검증
   - 재고 확인: 주문 수량이 재고를 초과하지 않는지 확인
4. **데이터베이스**: 트랜잭션 시작
   - Orders 테이블에 주문 정보 저장
   - OrderItems 테이블에 주문 아이템 저장
   - OrderItemOptions 테이블에 선택된 옵션 저장
   - Menus 테이블의 stock 필드 업데이트 (재고 차감)
5. **데이터베이스**: 트랜잭션 커밋
6. **백엔드**: 생성된 주문 ID와 함께 응답
7. **프런트엔드**: 주문 완료 메시지 표시 및 장바구니 초기화

#### 6.2.4 주문 현황 조회 및 상태 변경
1. **프런트엔드**: 관리자 화면 접속 시 주문 목록 요청 (`GET /api/orders`)
2. **백엔드**: Orders 테이블에서 주문 목록 조회
   - OrderItems와 OrderItemOptions를 JOIN하여 상세 정보 포함
   - 상태별 필터링 가능
3. **프런트엔드**: 주문 현황 섹션에 주문 목록 표시
4. **프런트엔드**: 관리자가 상태 변경 버튼 클릭
5. **프런트엔드**: 상태 변경 요청 전송 (`PATCH /api/orders/:id/status`)
6. **백엔드**: 주문 상태 업데이트
7. **데이터베이스**: Orders 테이블의 status 필드 업데이트
8. **백엔드**: 업데이트된 주문 정보 응답
9. **프런트엔드**: 화면에 변경된 상태 반영

### 6.3 API 설계

#### 6.3.1 메뉴 관련 API

##### GET /api/menus
메뉴 목록을 조회합니다.

**요청**:
- Method: GET
- Headers: 없음
- Query Parameters: 없음

**응답** (200 OK):
```json
{
  "menus": [
    {
      "id": 1,
      "name": "아메리카노(ICE)",
      "description": "간단한 설명...",
      "price": 4000,
      "image_url": "https://images.unsplash.com/...",
      "stock": 10,
      "options": [
        {
          "id": 1,
          "name": "샷 추가",
          "price": 500
        },
        {
          "id": 2,
          "name": "시럽 추가",
          "price": 0
        }
      ]
    }
  ]
}
```

**에러 응답**:
- 500 Internal Server Error: 서버 오류

##### GET /api/menus/:id
특정 메뉴의 상세 정보를 조회합니다.

**요청**:
- Method: GET
- Path Parameters:
  - `id`: 메뉴 ID

**응답** (200 OK):
```json
{
  "id": 1,
  "name": "아메리카노(ICE)",
  "description": "간단한 설명...",
  "price": 4000,
  "image_url": "https://images.unsplash.com/...",
  "stock": 10,
  "options": [...]
}
```

**에러 응답**:
- 404 Not Found: 메뉴를 찾을 수 없음
- 500 Internal Server Error: 서버 오류

##### PATCH /api/menus/:id/stock
메뉴의 재고를 수정합니다. (관리자용)

**요청**:
- Method: PATCH
- Path Parameters:
  - `id`: 메뉴 ID
- Body:
```json
{
  "change": 1  // 증가: 양수, 감소: 음수
}
```

**응답** (200 OK):
```json
{
  "id": 1,
  "name": "아메리카노(ICE)",
  "stock": 11,
  "updated_at": "2024-01-01T12:00:00Z"
}
```

**에러 응답**:
- 400 Bad Request: 재고가 0 미만이 되는 경우
- 404 Not Found: 메뉴를 찾을 수 없음
- 500 Internal Server Error: 서버 오류

#### 6.3.2 주문 관련 API

##### POST /api/orders
새로운 주문을 생성합니다.

**요청**:
- Method: POST
- Body:
```json
{
  "items": [
    {
      "menu_id": 1,
      "quantity": 2,
      "selected_options": [1, 2]  // 옵션 ID 배열
    },
    {
      "menu_id": 3,
      "quantity": 1,
      "selected_options": [1]
    }
  ]
}
```

**응답** (201 Created):
```json
{
  "id": 123,
  "order_date": "2024-01-01T12:00:00Z",
  "total_amount": 14000,
  "status": "received",
  "items": [
    {
      "menu_id": 1,
      "menu_name": "아메리카노(ICE)",
      "quantity": 2,
      "price": 4500,
      "options": [
        {
          "option_id": 1,
          "option_name": "샷 추가",
          "option_price": 500
        },
        {
          "option_id": 2,
          "option_name": "시럽 추가",
          "option_price": 0
        }
      ]
    }
  ]
}
```

**에러 응답**:
- 400 Bad Request: 재고 부족 또는 잘못된 요청 데이터
- 500 Internal Server Error: 서버 오류

**비즈니스 로직**:
1. 요청 데이터 검증
2. 각 메뉴의 재고 확인
3. 재고 부족 시 400 에러 반환
4. 트랜잭션 시작
5. Orders 테이블에 주문 저장
6. OrderItems 테이블에 주문 아이템 저장
7. OrderItemOptions 테이블에 옵션 저장
8. Menus 테이블의 재고 차감
9. 트랜잭션 커밋
10. 생성된 주문 정보 반환

##### GET /api/orders
주문 목록을 조회합니다.

**요청**:
- Method: GET
- Query Parameters:
  - `status` (optional): 주문 상태 필터 ('pending', 'received', 'manufacturing', 'completed')
  - `limit` (optional): 조회할 최대 개수 (기본값: 100)
  - `offset` (optional): 건너뛸 개수 (기본값: 0)

**응답** (200 OK):
```json
{
  "orders": [
    {
      "id": 123,
      "order_date": "2024-01-01T12:00:00Z",
      "total_amount": 14000,
      "status": "received",
      "items": [
        {
          "menu_id": 1,
          "menu_name": "아메리카노(ICE)",
          "quantity": 2,
          "price": 4500,
          "options": [...]
        }
      ]
    }
  ],
  "total": 50,
  "limit": 100,
  "offset": 0
}
```

**에러 응답**:
- 500 Internal Server Error: 서버 오류

##### GET /api/orders/:id
특정 주문의 상세 정보를 조회합니다.

**요청**:
- Method: GET
- Path Parameters:
  - `id`: 주문 ID

**응답** (200 OK):
```json
{
  "id": 123,
  "order_date": "2024-01-01T12:00:00Z",
  "total_amount": 14000,
  "status": "received",
  "items": [
    {
      "menu_id": 1,
      "menu_name": "아메리카노(ICE)",
      "quantity": 2,
      "price": 4500,
      "options": [...]
    }
  ],
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

**에러 응답**:
- 404 Not Found: 주문을 찾을 수 없음
- 500 Internal Server Error: 서버 오류

##### PATCH /api/orders/:id/status
주문 상태를 변경합니다. (관리자용)

**요청**:
- Method: PATCH
- Path Parameters:
  - `id`: 주문 ID
- Body:
```json
{
  "status": "manufacturing"  // 'received', 'manufacturing', 'completed'
}
```

**응답** (200 OK):
```json
{
  "id": 123,
  "status": "manufacturing",
  "updated_at": "2024-01-01T12:30:00Z"
}
```

**에러 응답**:
- 400 Bad Request: 잘못된 상태 값 또는 상태 변경 규칙 위반
- 404 Not Found: 주문을 찾을 수 없음
- 500 Internal Server Error: 서버 오류

**상태 변경 규칙**:
- 'received' → 'manufacturing' 가능
- 'manufacturing' → 'completed' 가능
- 이전 상태로 되돌리는 것은 불가능

### 6.4 데이터베이스 스키마 예시

#### 6.4.1 Menus 테이블
```sql
CREATE TABLE menus (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  price INTEGER NOT NULL CHECK (price >= 0),
  image_url VARCHAR(500),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6.4.2 Options 테이블
```sql
CREATE TABLE options (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL DEFAULT 0 CHECK (price >= 0),
  menu_id INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6.4.3 Orders 테이블
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'received' 
    CHECK (status IN ('pending', 'received', 'manufacturing', 'completed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6.4.4 OrderItems 테이블
```sql
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_id INTEGER NOT NULL REFERENCES menus(id),
  menu_name VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price INTEGER NOT NULL CHECK (price >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6.4.5 OrderItemOptions 테이블
```sql
CREATE TABLE order_item_options (
  id SERIAL PRIMARY KEY,
  order_item_id INTEGER NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  option_id INTEGER NOT NULL REFERENCES options(id),
  option_name VARCHAR(100) NOT NULL,
  option_price INTEGER NOT NULL DEFAULT 0 CHECK (option_price >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6.4.6 인덱스
```sql
-- 성능 최적화를 위한 인덱스
CREATE INDEX idx_options_menu_id ON options(menu_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_date ON orders(order_date DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_item_options_order_item_id ON order_item_options(order_item_id);
```

### 6.5 에러 처리

#### 6.5.1 공통 에러 응답 형식
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지",
    "details": {}  // 선택적 상세 정보
  }
}
```

#### 6.5.2 주요 에러 코드
- `INVALID_REQUEST`: 잘못된 요청 데이터
- `MENU_NOT_FOUND`: 메뉴를 찾을 수 없음
- `ORDER_NOT_FOUND`: 주문을 찾을 수 없음
- `INSUFFICIENT_STOCK`: 재고 부족
- `INVALID_STATUS_TRANSITION`: 잘못된 상태 변경
- `INTERNAL_SERVER_ERROR`: 서버 내부 오류

### 6.6 보안 고려사항

- 입력 데이터 검증 및 sanitization
- SQL Injection 방지 (Prepared Statement 사용)
- CORS 설정 (프런트엔드 도메인만 허용)
- Rate Limiting (과도한 요청 방지)
- 에러 메시지에서 민감한 정보 노출 방지