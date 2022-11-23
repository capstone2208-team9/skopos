import {useMutation} from '@apollo/client'
import Loader from 'components/shared/Loader'
import {getRequestVariables} from 'routes/RequestList'
import {GetCollectionNames, GetRequests} from 'graphql/queries'
import {CreateOneRequest, UpdateRequest } from 'graphql/mutations'
import {useToast} from 'hooks/ToastProvider'
import React, {useEffect, useMemo, useState} from 'react'
import {Button, Form, Tabs} from 'react-daisyui'
import {useNavigate, useParams} from 'react-router-dom'
import {Assertion, Request} from 'types'
import {highlight, languages} from 'prismjs'
import Editor from 'react-simple-code-editor'
import AssertionList from 'components/assertions/AssertionList'
import HeaderList from 'components/requests/HeaderList'

interface Props {
  request?: Request
  stepNumber: number
}

const initialState = {
  title: '',
  method: 'GET',
  url: '',
  headers: {} as Record<string, string|number>,
  body: '',
  assertions: [],
}

export default function RequestForm({request, stepNumber}: Props) {
  const {collectionId} = useParams()
  const {addToast} = useToast()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<Omit<Request, 'stepNumber'>>({
    ...initialState,
  })
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
      cache.updateQuery({ query: GetRequests, variables }, (data) => ({
        requests: data.requests.map((request) => {
          return request.id === updateOneRequest.id ? updateOneRequest : request
        })
      }));
    },
  })

  const handleSingleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> = (e) => {
    const {name, value} = e.target
    setFormData({...formData, [name]: name === 'stepNumber' ? Number(value) : value})
  }

  const { title, url, assertions } = formData
  const { length } = assertions

  const isValid = useMemo(() => {
    return Boolean(title && url && length)
  }, [title, url, length]);

  const reset = () => {
    setFormData(initialState)
  }

  const handleSaveRequest = async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {__typename, id, ...data} = formData
    try {
      await createRequest({
        variables: {
          data: {
            ...data,
            stepNumber: request?.stepNumber || stepNumber,
            assertions: {
              createMany: {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                data: request ? (data.assertions.map(({__typename, id, ...rest}) => rest)) : (formData.assertions)
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

  const handleEditRequest = async () => {
    if (!request) return
    const variables = {
      data: {
        title: {
          set: formData.title
        },
        url: {
          set: formData.url,
        },
        headers: formData.headers,
        body: formData.body,
        assertions: {
          upsert: formData.assertions.map(a => (
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    request ? handleSaveRequest() : handleEditRequest()
  }

  const handleHeaderChange = (headers: Record<string, string|number>) => {
    setFormData({...formData, headers})
  }

  const handleAssertionChange = (assertions: Assertion[]) => {
    setFormData({...formData, assertions})
  }

  const handleCancel = () => {
    reset()
    navigate(-1)
  }

  const handleChangeBody = (body: string) => {
    setFormData({...formData, body})
  }


  useEffect(() => {
    if (updateData || data) {
      reset()
      navigate(-1)
    }
  }, [data, updateData])

  useEffect(() => {
    if (request) {
      setFormData(prev => ({...prev, ...request}))
    }
  }, [request])

  useEffect(() => {
    if (error) addToast(error.message, 'error')
    if (updateError) addToast(updateError.message, 'error')
  }, [error, updateError])

  if (isValid) {
    console.log(isValid)
  }

  return (
    <Form className='flex flex-col gap-4' onSubmit={handleSubmit}>
      {updateError && <p>{updateError.message}</p>}
      <div className='flex gap-4 justify-between'>
        <div className='form-control flex-grow'>
          <label htmlFor='title' className='label'>
            <input className='input input-bordered w-full' id='title' value={formData.title || ''}
                   onChange={handleSingleChange} name='title'
                   placeholder='request name'
            />
          </label>
        </div>
      </div>

      <div className='form-control'>
        <label htmlFor='method' className='input-group'>
          <select id='method' name='method' className='select select-bordered'
                  value={formData.method || ''}
                  onChange={handleSingleChange}
          >
            <option value='GET'>GET</option>
            <option value='POST'>POST</option>
            <option value='PUT'>PUT</option>
            <option value='PATCH'>PATCH</option>
            <option value='DELETE'>DELETE</option>
          </select>
          <input className='input input-bordered w-full' placeholder='endpoint url' id='url' name='url'
                 value={formData.url} onChange={handleSingleChange}/>
        </label>
      </div>
      <Tabs value={tabValue} onChange={setTabValue}>
        <Tabs.Tab value={0} className='tab tab-bordered text-dark-green'>Headers</Tabs.Tab>
        <Tabs.Tab value={1} className='tab tab-bordered text-dark-green'>Body</Tabs.Tab>
        <Tabs.Tab value={2} className='tab tab-bordered text-dark-green'>Assertions</Tabs.Tab>
      </Tabs>
      {tabValue === 0 &&
        <HeaderList headers={formData.headers ? formData.headers : {} as Record<string, string|number>} setHeaders={handleHeaderChange}/>}

      {tabValue === 1 &&
        <Form.Label className='w-full' htmlFor='request-body'>
          <Editor
            id='request-body'
            highlight={code => highlight(code, languages.js, 'js')}
            value={formData.body || ''}
            onValueChange={handleChangeBody}
            placeholder='{}'
            padding={10}
            className='bg-base-100 border-2 border-base-200 w-full'
          />
        </Form.Label>
      }
      {tabValue === 2 && <AssertionList assertions={formData.assertions ? formData.assertions : []}
                                        setAssertions={handleAssertionChange}/>}
      {!request && <div className='flex gap-4 ml-auto'>
        <button className='bg-sky-blue' type='submit' onClick={handleSaveRequest}
                disabled={!isValid}
        >{loading ? <Loader size='20'/> : 'Save'}</button>
        <Button className='bg-cadmium-orange' type='button' onClick={reset}>Reset</Button>
        <Button className='bg-secondary' type='button' onClick={handleCancel}>Cancel</Button>
      </div>}
      {request && <div className='flex gap-4 ml-auto'>
        <Button className='bg-sky-blue' type='submit' onClick={handleEditRequest}
                disabled={!isValid}
        >{loading ? <Loader size='20'/> : 'Update'}</Button>
        <Button className='bg-cadmium-orange' type='button' onClick={handleCancel}>Cancel</Button>
      </div>}
    </Form>
  )
}

