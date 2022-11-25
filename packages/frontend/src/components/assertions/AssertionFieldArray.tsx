import { useMutation } from '@apollo/client'
import ConfirmDeleteModal from 'components/shared/ConfirmDeleteModal'
import Loader from 'components/shared/Loader'
import SelectField from 'components/shared/SelectField'
import TextInput from 'components/shared/TextInput'
import {Field, FieldArray, FieldProps, FieldArrayRenderProps, FormikProps} from 'formik'
import {DeleteOneAssertion} from 'graphql/mutations'
import {GetRequests} from 'graphql/queries'
import {useState} from 'react'
import {Button} from 'react-daisyui'
import {AiOutlineDelete, AiOutlinePlus} from 'react-icons/ai'
import { useParams } from 'react-router-dom'
import {getRequestVariables} from 'routes/RequestList'
import {AssertionInput, comparisonTypes} from 'types'


export default function AssertionFieldArray(props: FieldProps) {
  const {form} = props
  const {collectionId} = useParams()
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteOneAssertion, {loading}] = useMutation(DeleteOneAssertion, {
    update(cache, {data: {deleteOneAssertion}}) {
      cache.updateQuery({ query: GetRequests, variables: getRequestVariables(collectionId) }, (data) => {
        const request = data.requests.find(r => r.assertions.find(a => a.id === deleteOneAssertion.id))
        return {requests: data.requests.map(r=> {
            return r.id === request.id ? (
              {...r, assertions: r.assertions.filter(a => a.id !== deleteOneAssertion.id)}
            ) : r
          })}
      });
    },
  })

  async function handleRemove(assertions: AssertionInput[], index: number, arrayHelpers: FieldArrayRenderProps) {
    const assertion = assertions[index]
    if (assertion.id) {
      await deleteOneAssertion({
        variables: {
          where: { id: assertion.id}
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

  return (
    <>
      <FieldArray
        name='assertions'
        render={arrayHelpers => (
          <>
            <Button size='sm' startIcon={<AiOutlinePlus/>} className='bg-viridian-green m-auto w-1/2' type='button'
                    onClick={() => arrayHelpers.push({
                      property: 'status', expected: '', comparison: 'is not equal to'
                    })}>
              <span>Add Assertion</span>
            </Button>
            {form.values.assertions.map((value, index) => (
              <div className='border-b-2 border-gray-300 pb-6' key={index}>
                <div className={`grid ${['body', 'headers'].includes(form.values.assertions[index]) ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
                  <Field
                    name={`assertions[${index}].property`}
                  >
                    {(props) => (
                      <SelectField
                        {...props}
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
                        {...props}
                        options={comparisonTypes.map(c => ({
                          label: c, value: c
                        }))}/>
                    )}
                  </Field>
                </div>
                <div className='flex gap-4 items-end w-full'>
                  {form.values.assertions[index].property === 'body' && (
                    <TextInput prefix='body.' label='path' name={`assertions[${index}].path`} placeholder='body.'/>
                  )}
                  {form.values.assertions[index].property === 'headers' && (
                    <TextInput prefix='headers.' label='path' name={`assertions[${index}].path`} placeholder='headers.'/>
                  )}
                  {!['is null', 'is not null'].includes(form.values.assertions[index].comparison) && (
                    <TextInput label='expected' name={`assertions[${index}].expected`}/>
                  )}
                  <Button className='bg-cedar-chest w-12' type='button'
                          onClick={() => isNew(form, index) ? setModalOpen(true) : arrayHelpers.remove(index)}
                  >
                    <span className='sr-only'>Delete</span>
                    {loading ? <Loader size='16'/> : <AiOutlineDelete/>}</Button>
                  <ConfirmDeleteModal onDelete={() => handleRemove(form.values.assertions, index, arrayHelpers)}
                                      onCancel={() => setModalOpen(false)} open={modalOpen}
                  />
                </div>
              </div>
            ))}
          </>
        )}
      />
    </>
  )
}