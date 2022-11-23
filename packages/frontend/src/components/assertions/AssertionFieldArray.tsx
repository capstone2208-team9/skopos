import { useMutation } from '@apollo/client'
import ConfirmDeleteModal from 'components/shared/ConfirmDeleteModal'
import Loader from 'components/shared/Loader'
import SelectField from 'components/shared/SelectField'
import TextInput from 'components/shared/TextInput'
import {Field, FieldArray, FieldProps, FieldArrayRenderProps, FormikProps} from 'formik'
import {DeleteOneAssertion} from 'graphql/mutations'
import {GetRequests} from 'graphql/queries'
import {useState} from 'react'
import {Button, Input} from 'react-daisyui'
import {AiOutlineDelete, AiOutlinePlus} from 'react-icons/ai'
import { useParams } from 'react-router-dom'
import {getRequestVariables} from 'routes/RequestList'
import {AssertionInput, comparisonTypes} from 'types'


export default function AssertionFieldArray(props: FieldProps) {
  const {form } = props
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
            {form.values.assertions.length > 0 ? (
              <>
                {form.values.assertions.map((value, index) => (
                  <div key={index}>
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
                      {form.values.assertions[index].property === 'body' && (
                        <TextInput label='path' name={`assertions[${index}].property`}/>
                      )}
                      {form.values.assertions[index].property === 'headers' && (
                        <div className='form-control'>
                          <Field component={Input} name={`assertions[${index}].property`}/>
                        </div>
                      )}
                    </div>
                    <div className='grid grid-cols-3 gap-4 items-end'>
                      {!['is null', 'is not null'].includes(form.values.assertions[index].comparison) && (
                        <div className='form-control'>
                          <TextInput label='expected' name={`assertions[${index}].expected`}/>
                        </div>
                      )}
                      <div className='flex gap-2'>
                        <Button className='bg-viridian-green w-12' type='button' onClick={() => arrayHelpers.push({
                          property: 'status', expected: '', comparison: 'is not equal to'
                        })}>
                          <span className='sr-only'>Add</span>
                          <AiOutlinePlus/></Button>
                        <Button className='bg-cedar-chest w-12' type='button'
                                  // onClick={() => arrayHelpers.remove(index)}
                          onClick={() => isNew(form, index) ? setModalOpen(true) : arrayHelpers.remove(index)}
                        >
                          <span className='sr-only'>Delete</span>
                          {loading ? <Loader size='16'/> : <AiOutlineDelete/>}</Button>
                        <ConfirmDeleteModal onDelete={() => handleRemove(form.values.assertions, index, arrayHelpers)}
                                            onCancel={() => setModalOpen(false)} open={modalOpen}
                        />
                      </div>
                    </div>
                  </div>

                ))}
              </>
            ) : (
              <Button startIcon={<AiOutlinePlus/>} className='bg-viridian-green m-auto w-1/2' type='button'
                      onClick={() => arrayHelpers.push({
                        property: 'status', expected: '', comparison: 'is not equal to'
                      })}>
                <span>Add Assertion</span>
              </Button>
            )}
          </>

        )}
      />
    </>
  )
}