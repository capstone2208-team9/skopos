import TextInput from 'components/shared/TextInput'
import { FieldArray, FieldProps } from 'formik'
import React from 'react'
import {Button} from 'react-daisyui'
import { AiOutlinePlus, AiOutlineDelete} from 'react-icons/ai'


type HeaderFormProps = FieldProps

export default function HeaderFieldArray ({ form }: HeaderFormProps) {
  return (
    <div>
      <div className='flex gap-4 items-center'>
        <FieldArray
          name='headers'
          render={arrayHelpers => (
            <>
              {form.values.headers.length > 0 ? (
                <div className='flex flex-col'>
                  {
                    form.values.headers.map((_, index) => (
                <div key={index} className='grid grid-cols-3 gap-4 items-end'>
                  <TextInput placeholder='key' name={`headers.${index}.0`}  />
                  <TextInput placeholder='value' name={`headers.${index}.1`}  />
                  <div className='flex gap-2'>
                    <Button className='bg-viridian-green mt-0.5' type="button"
                            onClick={() => arrayHelpers.push(['', ''])}
                    ><AiOutlinePlus size={16}/></Button>
                    <Button className='bg-cedar-chest mt-0.5' type="button"
                            onClick={() => arrayHelpers.remove(index)}
                    ><AiOutlineDelete size={16}/></Button>
                  </div>

                </div>
              ))
                  }
                </div>
              ) : (
                <Button startIcon={<AiOutlinePlus/>} className='bg-viridian-green m-auto w-1/2' type="button"
                        onClick={() => arrayHelpers.push(['', ''])}
                >Add A Header</Button>
              )}
            </>
          )}
        />
      </div>
    </div>
  )
}
