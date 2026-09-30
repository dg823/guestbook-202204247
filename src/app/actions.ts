"use server";

import { revalidatePath } from "next/cache";
import { deleteEntry, insertEntry, updateEntryMessage, type AuthResult } from "@/lib/entries";
import { readField, validate } from "@/lib/validation";

export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<Record<"name" | "message" | "password", string>>;
};

const AUTH_MESSAGES: Record<Exclude<AuthResult, "ok">, { update: string; delete: string }> = {
  wrong_password: {
    update: "비밀번호가 일치하지 않아 수정할 수 없습니다.",
    delete: "비밀번호가 일치하지 않아 삭제할 수 없습니다.",
  },
  not_found: {
    update: "이미 삭제되었거나 존재하지 않는 글입니다.",
    delete: "이미 삭제되었거나 존재하지 않는 글입니다.",
  },
};

const SERVER_ERROR = "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";

function readId(formData: FormData) {
  const id = Number(formData.get("id"));
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function collectErrors(checks: [keyof NonNullable<ActionState["fieldErrors"]>, string | null][]) {
  const fieldErrors: ActionState["fieldErrors"] = {};
  for (const [field, error] of checks) if (error) fieldErrors[field] = error;
  return Object.keys(fieldErrors).length ? fieldErrors : null;
}

export async function createEntry(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = readField(formData, "name");
  const message = readField(formData, "message");
  const password = readField(formData, "password", false);

  const fieldErrors = collectErrors([
    ["name", validate("name", name)],
    ["message", validate("message", message)],
    ["password", validate("password", password)],
  ]);
  if (fieldErrors) return { ok: false, fieldErrors };

  try {
    await insertEntry({ name, message, password });
  } catch (error) {
    console.error(error);
    return { ok: false, message: SERVER_ERROR };
  }
  revalidatePath("/");
  return { ok: true, message: "방명록이 등록되었습니다." };
}

export async function updateEntry(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = readId(formData);
  if (!id) return { ok: false, message: AUTH_MESSAGES.not_found.update };
  const message = readField(formData, "message");
  const password = readField(formData, "password", false);

  const fieldErrors = collectErrors([
    ["message", validate("message", message)],
    ["password", password ? null : "비밀번호를 입력해 주세요."],
  ]);
  if (fieldErrors) return { ok: false, fieldErrors };

  let result: AuthResult;
  try {
    result = await updateEntryMessage(id, password, message);
  } catch (error) {
    console.error(error);
    return { ok: false, message: SERVER_ERROR };
  }
  if (result !== "ok") return { ok: false, message: AUTH_MESSAGES[result].update };
  revalidatePath("/");
  return { ok: true };
}

export async function removeEntry(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = readId(formData);
  if (!id) return { ok: false, message: AUTH_MESSAGES.not_found.delete };
  const password = readField(formData, "password", false);
  if (!password) return { ok: false, fieldErrors: { password: "비밀번호를 입력해 주세요." } };

  let result: AuthResult;
  try {
    result = await deleteEntry(id, password);
  } catch (error) {
    console.error(error);
    return { ok: false, message: SERVER_ERROR };
  }
  if (result !== "ok") return { ok: false, message: AUTH_MESSAGES[result].delete };
  revalidatePath("/");
  return { ok: true };
}
