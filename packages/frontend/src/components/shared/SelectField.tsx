import {FieldProps} from 'formik'
import React from 'react'
import {Form} from 'react-daisyui'
import Select, {SingleValue, SingleValueProps, MultiValueProps, MultiValue} from 'react-select'

interface Option {
  label: string
  value: string
}

type SelectFieldProps = FieldProps & SingleValueProps & MultiValueProps & {
  defaultValue?: Option
}

export default function SelectField({field, options, meta, form, isMulti, defaultValue }: SelectFieldProps) {
  const handleChange = (newValue: unknown) => {
    const singleOption = newValue as SingleValue<Option>
    if (singleOption && 'value' in singleOption) {
      return form.setFieldValue(field.name, singleOption.value)
    }
    const multiOption = newValue as MultiValue<Option>
    if (multiOption && 'values' in multiOption) {
      return form.setFieldValue(field.name, multiOption.map(v => v.value))
    }
  }

    return (
      <div className='form-control relative'>
        <Form.Label className='capitalize' htmlFor={field.name} title={field.name.split('.').at(-1)}/>
        <Select
          
          options={options}
          onChange={handleChange}
          defaultValue={defaultValue ? defaultValue : {label: field.value, value: field.value}}
          onBlur={field.onBlur}
          classNamePrefix='select'
          isMulti={isMulti}
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