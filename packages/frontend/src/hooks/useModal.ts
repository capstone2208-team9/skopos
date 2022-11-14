import { useCallback, useState } from "react";

export const useModal = () => {
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => {setOpen(prev => !prev)}, [])

  return [open, toggle] as const
}