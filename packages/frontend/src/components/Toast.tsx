import {IToast, useToast} from 'hooks/ToastProvider'
import {useEffect} from 'react'
import {Alert, Toast as DaisyUIToast} from 'react-daisyui'

interface Props {
  toast: IToast
}

export default function Toast({toast: {id, status, content}}: Props) {
  const {removeToast} = useToast()

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(id)
    }, 3000)
    return () => clearTimeout(timer)
  }, [id, removeToast])
  return (
    <DaisyUIToast horizontal='end' vertical='top'>
      <Alert role='alert' status={status}>
        {content}
      </Alert>
    </DaisyUIToast>
  )

}