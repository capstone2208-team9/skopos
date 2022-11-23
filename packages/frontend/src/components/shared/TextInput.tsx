import React from 'react'
import { useField } from 'formik'
import {Input, Form} from 'react-daisyui'

interface Props {
  label?: string
  name: string
  placeholder?: string
}

export default function TextInput ({ label, ...props }: Props) {
  const [field, meta] = useField(props.name)
  return (
    <div className='form-control relative'>
      <Form.Label className='capitalize' title={label || ''}/>
      <Input {...field} {...props}/>
      {meta.touched && meta.error ? (
        <p className='absolute -bottom-5 text-xs text-cedar-chest'>{meta.error}</p>
      ) : (<></>)}
    </div>
  )
}
