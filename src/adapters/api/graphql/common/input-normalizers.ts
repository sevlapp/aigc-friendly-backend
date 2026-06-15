// src/adapters/api/graphql/common/input-normalizers.ts

export function trimText(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  return String(value || '').trim();
}
