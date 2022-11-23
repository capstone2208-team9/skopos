import {useMutation} from '@apollo/client'
import AssertionFieldArray from 'components/assertions/AssertionFieldArray'
import HeaderFieldArray from 'components/requests/HeaderFieldArray'
import JsonEditField from 'components/requests/JsonEditField'
import Loader from 'components/shared/Loader'
import {getRequestVariables} from 'routes/RequestList'
import {GetCollectionNames, GetRequests} from 'graphql/queries'
import {CreateOneRequest, UpdateRequest } from 'graphql/mutations'
import {useToast} from 'hooks/ToastProvider'
import React, {useEffect, useState} from 'react'
import {Button, Tabs} from 'react-daisyui'
import {useNavigate, useParams} from 'react-router-dom'
import {AssertionInput, ComparisonType, Request} from 'types'
import {Formik, Form, Field } from 'formik'
import * as Yup from 'yup'

interface Props {
  request?: Request
  stepNumber: number
}

const initialState = {
  title: '',
  method: 'GET',
  url: '',
  headers: [] as [string, string|number][],
  body: '',
  assertions: [] as AssertionInput[],
}


const assertionSchema: Yup.SchemaOf<AssertionInput> = Yup.object({
  id: Yup.number().optional(),
  property: Yup.string().required('property is required'),
  comparison: Yup.mixed<ComparisonType>().required('comparison is required'),
  expected: Yup.mixed()
    .when('comparison', {
      is: (val) => ['is null', 'is not null'].includes(val),
      then: Yup.mixed().nullable(),
      otherwise: Yup.mixed().defined().required('please provide an expected value'),
    })
})

const validationSchema = Yup.object({
  title: Yup.string().required(),
  url: Yup.string().url().required(),
  method: Yup.mixed().oneOf(['GET', 'POST', 'PUT', 'DELETE']),
  headers: Yup.array().of(Yup.array().length(2)).notRequired(),
  body: Yup.string().notRequired(),
  assertions: Yup.array().of(assertionSchema).required()
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
        return {collections: data.collections.map(c => {
          return c.id === id ? {...c, _count : c._count.requests} : c
          })}
      })
      cache.updateQuery({ query: GetRequests, variables }, (data) => ({
        requests: [...data.requests, createOneRequest]
      }));
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
      cache.updateQuery({ query: GetRequests, variables }, (data) => ({
        requests: data.requests.map((r) => {
          return r.id === updateOneRequest.id ? updateRequest : r
        })
      }));
    },
  })


  const handleSaveRequest = async (values: typeof initialState) => {
    try {
      await createRequest({
        variables: {
          data: {
            ...values,
            stepNumber: request?.stepNumber || stepNumber,
            assertions: {
              createMany: {
                data: values.assertions,
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
      navigate(`/collections/${collectionId}/requests`)
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
        headers: values.headers.length ? Object.fromEntries(values.headers) : null,
        body: values.body,
        assertions: {
          upsert: values.assertions.map(a => (
            {
              create: {
                expected: a.expected,
                property: a.property,
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
                  set: a.property
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
    await updateRequest({variables})

  }

  const handleSubmit = (values: typeof initialState) => {
    request ? handleEditRequest(values) : handleSaveRequest(values)
  }

  const handleCancel = (resetForm) => {
    resetForm()
    navigate(-1)
  }


  useEffect(() => {
    if (updateData || data) {
      // reset()
      navigate(-1)
    }
  }, [data, updateData])

  useEffect(() => {
    if (request) {
      // setFormData(prev => ({...prev, ...request}))
    }
  }, [request])

  useEffect(() => {
    if (error) addToast(error.message, 'error')
    if (updateError) addToast(updateError.message, 'error')
  }, [error, updateError])

  return (
    <Formik
      initialValues={request ? {...initialState, ...request} :  initialState}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        handleSubmit(values)
      }}
    >
      {({isValid, dirty, resetForm}) => (

        <Form className='flex flex-col gap-4'>
          {updateError && <p>{updateError.message}</p>}
          <div className='flex gap-4 justify-between'>
            <div className='form-control flex-grow'>
              <label htmlFor='title' className='label'>
                <Field className='input input-bordered w-full' id='title'
                       name='title'
                       placeholder='request name'
                />
              </label>
            </div>
          </div>

          <div className='form-control'>
            <label htmlFor='method' className='input-group'>
              <Field as='select' name='method' className='select select-bordered'
              >
                <option value='GET'>GET</option>
                <option value='POST'>POST</option>
                <option value='PUT'>PUT</option>
                <option value='PATCH'>PATCH</option>
                <option value='DELETE'>DELETE</option>
              </Field>
              <Field className='input input-bordered w-full' placeholder='endpoint url' id='url' name='url'/>
            </label>
          </div>
          <Tabs value={tabValue} onChange={setTabValue}>
            <Tabs.Tab value={0} className='tab tab-bordered text-dark-green'>Headers</Tabs.Tab>
            <Tabs.Tab value={1} className='tab tab-bordered text-dark-green'>Body</Tabs.Tab>
            <Tabs.Tab value={2} className='tab tab-bordered text-dark-green'>Assertions</Tabs.Tab>
          </Tabs>
          {tabValue === 0 && <Field name='headers' component={HeaderFieldArray}/>}

          {tabValue === 1 && <Field name='body' component={JsonEditField}/>}
          {tabValue === 2 && <Field name='assertions' component={AssertionFieldArray}/>}
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




