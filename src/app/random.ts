export function pickRandom<T>(items: readonly [T, ...T[]]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}
