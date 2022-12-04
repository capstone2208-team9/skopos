import React from 'react'
import { useField } from 'formik'
import {Input, Form} from 'react-daisyui'

interface Props {
  wrapperClassName?: string
  label?: string
  name: string
  placeholder?: string
  placeholderPosition?: 'bottom' | 'right'
  prefix?: string
}

export default function TextInput ({ prefix = '',wrapperClassName='', placeholderPosition = 'right', label, ...props }: Props) {
  const [field, meta, helpers] = useField(props.name)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {onChange, value, ...restField} = field
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const text = e.target.value
    e.target.value = prefix + text.substring(prefix.length)
    helpers.setValue(e.target.value)
  }
  const placeHolderClassName = placeholderPosition === 'right' ? '-bottom-5 ' : 'right-2 top-1/2 '
  return (
    <div className={`form-control w-full relative${wrapperClassName ? ` ${wrapperClassName}` : ''}`}>
      <Form.Label htmlFor={field.name} className='capitalize' title={label || ''}/>
      <Input className={`${meta.error && meta.touched ? 'outline outline-1 outline-cedar-chest ' : ''} focus:outline-offset-0 focus:outline-1 focus:outline-sky-blue`} id={field.name} {...restField} {...props}
        onChange={handleChange}
             value={value || prefix}
      />
      {meta.touched && meta.error ? (
        <span data-testid={`errors-${field.name}`}
           className={`${placeHolderClassName}absolute text-xs text-cedar-chest`}>
          {meta.error}
        </span>
      ) : (<></>)}
    </div>
  )
}
