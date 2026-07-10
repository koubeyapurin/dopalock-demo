import Button, { type ButtonProps } from './Button'

/** 補助アクション（白背景・枠線） */
export default function SecondaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="secondary" {...props} />
}
