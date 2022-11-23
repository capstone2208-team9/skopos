import {useState} from 'react'
import { Form, Input, Toggle } from "react-daisyui";
import {FieldProps} from 'formik'

type Props = FieldProps & {
  placeholder?: string
}

export default function ToggleInputField({field, placeholder, meta}: Props) {
  const [checked, setChecked] = useState(false)

  const handleToggle = () => {
    setChecked(prev => !prev)
  }

  return (
    <div className='flex items-center justify-between my-2'>
      <div className='flex gap-4'>
        <Toggle size='lg' id="notification" checked={checked}
                onChange={handleToggle}
                className="m-2 bg-sky-blue" />
        {checked ? (
          <div className='flex flex-col relative'>
            <Input {...field} placeholder={placeholder} />
            {meta && meta.error && <span className='text-cedar-chest'>{meta.error}</span>}
          </div>
        ) : (
          <Form.Label htmlFor={field.name} title={field.name.split('.').at(-1)?.toUpperCase()}/>
        )}
      </div>
    </div>

  )
}