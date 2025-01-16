import { create } from 'zustand'

interface Toast {
  id?: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Toast) => void
  dismissToast: (id: string) => void
}

const useToast = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => 
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: Math.random().toString() }],
    })),
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}))

function toast(props: Toast) {
  const { addToast } = useToast.getState()
  addToast(props)
}

export { useToast, toast } 