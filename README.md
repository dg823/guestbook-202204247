# guestbook-202204247 — 미니 방명록

개발자: **이동건 (202204247)**

이름, 메시지, 작성 시각이 쌓이는 방명록입니다. 회원가입 없이, 글 작성 시 입력한 비밀번호로 본인 글만 수정·삭제할 수 있습니다.

- Next.js (App Router) + TypeScript + Tailwind CSS
- Neon Postgres (`@neondatabase/serverless`), 비밀번호는 bcrypt 해시로 저장
- Vercel 배포

명세: [docs/SPEC.md](docs/SPEC.md) · 티켓: [docs/TICKETS.md](docs/TICKETS.md)

## 로컬 실행

```bash
npm install
cp .env.example .env.local   # DATABASE_URL 에 Neon 연결 문자열 입력
npm run db:migrate           # entries 테이블 생성
npm run dev
```

## 구조

| 경로 | 역할 |
|---|---|
| `db/schema.sql` | 테이블 스키마 |
| `src/lib/entries.ts` | DB 쿼리 · 비밀번호 검증 (서버 전용) |
| `src/app/actions.ts` | 작성/수정/삭제 Server Actions |
| `src/app/page.tsx` | 최신순 목록 + 개발자 정보 |
| `src/app/_components/` | 작성 폼, 글 항목(수정·삭제 폼) |
