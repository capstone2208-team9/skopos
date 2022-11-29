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
  label?: string
  placeholder?: string
}

export default function SelectField({placeholder, label, field, options, meta, form, isMulti, defaultValue }: SelectFieldProps) {
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
        <Form.Label id={`select-${field.name}`}
                    className='bg-transparent pb-0.5 gap-1.5 flex flex-col items-start capitalize'
                    htmlFor={field.name} title={label}
        >
        <Select
          aria-labelledby={`select-${field.name}`}
          inputId={field.name}
          options={options}
          onChange={handleChange}
          placeholder={placeholder}
          defaultValue={defaultValue || undefined}
          onBlur={field.onBlur}
          classNamePrefix='select'
          isMulti={isMulti}
          theme={(theme) => ({
            ...theme,
            colors: {
              ...theme.colors,
              primary: '#24C5E3',
              primary25: '#BCE2E8',
            }
          })}
          styles={{
            container: (baseStyles) => ({
              ...baseStyles,
              minWidth: '100%',
            }),
            control: (baseStyles) => ({
              ...baseStyles,
              minHeight: '2.5rem',
            })
          }}
        />
        </Form.Label>
        {meta.touched && meta.error ? (
          <span className='text-cedar-chest'>{meta.error}</span>
        ) : (<></>)}
      </div>
    )
}