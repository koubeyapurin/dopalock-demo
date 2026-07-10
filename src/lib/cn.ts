/** falsy を除いて className を連結する小さなユーティリティ */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
