# 🎟️ 티켓팅 서버 프로젝트

대용량 트래픽 처리와 동시성 제어를 학습하기 위한 **Node.js 기반 티켓팅 서버**입니다.  
TypeScript, PostgreSQL, Prisma를 기반으로 3 Layer Architecture를 적용하여 구축했습니다.

## 📚 기술 스택

- **Backend**: Node.js, Express, TypeScript  
- **Database**: PostgreSQL, Prisma ORM  
- **Load Test**: k6  
- **API 설계 패턴**: RESTful API  
- **아키텍처**: Controller - Service - Repository (3 Layer Architecture)


## ✅ 주요 기능

### 1. 사용자(User)
- 사용자 등록 (시드 데이터로 생성)
- 이메일 기반 식별

### 2. 이벤트(Event)
- 이벤트 생성 (시드 데이터로 생성)
- 이벤트별 좌석 구성

### 3. 좌석(Seat)
- 이벤트별 좌석 목록 조회
- 좌석 상태: `available`, `reserved`, `sold`

### 4. 예매(Reservation)
- 좌석 예매 요청 API: `POST /reservation`
  - 하나의 유저가 하나의 이벤트에 여러 좌석을 예매할 수 있음
  - 예매 성공 시, 좌석 상태가 `reserved`로 변경
- 남은 좌석 조회 API: `GET /seats?eventId={id}`
  - `available` 상태의 좌석만 반환
- 동시성 제어 적용 (트랜잭션 & 좌석 잠금)
- 예매 실패 케이스 처리 (좌석 중복 선택 등)


## 🧪 Load Testing

- **Tool**: [k6](https://k6.io/)
- **테스트 1** </br>
10명의 유저가 동시에 특정 이벤트의 좌석을 예매하는 시나리오
- **결과**:
  - 예매 성공: 중복 없이 10명 성공
  - 예매 실패: 이미 예약된 좌석은 400 에러 반환
  - 트랜잭션 및 락으로 인한 데이터 정합성 보장


## 🗂️ 프로젝트 구조
📦src </br>
 ┣ 📂config </br>
 ┃ ┗ 📜db.ts </br>
 ┣ 📂controllers </br>
 ┃ ┗ 📜reservation.contoller.ts </br>
 ┣ 📂routes </br>
 ┃ ┗ 📜reservation.route.ts </br>
 ┣ 📂services </br>
 ┃ ┗ 📜reservation.service.ts </br>
 ┗ 📜index.ts </br>
