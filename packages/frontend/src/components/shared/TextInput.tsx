import React from 'react'
import { useField } from 'formik'
import {Input, Form} from 'react-daisyui'

interface Props {
  wrapperClassName?: string
  label?: string
  name: string
  placeholder?: string
}

export default function TextInput ({ wrapperClassName='', label, ...props }: Props) {
  const [field, meta] = useField(props.name)
  return (
    <div className={`form-control relative${wrapperClassName ? ` ${wrapperClassName}` : ''}`}>
      <Form.Label htmlFor={field.name} className='capitalize' title={label || ''}/>
      <Input className='h-12' id={field.name} {...field} {...props}/>
      {meta.touched && meta.error ? (
        <p className='absolute -bottom-5 text-xs text-cedar-chest'>{meta.error}</p>
      ) : (<></>)}
    </div>
  )
}
