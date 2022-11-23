import {FieldProps} from 'formik'
import React from 'react'
import {Form} from 'react-daisyui'
import Select, {SingleValue, SingleValueProps} from 'react-select'

interface Option {
  label: string
  value: string
}

type SelectFieldProps = FieldProps & SingleValueProps

export default function SelectField({field, options, meta, form}: SelectFieldProps) {

  const handleChange = (newValue: unknown) => {
    form.setFieldValue(field.name, (newValue as SingleValue<Option>)?.value)
  }

    return (
      <div className='form-control relative'>
        <Form.Label className='capitalize' htmlFor={field.name} title={field.name.split('.').at(-1)}/>
        <Select
          options={options}
          onChange={handleChange}
          defaultValue={{label: field.value, value: field.value}}
          onBlur={field.onBlur}
          styles={{
            control: (baseStyles) => ({
              ...baseStyles,
              height: '3rem',
            })
          }}
        />
        {meta.touched && meta.error ? (
          <p className='text-cedar-chest'>{meta.error}</p>
        ) : (<></>)}
      </div>
    )
}