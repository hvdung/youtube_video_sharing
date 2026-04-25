'use client'

import { useRegisterLogic } from './hooks/useRegisterLogic'
import RegisterForm from './components/RegisterForm'

export default function RegisterPage() {
  const formProps = useRegisterLogic()
  return <RegisterForm {...formProps} />
}
