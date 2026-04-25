'use client'

import { useLoginLogic } from './hooks/useLoginLogic'
import LoginForm from './components/LoginForm'

export default function LoginPage() {
  const formProps = useLoginLogic()
  return <LoginForm {...formProps} />
}
