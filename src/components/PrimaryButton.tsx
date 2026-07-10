import Button, { type ButtonProps } from './Button'

/** メインCTA（青〜ネイビーのグラデーション） */
export default function PrimaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="primary" {...props} />
}
