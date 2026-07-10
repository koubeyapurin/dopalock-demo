import Button, { type ButtonProps } from './Button'

/** 脱獄など注意を促すアクション（淡い赤） */
export default function DangerButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="danger" {...props} />
}
