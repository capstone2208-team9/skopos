import React, { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

function createWrapper(wrapperId: string) {
  const wrapper = document.createElement("div");
  wrapper.setAttribute("id", wrapperId);
  document.body.appendChild(wrapper);
  return wrapper
}

interface Props {
  children: React.ReactNode
  wrapperId: string
}

function ReactPortal({children, wrapperId}: Props) {
  const [wrapper, setWrapper] = useState<HTMLElement | null>(null)

  useLayoutEffect(() => {
    let el = document.getElementById(wrapperId)
    let created = false
    if (!el) {
      created = true
      el = createWrapper(wrapperId)
    }
    setWrapper(el)
    return () => {
      if (created && el?.parentNode) {
        el.parentNode.removeChild(el)
      }
    }
  }, [wrapperId]);

  if (wrapper === null) return <></>
  return createPortal(children, wrapper)
}

interface ModalProps {
  id: string
  children: React.ReactNode
}

export default function ModalPortal({id, children}: ModalProps) {
  console.log('portalId', id)
  return <ReactPortal wrapperId={id}>{children}</ReactPortal>
}