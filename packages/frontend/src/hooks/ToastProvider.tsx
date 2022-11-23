import {createCtx} from 'hooks/createCtx'
import {v4 as uuidv4} from 'uuid'
import React, {useCallback, useState} from 'react'
import Toast from 'components/shared/Toast'

interface Context {
  toasts: IToast[]
  addToast: (content: string, status: ToastStatus) => void
  removeToast: (id: string) => void
}
const [useToast, Provider] = createCtx<Context>()

export type ToastStatus = 'info' | 'success' | 'warning' | 'error' | undefined

export interface IToast {
  id: string
  content: string
  status: ToastStatus
}

interface Props {
  children: React.ReactNode
}

const ToastProvider = ({children}: Props) => {
  const [toasts, setToasts] = useState<IToast[]>([])

  const addToast = useCallback((content: string, status: ToastStatus) => {
    const id = uuidv4()
    setToasts(toasts => [...toasts, {id, content, status}])
  }, [setToasts])

  const removeToast = useCallback((id: string) => {
    setToasts(toasts => toasts.filter(t => t.id !== id))
  }, [setToasts])

  return (
    <Provider value={{toasts: Object.values(toasts), addToast, removeToast}}>
      {children}
      <>
        {toasts.map(toast => (<Toast key={toast.id} toast={toast}/>))}
      </>
    </Provider>
  )
}

export { useToast, ToastProvider}