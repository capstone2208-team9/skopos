import TextInput from 'components/shared/TextInput'
import {FieldArray, FieldProps} from 'formik'
import React, {useEffect, useRef} from 'react'
import {Button} from 'react-daisyui'
import {AiOutlineDelete, AiOutlinePlus} from 'react-icons/ai'


type HeaderFormProps = FieldProps

export default function HeaderFieldArray({form}: HeaderFormProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const handleAddHeader = (arrayHelpers: {push: (obj: any) => void}) => {
    arrayHelpers.push(['', ''])
    ref.current?.scrollIntoView({behavior: 'smooth'})
  }

  useEffect(() => {
    ref.current?.scrollIntoView({behavior: 'smooth'})
  }, [ref])

  return (
    <div>
      <div className='flex gap-4 items-center'>
        <FieldArray
          name='headers'
          render={arrayHelpers => (
            <div className='flex flex-col flex-1'>
              {
                form.values.headers.map((_, index) => (
                  <div key={index} className='w-full flex gap-4 items-end last-of-type:mb-4'>
                    <TextInput label='key' wrapperClassName='flex-1' placeholder='content-type' name={`headers.${index}.0`}/>
                    <TextInput label='value' wrapperClassName='flex-1' placeholder='application/json' name={`headers.${index}.1`}/>
                    <Button className='bg-cedar-chest mt-0.5' type='button'
                            onClick={() => arrayHelpers.remove(index)}
                    ><AiOutlineDelete size={16}/></Button>
                  </div>
                ))
              }

              <Button ref={ref} size='sm' startIcon={<AiOutlinePlus/>}
                      className='mt-5 bg-viridian-green m-auto w-1/2' type='button'
                      onClick={() => handleAddHeader(arrayHelpers)}
              >Add A Header</Button>
            </div>
            )}
        />
      </div>
    </div>
  )
}
