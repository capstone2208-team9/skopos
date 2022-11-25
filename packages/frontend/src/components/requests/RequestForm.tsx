import {useMutation} from '@apollo/client'
import AssertionFieldArray from 'components/assertions/AssertionFieldArray'
import HeaderFieldArray from 'components/requests/HeaderFieldArray'
import JsonEditField from 'components/requests/JsonEditField'
import Loader from 'components/shared/Loader'
import TextInput from 'components/shared/TextInput'
import {Field, Form, Formik} from 'formik'
import {CreateOneRequest, UpdateRequest} from 'graphql/mutations'
import {GetCollectionNames, GetRequests} from 'graphql/queries'
import {useToast} from 'hooks/ToastProvider'
import {requestToRequestInput} from 'lib/assertionHelpers'
import React, {useEffect, useState} from 'react'
import {Button, InputGroup, Tabs} from 'react-daisyui'
import {useNavigate, useParams} from 'react-router-dom'
import {getRequestVariables} from 'routes/RequestList'
import {AssertionInput, ComparisonType, Request} from 'types'
import * as Yup from 'yup'

interface Props {
  request?: Request
  stepNumber: number
}

const initialState = {
  title: '',
  method: 'GET',
  url: '',
  headers: [] as [string, string | number][],
  body: '',
  assertions: [] as AssertionInput[],
}


const assertionSchema: Yup.SchemaOf<AssertionInput> = Yup.object({
  id: Yup.number().optional(),
  property: Yup.string().oneOf(['headers', 'body', 'status', 'latency']).required(
    'property is required'
  ),
  path: Yup.string()
    .when('property', {
      is: 'headers',
      then(schema) {
        return schema.required('please provide path for headers')
      }
    })
    .when('property', {
      is: 'body',
      then: (schema) => schema.required('please provide path for body'),
    }),
  comparison: Yup.mixed<ComparisonType>().required('comparison is required'),
  expected: Yup.mixed()
    .when('comparison', {
      is: 'is null',
      then: Yup.mixed().nullable(),
    })
    .when('comparison', {
      is: 'is not null',
      then: Yup.mixed().nullable(),
    })
    .required('expected is required')
})

const validationSchema = Yup.object({
  title: Yup.string().required(),
  url: Yup.string().url().required(),
  method: Yup.mixed().oneOf(['GET', 'POST', 'PUT', 'DELETE']),
  headers: Yup.array().of(Yup.array().length(2)).notRequired(),
  body: Yup.string().test({
    name: 'is-json',
    test(value, ctx) {
      if (!value) return true
      try {
        return Boolean(JSON.parse(value))
      } catch {
        return ctx.createError({message: 'body must be a valid json object'})
      }
    },
  }),
  assertions: Yup.array().min(1).of(assertionSchema)
})

export default function RequestForm({request, stepNumber}: Props) {
  const {collectionId} = useParams()
  const {addToast} = useToast()
  const navigate = useNavigate()
  const [tabValue, setTabValue] = useState(0)

  const [createRequest, {data, error, loading}] = useMutation(CreateOneRequest, {
    update(cache, {data: {createOneRequest}}) {
      if (!createOneRequest) return
      const variables = getRequestVariables(collectionId)
      cache.updateQuery({query: GetCollectionNames}, (data) => {
        const id = Number(collectionId)
        return {
          collections: data.collections.map(c => {
            return c.id === id ? {...c, _count: c._count.requests} : c
          })
        }
      })
      cache.updateQuery({query: GetRequests, variables}, (data) => ({
        requests: [...data.requests, createOneRequest]
      }))
    },
  })

  const [updateRequest, {data: updateData, error: updateError}] = useMutation(UpdateRequest, {
    update(cache, {data: {updateOneRequest}}) {
      if (!updateOneRequest) return
      const variables = getRequestVariables(collectionId)

      let updateRequest = updateOneRequest
      if (updateRequest.headers) {
        updateRequest = {...updateRequest, headers: Object.fromEntries(updateRequest.headers)}
      }
      cache.updateQuery({query: GetRequests, variables}, (data) => ({
        requests: data.requests.map((r) => {
          return r.id === updateOneRequest.id ? updateRequest : r
        })
      }))
    },
  })

  const handleSaveRequest = async (values: typeof initialState) => {
    try {
      return await createRequest({
        variables: {
          data: {
            ...values,
            stepNumber: request?.stepNumber || stepNumber,
            assertions: {
              createMany: {
                data: values.assertions.map(({property, path, ...rest}) => ({
                  property: path || property,
                  ...rest
                })),
              }
            },
            collection: {
              connect: {
                id: Number(collectionId)
              }
            }
          }
        }
      })
    } catch (err) {
      console.log(err)
    }
  }

  const handleEditRequest = async (values: typeof initialState) => {
    if (!request) return
    const variables = {
      data: {
        title: {
          set: values.title
        },
        url: {
          set: values.url,
        },
        method: {
          set: values.method,
        },
        headers: values.headers.length ? Object.fromEntries(values.headers) : null,
        body: values.body,
        assertions: {
          upsert: values.assertions.map(a => (
            {
              create: {
                expected: a.expected,
                property: a.path || a.property,
                comparison: a.comparison
              },
              update: {
                comparison: {
                  set: a.comparison
                },
                expected: {
                  set: a.expected
                },
                property: {
                  set: a.path || a.property
                }
              },
              where: {id: a.id || -1}
            }
          ))
        }
      },
      where: {
        id: request.id
      }
    }
    return await updateRequest({variables})
  }

  const handleSubmit = async (values: typeof initialState) => {
    return request ? handleEditRequest(values) : handleSaveRequest(values)
  }

  const handleCancel = (resetForm) => {
    resetForm()
    navigate(-1)
  }

  useEffect(() => {
    if (updateData || data) {
      // reset()
      addToast(updateData ? 'Request updated' : 'Request saved', 'success')
      navigate(-1)
    }
  }, [data, updateData])


  useEffect(() => {
    if (error) addToast(error.message, 'error')
    if (updateError) addToast(updateError.message, 'error')
  }, [error, updateError])

  return (
    <Formik
      initialValues={request ? {...initialState, ...requestToRequestInput(request)} : initialState}
      validationSchema={validationSchema}
      onSubmit={async (values, {resetForm}) => {
        const result = await handleSubmit(values)
        if (result && !result?.errors){
          resetForm()
          navigate(`/collections/${collectionId}/requests`)
        }
      }}
    >
      {({isValid, dirty, resetForm}) => (
        <Form className='flex flex-col gap-6'>
          <TextInput name='title' placeholder='add a title'/>

          <InputGroup>
            <Field name='method' as='select' className='select select-bordered'>
              {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </Field>
            <TextInput wrapperClassName='-mt-4 w-full' name='url' placeholder='https://example.com'/>
          </InputGroup>
          <Tabs value={tabValue} onChange={setTabValue}>
            <Tabs.Tab value={0} className='flex-1 text-lg text-dark-green'>Headers</Tabs.Tab>
            <Tabs.Tab value={1} className='flex-1 text-lg text-dark-green'>Body</Tabs.Tab>
            <Tabs.Tab value={2} className='flex-1 text-lg text-dark-green'>Assertions</Tabs.Tab>
          </Tabs>
          {tabValue === 0 && <Field name='headers' component={HeaderFieldArray}/>}

          {tabValue === 1 &&
            (<Field name='body'>
              {(props) => (
                <JsonEditField
                  {...props}
                />
              )}
            </Field>)
          }
          {tabValue === 2 && (
            <Field name='assertions'>
              {(props) => (
                <AssertionFieldArray {...props}/>
              )}
            </Field>
          )
          }
          {!request && <div className='flex gap-4 ml-auto'>
            <Button className='bg-sky-blue' type='submit'
                    disabled={!isValid || !dirty}
            >{loading ? <Loader size='20'/> : 'Save'}</Button>
            <Button className='bg-cadmium-orange' type='button' onClick={() => resetForm()}>Reset</Button>
            <Button className='bg-secondary' type='button' onClick={() => handleCancel(resetForm)}>Cancel</Button>
          </div>}
          {request && <div className='flex gap-4 ml-auto'>
            <Button className='bg-sky-blue' type='submit'
                    disabled={!isValid}
            >{loading ? <Loader size='20'/> : 'Update'}</Button>
            <Button className='bg-cadmium-orange' type='button' onClick={() => handleCancel(resetForm)}>Cancel</Button>
          </div>}
        </Form>
      )}
    </Formik>
  )
}




