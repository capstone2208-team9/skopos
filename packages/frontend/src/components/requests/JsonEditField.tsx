import { FieldProps } from 'formik'
import {highlight, languages} from 'prismjs'
import Editor from 'react-simple-code-editor'

export default function JsonEditField({form, field, meta }: FieldProps) {
  const handleChange = (value: string) => {
    form.setFieldValue(field.name, value)
  }
  return (
    <label className='w-full relative' htmlFor='body'>
      <Editor
        name={field.name}
        highlight={code => highlight(code, languages.js, 'js')}
        value={field.value}
        onValueChange={handleChange}
        placeholder='{}'
        padding={10}
        className='bg-base-100 border-2 border-base-200 w-full'
      />
      {meta.touched && meta.error ? (
        <p className='absolute -bottom-5 text-xs text-cedar-chest'>{meta.error}</p>
      ) : (<></>)}
    </label>
  )
}