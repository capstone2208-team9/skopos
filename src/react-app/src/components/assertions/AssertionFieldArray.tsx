import {useMutation} from '@apollo/client'
import ConfirmDeleteModal from 'components/shared/ConfirmDeleteModal'
import Loader from 'components/shared/Loader'
import SelectField from 'components/shared/SelectField'
import TextInput from 'components/shared/TextInput'
import {Field, FieldArray, FieldArrayRenderProps, FieldProps, FormikProps} from 'formik'
import {DeleteOneAssertion} from 'graphql/mutations'
import {GetRequests} from 'graphql/queries'
import {useEffect, useRef, useState} from 'react'
import {Button} from 'react-daisyui'
import {AiOutlineDelete, AiOutlinePlus} from 'react-icons/ai'
import {useParams} from 'react-router-dom'
import {getRequestVariables} from 'routes/RequestList'
import {AssertionInput, comparisonTypes} from 'types'


export default function AssertionFieldArray(props: FieldProps) {
  const {form} = props
  const {collectionId} = useParams()
  const [modalOpen, setModalOpen] = useState(false)
  const ref = useRef<HTMLButtonElement>(null)
  const [deleteOneAssertion, {loading}] = useMutation(DeleteOneAssertion, {
    update(cache, {data: {deleteOneAssertion}}) {
      cache.updateQuery({query: GetRequests, variables: getRequestVariables(collectionId)}, (data) => {
        const request = data.requests.find(r => r.assertions.find(a => a.id === deleteOneAssertion.id))
        return {
          requests: data.requests.map(r => {
            return r.id === request.id ? (
              {...r, assertions: r.assertions.filter(a => a.id !== deleteOneAssertion.id)}
            ) : r
          })
        }
      })
    },
  })

  const handleAddHeader = (arrayHelpers: { push: (obj: any) => void }) => {
    arrayHelpers.push({
      property: 'status', expected: '', comparison: 'is not equal to'
    })
    ref.current?.scrollIntoView({behavior: 'smooth'})
  }

  async function handleRemove(assertions: AssertionInput[], index: number, arrayHelpers: FieldArrayRenderProps) {
    const assertion = assertions[index]
    if (assertion.id) {
      await deleteOneAssertion({
        variables: {
          where: {id: assertion.id}
        }
      })
      arrayHelpers.remove(index)
    } else {
      arrayHelpers.remove(index)
    }
    setModalOpen(false)
  }

  const isNew = (form: FormikProps<any>, index: number) => {
    return !!form.values.assertions[index].id
  }

  const comparisonOptions = comparisonTypes.map(c => ({
    label: c, value: c
  }))

  useEffect(() => {
    ref.current?.scrollIntoView({behavior: 'smooth'})
  }, [ref])

  return (
    <>
      <FieldArray
        name='assertions'
        render={arrayHelpers => (
          <>
            {form.values.assertions.map((value, index) => {
              const assertions = form.values.assertions
              return (
                <div className='border-b-2 border-gray-300 pb-6' key={index}>
                  <div
                    className={`grid ${['body', 'headers'].includes(assertions[index]) ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
                    <Field
                      name={`assertions[${index}].property`}
                    >
                      {(props) => (
                        <SelectField
                          label='Property'
                          {...props}
                          defaultValue={{
                            label: assertions[index].property,
                            value: assertions[index].property
                          }}
                          options={[
                            {label: 'Status', value: 'status'},
                            {label: 'Latency', value: 'latency'},
                            {label: 'Body', value: 'body'},
                            {label: 'Headers', value: 'headers'},
                          ]}/>
                      )}

                    </Field>
                    <Field name={`assertions[${index}].comparison`}>
                      {props => (
                        <SelectField
                          label='Comparison'
                          defaultValue={assertions[index].comparison ? {
                            label: assertions[index].comparison,
                            value: assertions[index].comparison
                          } : comparisonOptions[0]}
                          {...props}
                          options={comparisonOptions}/>
                      )}
                    </Field>
                  </div>
                  <div className='flex gap-4 items-end w-full'>
                    {assertions[index].property === 'body' && (
                      <TextInput prefix='body' label='path' name={`assertions[${index}].path`}
                                 placeholder='body. or body[0]'/>
                    )}
                    {assertions[index].property === 'headers' && (
                      <TextInput prefix='headers' label='path' name={`assertions[${index}].path`}
                                 placeholder='headers. or headers[content-type]'/>
                    )}
                    {!['is null', 'is not null'].includes(assertions[index].comparison) && (
                      <TextInput label='expected' name={`assertions[${index}].expected`}/>
                    )}
                    <Button size='sm' className='bg-cedar-chest' type='button'
                            onClick={() => isNew(form, index) ? setModalOpen(true) : arrayHelpers.remove(index)}
                    >
                      <span className='sr-only'>Delete</span>
                      {loading ? <Loader size='16'/> : <AiOutlineDelete size='16'/>}</Button>
                    <ConfirmDeleteModal onDelete={() => handleRemove(assertions, index, arrayHelpers)}
                                        onCancel={() => setModalOpen(false)} open={modalOpen}
                    />
                  </div>
                </div>
              )
            })}

            <Button
              ref={ref} size='sm'
              startIcon={<AiOutlinePlus/>} className='bg-viridian-green m-auto w-1/2' type='button'
              onClick={() => handleAddHeader(arrayHelpers)}>
              <span>Add Assertion</span>
            </Button>
          </>
        )}
      />
    </>
  )
}