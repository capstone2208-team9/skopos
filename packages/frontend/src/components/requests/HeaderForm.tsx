import React, { useState } from 'react'
import {Button} from 'react-daisyui'
import { AiOutlinePlus} from 'react-icons/ai'

interface HeaderFormProps {
  headers: Record<string, string|number>
  setHeaders: (headers: Record<string, string|number>) => void
}

export default function HeaderForm ({ headers, setHeaders }: HeaderFormProps) {
  const [key, setKey] = useState("")
  const [value, setValue] = useState("")

  const handleAddHeader = ()=> {
    setHeaders({
      ...headers,
      [key]: value
    })
  }

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const {name, value} = e.target
    if (name === 'key') {
      setKey(value)
    } else {
      setValue(value)
    }
  }

  return (
    <div>
      <div className='flex gap-4 items-center'>
        <input className='input input-bordered' name='key' value={key} onChange={handleChange} placeholder='key'/>
        <input className='input input-bordered' name='value' value={value} onChange={handleChange} placeholder='value'/>
        <Button className='bg-viridian-green mt-0.5' type="button" onClick={handleAddHeader}
                disabled={key === '' || value === ''}
        ><AiOutlinePlus size={16}/></Button>
      </div>
    </div>
  )
}
