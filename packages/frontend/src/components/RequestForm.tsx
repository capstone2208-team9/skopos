import {useMutation} from '@apollo/client'
import {GetCollection} from 'graphql/queries'
import {CreateOneRequest, RemoveRequestFromCollection} from 'graphql/mutations'
import {updateStepNumbers} from 'lib/updateStepNumbers'
import React, {useEffect, useMemo, useState} from 'react'
import {Button, Form, Tabs} from 'react-daisyui'
import {useParams} from 'react-router-dom'
import {Assertion, ICollection, Request} from 'types'
import {highlight, languages} from 'prismjs'
import Editor from 'react-simple-code-editor'


import AssertionList from './AssertionList'
import HeaderList from './HeaderList'

interface Props {
  request?: Request
  stepNumber: number
  onCancel: () => void
  onComplete: () => void
}

const initialState = {
  title: '',
  method: 'GET',
  url: '',
  headers: {},
  body: '',
  assertions: [],
}

export default function RequestForm({onCancel, onComplete, request, stepNumber}: Props) {
  const {collectionId} = useParams()
  const [formData, setFormData] = useState<Omit<Request, 'stepNumber'>>({
    ...initialState, ...request
  })
  const [tabValue, setTabValue] = useState(0)

  const [createRequest, {data, error}] = useMutation(CreateOneRequest, {
    update(cache, {data: {createOneRequest}}) {
      if (!createOneRequest) return
      const variables = {
        where: {
          id: Number(collectionId),
        },
        orderBy: [
          {
            stepNumber: 'asc'
          }
        ],
      }
      const {collection} = cache.readQuery(
        {
          query: GetCollection, variables
        }
      ) as { collection: ICollection }
      const requests = updateStepNumbers([...collection.requests, createOneRequest])
      cache.writeQuery({
        query: GetCollection,
        variables,
        data: {collection: {...collection, requests}}
      })
    },
  })

  const [updateRequest, {data: updateData, error: updateError}] = useMutation(RemoveRequestFromCollection, {
    update(cache, {data: {updateOneRequest}}) {
      if (!updateOneRequest) return
      const variables = {
        where: {
          id: Number(collectionId),
        },
        orderBy: [
          {
            stepNumber: 'asc'
          }
        ],
      }
      const {collection} = cache.readQuery(
        {
          query: GetCollection, variables
        }
      ) as { collection: ICollection }
      const requests = collection.requests.filter(r => r.id !== updateOneRequest.id)
      cache.writeQuery({
        query: GetCollection,
        variables,
        data: {collection: {...collection, requests}}
      })
    },
  })

  const handleSingleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> = (e) => {
    const {name, value} = e.target
    setFormData({...formData, [name]: name === 'stepNumber' ? Number(value) : value})
  }

  const { title, url, assertions } = formData
  const { length } = assertions

  const isValid = useMemo(() => {
    return title && url && length
  }, [title, url, length]);

  const reset = () => {
    setFormData(initialState)
  }

  const handleSaveRequest = async () => {
    const {__typename, id, ...data} = formData
    try {
      await createRequest({
        variables: {
          data: {
            ...data,
            stepNumber: request?.stepNumber || stepNumber,
            assertions: {
              createMany: {
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
      onComplete()
    } catch (err) {
      console.log(err)
    }
  }

  const handleEditRequest = async () => {
    if (!request) return
    const variables = {
      data: {
        collection: {
          disconnect: true
        }
      },
      where: {
        id: request.id
      }
    }
    await updateRequest({variables})
    await handleSaveRequest()
    onComplete()
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    request ? handleSaveRequest() : handleEditRequest()
  }

  const handleHeaderChange = (headers: Record<string, string>) => {
    setFormData({...formData, headers})
  }

  const handleAssertionChange = (assertions: Assertion[]) => {
    setFormData({...formData, assertions})
  }

  const handleCancel = () => {
    onCancel()
    reset()
  }

  const handleChangeBody = (body: string) => {
    setFormData({...formData, body})
  }

  useEffect(() => {
    if (updateData || data) {
      reset()
      onCancel()
    }
  }, [data, updateData, onCancel])

  useEffect(() => {
    if (request) {
      setFormData(prev => ({...prev, ...request}))
    }
  }, [request])

  error && console.error(error)
  updateError && console.error(error)

  return (
    <Form className='flex flex-col gap-4' onSubmit={handleSubmit}>
      {error && <p>{error.message}</p>}
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
        <Tabs.Tab value={1} className='tab tab-bordered'>Body</Tabs.Tab>
        <Tabs.Tab value={2} className='tab tab-bordered'>Assertions</Tabs.Tab>
      </Tabs>
      {tabValue === 0 &&
        <HeaderList headers={formData.headers ? formData.headers : []} setHeaders={handleHeaderChange}/>}

      {tabValue === 1 &&
        <Editor
          highlight={code => highlight(code, languages.js, 'js')}
          value={formData.body || ''}
          onValueChange={handleChangeBody}
          padding={10}
          style={{
            border: '1px solid #ccc',
            fontSize: '1rem',
          }}
        />}
      {tabValue === 2 && <AssertionList assertions={formData.assertions ? formData.assertions : []}
                                        setAssertions={handleAssertionChange}/>}
      {!request && <div className='flex gap-4 ml-auto'>
        <Button className='bg-sky-blue' type='button' onClick={handleSaveRequest}
                disabled={!isValid}
        >Save</Button>
        <Button className='bg-cadmium-orange' type='button' onClick={reset}>Reset</Button>
      </div>}
      {request && <div className='flex gap-4 ml-auto'>
        <Button className='bg-sky-blue' type='button' onClick={handleEditRequest}
                disabled={!isValid}
        >Update</Button>
        <Button className='bg-cadmium-orange' type='button' onClick={handleCancel}>Cancel</Button>
      </div>}
    </Form>
  )
}

