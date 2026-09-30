export const LIMITS = {
  name: { min: 1, max: 30 },
  message: { min: 1, max: 500 },
  password: { min: 4, max: 64 },
} as const;

type Field = keyof typeof LIMITS;

const LABELS: Record<Field, string> = {
  name: "이름",
  message: "메시지",
  password: "비밀번호",
};

export function readField(formData: FormData, field: Field, trim = true) {
  const raw = formData.get(field);
  const value = typeof raw === "string" ? raw : "";
  return trim ? value.trim() : value;
}

export function validate(field: Field, value: string): string | null {
  const { min, max } = LIMITS[field];
  const length = [...value].length;
  if (length < min) return min === 1 ? `${LABELS[field]}을(를) 입력해 주세요.` : `${LABELS[field]}은(는) ${min}자 이상이어야 합니다.`;
  if (length > max) return `${LABELS[field]}은(는) ${max}자 이하여야 합니다.`;
  return null;
}
