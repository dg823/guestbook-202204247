"use client";

import { useActionState, useState, startTransition, type FormEvent } from "react";
import { removeEntry, updateEntry, type ActionState } from "@/app/actions";
import { LIMITS } from "@/lib/validation";
import { CharCount, countChars } from "./CharCount";
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

// Submit manually so a rejected password doesn't wipe the rest of the form.
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

function PasswordInput({ placeholder }: { placeholder: string }) {
  return (
    <input
      name="password"
      type="password"
      autoComplete="current-password"
      placeholder={placeholder}
      required
      aria-label="비밀번호"
      className={inputClass}
    />
  );
}

function EditForm({ id, message, onDone }: { id: number; message: string; onDone: () => void }) {
  const [messageLength, setMessageLength] = useState(() => countChars(message));
  const [state, formAction, pending] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await updateEntry(prev, formData);
    if (result.ok) onDone();
    return result;
  }, initialState);

  return (
    <form onSubmit={submitWith(formAction)} className="mt-3 space-y-2">
      <input type="hidden" name="id" value={id} />
      <textarea
        name="message"
        defaultValue={message}
        rows={3}
        maxLength={LIMITS.message.max}
        required
        aria-label="수정할 메시지"
        onChange={(e) => setMessageLength(countChars(e.target.value))}
        className={inputClass}
      />
      <CharCount count={messageLength} />
      <FieldError error={state.fieldErrors?.message} />
      <PasswordInput placeholder="작성 시 입력한 비밀번호" />
      <FieldError error={state.fieldErrors?.password} />
      <ErrorAlert state={state} />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className={ghostButton}>
          취소
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {pending ? "저장 중…" : "저장"}
        </button>
      </div>
    </form>
  );
}

function DeleteForm({ id, onCancel }: { id: number; onCancel: () => void }) {
  const [state, formAction, pending] = useActionState(removeEntry, initialState);

  return (
    <form onSubmit={submitWith(formAction)} className="mt-3 space-y-2 rounded-lg bg-zinc-50 p-3">
      <input type="hidden" name="id" value={id} />
      <p className="text-sm text-zinc-700">이 글을 삭제하려면 작성 시 입력한 비밀번호를 입력하세요.</p>
      <PasswordInput placeholder="비밀번호" />
      <FieldError error={state.fieldErrors?.password} />
      <ErrorAlert state={state} />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className={ghostButton}>
          취소
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {pending ? "삭제 중…" : "삭제"}
        </button>
      </div>
    </form>
  );
}

export function EntryItem({ id, name, message, createdAtLabel, createdAtIso, edited }: Props) {
  const [mode, setMode] = useState<Mode>("view");
  const close = () => setMode("view");

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
        <EditForm id={id} message={message} onDone={close} />
      ) : (
        <p className="mt-2 whitespace-pre-wrap break-words text-zinc-800">{message}</p>
      )}

      {mode === "delete" && <DeleteForm id={id} onCancel={close} />}

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
