export function getUserColorIndex(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return (hash % 4) + 1;
}

export function getUserColorClass(seed: string): string {
  return `user-color-${getUserColorIndex(seed)}`;
}

export function getUserColorVar(seed: string): string {
  return `var(--color-user-${getUserColorIndex(seed)})`;
}