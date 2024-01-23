export function negativeSafeMod(n: number, m: number) {
  return ((n % m) + m) % m
}
