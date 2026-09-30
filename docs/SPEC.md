# 미니 방명록 명세 (guestbook-202204247)

개발자: 이동건 (202204247)

## 목표
회원가입/로그인 없이 이름·메시지·작성 시각이 쌓이는 방명록. 글 작성 시 입력한 비밀번호로만 본인 글의 수정·삭제 권한을 확인한다.

## 스택
- Next.js (App Router) + TypeScript, Tailwind CSS
- Neon Postgres (`@neondatabase/serverless`)
- Vercel 배포
- GitHub / Vercel / Neon 프로젝트 이름: `guestbook-202204247`

## 데이터 모델 — `entries`
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | serial PK | |
| name | varchar(30) | 필수 |
| message | varchar(500) | 필수 |
| password_hash | text | bcrypt 해시 (평문 저장 금지) |
| created_at | timestamptz | 기본값 now() |
| updated_at | timestamptz | 수정 시 갱신, 최초 null |

## 기능
### Create
- 누구나 이름(1–30자), 메시지(1–500자), 비밀번호(4–64자, UTF-8 72바이트 이하 — bcrypt 한계)를 입력해 글을 남긴다.
- 검증 실패 시 필드별 오류를 표시하고 입력값을 유지한다. 성공 시 폼을 비운다.

### Read
- 누구나 전체 글 목록을 본다. `created_at DESC, id DESC`(최신순) 정렬.
- 각 글에 이름, 메시지, 작성 시각(Asia/Seoul)을 표시하고, 수정된 글은 "(수정됨)" 표시.
- 비밀번호 해시는 절대 클라이언트로 보내지 않는다.

### Update
- 글쓴이는 비밀번호와 새 메시지를 입력해 메시지를 수정한다.
- 비밀번호 불일치 → 수정 거부, "비밀번호가 일치하지 않아 수정할 수 없습니다." 표시.
- 글이 없으면 "이미 삭제되었거나 존재하지 않는 글입니다." 표시.

### Delete
- 글쓴이는 비밀번호를 입력해 글을 삭제한다.
- 비밀번호 불일치 → 삭제 거부, "비밀번호가 일치하지 않아 삭제할 수 없습니다." 표시.

### UI
- 헤더에 개발자 이름(이동건)과 학번(202204247) 표시.

## 보안
- 비밀번호는 bcrypt(cost 10)로 해시해 저장, 비교는 `bcrypt.compare`.
- 모든 쿼리는 파라미터 바인딩(tagged template)으로 SQL 인젝션 방지.
- 권한 확인은 Server Action 내부(서버)에서 수행한다.
