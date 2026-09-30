import Link from "next/link";
import { listEntries } from "@/lib/entries";
import { EntryForm } from "./_components/EntryForm";
import { EntryItem } from "./_components/EntryItem";

const DEVELOPER = { name: "이동건", studentId: "202204247" };

const PAGE_SIZE = 20;
const MAX_COUNT = 1000;

// `?count=N` controls how many of the newest entries are shown; "더 보기" bumps it by a page.
function parseCount(raw: string | string[] | undefined) {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  if (!Number.isFinite(n) || n < PAGE_SIZE) return PAGE_SIZE;
  return Math.min(Math.ceil(n / PAGE_SIZE) * PAGE_SIZE, MAX_COUNT);
}

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export default async function Home({ searchParams }: PageProps<"/">) {
  const count = parseCount((await searchParams).count);
  const { entries, total } = await listEntries(count);
  const hasMore = entries.length < total && count < MAX_COUNT;

  return (
    <div className="flex-1 bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-2 px-4 py-5">
          <h1 className="text-2xl font-bold text-zinc-900">미니 방명록</h1>
          <p className="text-sm text-zinc-600">
            개발자 <strong className="text-zinc-900">{DEVELOPER.name}</strong> · 학번{" "}
            <strong className="text-zinc-900">{DEVELOPER.studentId}</strong>
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <EntryForm />

        <section>
          <h2 className="mb-3 text-sm font-medium text-zinc-500">
            전체 글 {total}개 · 최신순
            {total > entries.length && ` · ${entries.length}개 표시 중`}
          </h2>
          {entries.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500">
              아직 작성된 글이 없습니다. 첫 번째 글을 남겨 보세요!
            </p>
          ) : (
            <ul className="space-y-3">
              {entries.map((entry) => (
                <EntryItem
                  key={entry.id}
                  id={entry.id}
                  name={entry.name}
                  message={entry.message}
                  createdAtLabel={dateFormat.format(entry.createdAt)}
                  createdAtIso={entry.createdAt.toISOString()}
                  edited={entry.updatedAt !== null}
                />
              ))}
            </ul>
          )}
          {hasMore && (
            <Link
              href={`/?count=${count + PAGE_SIZE}`}
              scroll={false}
              className="mt-4 block rounded-xl border border-zinc-200 bg-white py-3 text-center text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-100"
            >
              더 보기 ({total - entries.length}개 남음)
            </Link>
          )}
        </section>
      </main>

      <footer className="py-6 text-center text-xs text-zinc-500">
        © {DEVELOPER.name} ({DEVELOPER.studentId}) · guestbook-202204247
      </footer>
    </div>
  );
}
