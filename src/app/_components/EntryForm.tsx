"use client";

import { useActionState, useRef, startTransition, type FormEvent } from "react";
import { createEntry, type ActionState } from "@/app/actions";
import { LIMITS } from "@/lib/validation";
import { FieldError } from "./FieldError";

const initialState: ActionState = { ok: false };

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

export function EntryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await createEntry(prev, formData);
    if (result.ok) formRef.current?.reset();
    return result;
  }, initialState);

  // Submit manually so a failed validation keeps what the user typed.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-zinc-900">방명록 남기기</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-zinc-700">
            이름
          </label>
          <input id="name" name="name" maxLength={LIMITS.name.max} required className={inputClass} />
          <FieldError error={state.fieldErrors?.name} />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-zinc-700">
            비밀번호 <span className="font-normal text-zinc-500">(수정·삭제 시 필요)</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={LIMITS.password.min}
            maxLength={LIMITS.password.max}
            required
            className={inputClass}
          />
          <FieldError error={state.fieldErrors?.password} />
        </div>
      </div>
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-zinc-700">
          메시지
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          maxLength={LIMITS.message.max}
          required
          className={inputClass}
        />
        <FieldError error={state.fieldErrors?.message} />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p role="status" className={`text-sm ${state.ok ? "text-emerald-600" : "text-red-600"}`}>
          {state.message}
        </p>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {pending ? "등록 중…" : "등록"}
        </button>
      </div>
    </form>
  );
}
