import React, {useState} from 'react'
import { Form, Input, Toggle } from "react-daisyui";
import {FieldProps} from 'formik'

type Props = FieldProps & {
  placeholder?: string
}

export default function ToggleInputField({field, form, placeholder, meta}: Props) {
  const [checked, setChecked] = useState(false)

  const handleToggle: React.ChangeEventHandler<HTMLInputElement> = ({target}) => {
    const {checked} = target
    if (!checked) {
      form.setFieldValue(field.name, '')
    }
    setChecked(checked)
  }

  const title = field.name.split('.').at(-1)?.toUpperCase()

  return (
    <div className='flex items-center justify-between my-2'>
      <div className='flex items-center gap-4'>
        <Form.Label htmlFor={`${title?.toLowerCase()}-notification`}>
          <span className='sr-only'>Toggle {title}</span>
          <Toggle size='lg' id={`${title?.toLowerCase()}-notification`} checked={checked}
                  onChange={handleToggle}
                  className="m-2 bg-sky-blue" />
        </Form.Label>
        <div className='form-control'>
          <Form.Label htmlFor={field.name} title={checked ? '' : title} className='flex flex-col relative'>
            {!checked && <span className='sr-only'>{title}</span>}
            {checked && <Input id={field.name} {...field} placeholder={placeholder} />}
          </Form.Label>
          {meta && meta.error && <span className='text-cedar-chest'>{meta.error}</span>}
        </div>
      </div>
    </div>

  )
}