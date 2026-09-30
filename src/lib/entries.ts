import "server-only";
import bcrypt from "bcryptjs";
import { getSql } from "./db";

export type Entry = {
  id: number;
  name: string;
  message: string;
  createdAt: Date;
  updatedAt: Date | null;
};

type EntryRow = {
  id: number;
  name: string;
  message: string;
  created_at: Date;
  updated_at: Date | null;
};

function toEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    name: row.name,
    message: row.message,
    createdAt: new Date(row.created_at),
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
  };
}

export async function listEntries(): Promise<Entry[]> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, name, message, created_at, updated_at
    FROM entries
    ORDER BY created_at DESC, id DESC
  `) as EntryRow[];
  return rows.map(toEntry);
}

export async function insertEntry(input: { name: string; message: string; password: string }) {
  const sql = getSql();
  const hash = await bcrypt.hash(input.password, 10);
  await sql`
    INSERT INTO entries (name, message, password_hash)
    VALUES (${input.name}, ${input.message}, ${hash})
  `;
}

export type AuthResult = "ok" | "not_found" | "wrong_password";

async function checkPassword(id: number, password: string): Promise<AuthResult> {
  const sql = getSql();
  const rows = (await sql`SELECT password_hash FROM entries WHERE id = ${id}`) as {
    password_hash: string;
  }[];
  if (rows.length === 0) return "not_found";
  return (await bcrypt.compare(password, rows[0].password_hash)) ? "ok" : "wrong_password";
}

export async function updateEntryMessage(id: number, password: string, message: string): Promise<AuthResult> {
  const auth = await checkPassword(id, password);
  if (auth !== "ok") return auth;
  const sql = getSql();
  const rows = await sql`
    UPDATE entries SET message = ${message}, updated_at = now()
    WHERE id = ${id}
    RETURNING id
  `;
  return rows.length ? "ok" : "not_found";
}

export async function deleteEntry(id: number, password: string): Promise<AuthResult> {
  const auth = await checkPassword(id, password);
  if (auth !== "ok") return auth;
  const sql = getSql();
  const rows = await sql`DELETE FROM entries WHERE id = ${id} RETURNING id`;
  return rows.length ? "ok" : "not_found";
}
