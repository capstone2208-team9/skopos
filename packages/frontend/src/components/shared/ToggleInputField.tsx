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

  const title = field.name.split('.').at(-1)?.toUpperCase()

  return (
    <div className='flex items-center justify-between my-2'>
      <div className='flex gap-4'>
        <Form.Label htmlFor={`${title?.toLowerCase()}-notification`}>
          <span className='sr-only'>Toggle {title}</span>
          <Toggle size='lg' id={`${title?.toLowerCase()}-notification`} checked={checked}
                  onChange={handleToggle}
                  className="m-2 bg-sky-blue" />
        </Form.Label>
        <div className='form-control'>
          <Form.Label htmlFor={field.name} title={checked ? '' : title} className='flex flex-col relative'>
            {checked && <span className='sr-only'>{title}</span>}
            <Input id={field.name} {...field} placeholder={placeholder} />
          </Form.Label>
          {meta && meta.error && <span className='text-cedar-chest'>{meta.error}</span>}
        </div>
      </div>
    </div>

  )
}