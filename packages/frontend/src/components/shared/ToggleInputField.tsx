import {useState} from 'react'
import { Form, Input, Toggle } from "react-daisyui";

interface Props {
  name: string
  placeholder?: string
  value: string
  onChangeValue: (name: string, value: string) => void
}

export default function ToggleInputField({name, placeholder = '', value, onChangeValue}: Props) {
  const [checked, setChecked] = useState(Boolean(value))
  const type = name === 'email' ? 'email' : 'text'

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    onChangeValue(name, e.target.value)
  }

  const handleToggle = () => {
    onChangeValue(name, '')
    setChecked(prev => !prev)
  }

  return (
    <div className='flex items-center justify-between my-2'>
      <div className='flex gap-4'>
        <Toggle size='lg' id="notification" checked={checked}
                onChange={handleToggle}
                className="m-2 bg-sky-blue" />
        {checked ? (
          <Input type={type} name={name} value={value || ''}
                 onChange={handleChange} placeholder={placeholder} />
        ) : (
          <Form.Label htmlFor={name} title={name.toUpperCase()}/>
        )}
      </div>
    </div>

  )
}