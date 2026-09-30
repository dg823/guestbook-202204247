"use client";

import { useActionState, useState, startTransition, type FormEvent } from "react";
import { removeEntry, updateEntry, type ActionState } from "@/app/actions";
import { LIMITS } from "@/lib/validation";
import { FieldError } from "./FieldError";

type Props = {
  id: number;
  name: string;
  message: string;
  createdAtLabel: string;
  createdAtIso: string;
  edited: boolean;
};

type Mode = "view" | "edit" | "delete";

const initialState: ActionState = { ok: false };

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";
const ghostButton = "rounded-lg px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100";

function submitWith(formAction: (formData: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  };
}

function ErrorAlert({ state }: { state: ActionState }) {
  if (state.ok || !state.message) return null;
  return (
    <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
      {state.message}
    </p>
  );
}

export function EntryItem({ id, name, message, createdAtLabel, createdAtIso, edited }: Props) {
  const [mode, setMode] = useState<Mode>("view");

  const [updateState, updateAction, updating] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const result = await updateEntry(prev, formData);
      if (result.ok) setMode("view");
      return result;
    },
    initialState,
  );
  const [deleteState, deleteAction, deleting] = useActionState(removeEntry, initialState);

  return (
    <li className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-semibold text-zinc-900">{name}</span>
        <time dateTime={createdAtIso} className="text-xs text-zinc-500">
          {createdAtLabel}
          {edited && " (수정됨)"}
        </time>
      </div>

      {mode === "edit" ? (
        <form onSubmit={submitWith(updateAction)} className="mt-3 space-y-2">
          <input type="hidden" name="id" value={id} />
          <textarea
            name="message"
            defaultValue={message}
            rows={3}
            maxLength={LIMITS.message.max}
            required
            aria-label="수정할 메시지"
            className={inputClass}
          />
          <FieldError error={updateState.fieldErrors?.message} />
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="작성 시 입력한 비밀번호"
            required
            aria-label="비밀번호"
            className={inputClass}
          />
          <FieldError error={updateState.fieldErrors?.password} />
          <ErrorAlert state={updateState} />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setMode("view")} className={ghostButton}>
              취소
            </button>
            <button
              type="submit"
              disabled={updating}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {updating ? "저장 중…" : "저장"}
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-2 whitespace-pre-wrap break-words text-zinc-800">{message}</p>
      )}

      {mode === "delete" && (
        <form onSubmit={submitWith(deleteAction)} className="mt-3 space-y-2 rounded-lg bg-zinc-50 p-3">
          <input type="hidden" name="id" value={id} />
          <p className="text-sm text-zinc-700">이 글을 삭제하려면 작성 시 입력한 비밀번호를 입력하세요.</p>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="비밀번호"
            required
            aria-label="비밀번호"
            className={inputClass}
          />
          <FieldError error={deleteState.fieldErrors?.password} />
          <ErrorAlert state={deleteState} />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setMode("view")} className={ghostButton}>
              취소
            </button>
            <button
              type="submit"
              disabled={deleting}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? "삭제 중…" : "삭제"}
            </button>
          </div>
        </form>
      )}

      {mode === "view" && (
        <div className="mt-3 flex justify-end gap-2">
          <button type="button" onClick={() => setMode("edit")} className={ghostButton}>
            수정
          </button>
          <button
            type="button"
            onClick={() => setMode("delete")}
            className="rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
          >
            삭제
          </button>
        </div>
      )}
    </li>
  );
}
