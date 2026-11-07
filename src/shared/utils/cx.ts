/** 조건부 className 합치기: cx('a', isOn && 'b') → 'a b' */
export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}
