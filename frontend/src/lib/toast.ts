import { toast as sonnerToast } from 'sonner'

type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading' | 'default'

interface ToastOptions {
  duration?: number
  description?: string
}

export function toast(type: ToastType, text: string, options?: ToastOptions) {
  const opts = { duration: 4000, ...options }

  switch (type) {
    case 'success':
      return sonnerToast.success(text, opts)
    case 'error':
      return sonnerToast.error(text, opts)
    case 'info':
      return sonnerToast.info(text, opts)
    case 'warning':
      return sonnerToast.warning(text, opts)
    case 'loading':
      return sonnerToast.loading(text, opts)
    default:
      return sonnerToast(text, opts)
  }
}
