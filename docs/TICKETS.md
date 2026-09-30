# 티켓

1. **DB 스키마 & 마이그레이션** — `db/schema.sql`, `npm run db:migrate`로 `entries` 테이블 생성.
2. **DB 접근 계층** — `src/lib/db.ts`(Neon 클라이언트), `src/lib/entries.ts`(목록/생성/수정/삭제 쿼리, 해시 비교).
3. **Create** — 작성 폼 + `createEntry` Server Action, 입력 검증과 오류 표시.
4. **Read** — 최신순 목록을 서버 컴포넌트로 렌더링(요청마다 동적으로).
5. **Update** — 글별 수정 폼(메시지 + 비밀번호), 불일치 시 거부 메시지.
6. **Delete** — 글별 삭제 폼(비밀번호), 불일치 시 거부 메시지.
7. **개발자 정보 표시** — 헤더에 이동건 / 202204247.
8. **배포** — GitHub `guestbook-202204247` → Vercel 프로젝트 `guestbook-202204247`, Neon 프로젝트 `guestbook-202204247`의 `DATABASE_URL` 연결.
