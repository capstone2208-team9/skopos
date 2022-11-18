import {useMutation, useQuery} from '@apollo/client'
import {ReactComponent as Empty} from 'assets/undraw_not_found_re_44w9.svg'
import CollectionRunner from 'components/CollectionRunner'
import ModalPortal from 'components/ModalPortal'
import RequestList from 'components/requests/RequestList'
import {UpdateStepNumber} from 'graphql/mutations'
import {GetCollection} from 'graphql/queries'
import {updateStepNumbers} from 'lib/updateStepNumbers'
import {useCallback, useEffect, useState} from 'react'
import {Button, Modal, Tooltip} from 'react-daisyui'
import {FaSpinner} from 'react-icons/fa'
import {MdHistory} from 'react-icons/md'
import {Link, useParams} from 'react-router-dom'
import {ICollection, Request} from 'types'
import RequestForm from '../components/RequestForm'

export default function Collection() {
  console.log('render Collection')
  const {collectionId} = useParams()
  const [selectedRequest, setSelectedRequest] = useState<Request | undefined>()
  const [modalOpen, setModalOpen] = useState(false)
  const [nextStep, setNextStep] = useState(1)
  const [requestList, setRequestList] = useState<Request[]>([])

  const {loading, error, data } = useQuery<{ collection: ICollection }>(GetCollection, {
    variables: {
      where: {
        id: Number(collectionId)
      },
      orderBy: [
        {
          stepNumber: 'asc'
        }
      ]
    },
  })

  const [updateStepNumber] = useMutation(UpdateStepNumber, {
    update(cache, {data: {updateOneRequest}}) {
      const query = cache.readQuery<{ collection: ICollection }>({
        query: GetCollection, variables: {
          where: {
            id: Number(collectionId)
          },
          orderBy: [
            {
              stepNumber: 'asc'
            }
          ]
        }
      })
      if (!query) return
      const requests = query.collection.requests.map(r => {
        return r.id === updateOneRequest.id ? updateOneRequest : r
      })
      cache.writeQuery({
        query: GetCollection,
        data: {collection: {...query.collection, requests: updateStepNumbers(requests)}}
      })
    },
  })

  const toggleOpen = useCallback(() => setModalOpen(prev => !prev), [])

  const handleAddRequest = useCallback(() => {
    setModalOpen(true)
  }, [])

  const handleDeleteRequest = useCallback(async (id: number) => {
    setSelectedRequest(undefined)
    if (!data) return
    const remainingRequests = data.collection.requests.filter(r => r.id !== id)
    setNextStep(remainingRequests.length)
    console.log('num requests', remainingRequests.length)
    if (remainingRequests.length > 0) {
      const reqs = updateStepNumbers(remainingRequests)
      const promises = reqs.map(r => {
        return updateStepNumber({
          ignoreResults: true,
          variables: {
            data: {
              stepNumber: {
                set: r.stepNumber
              }
            },
            where: {
              id: r.id
            }
          }
        })
      })
      await Promise.all(promises)
      console.log('fetched!!')
    }
  }, [data])

  const handleCancel = useCallback(() => {
    setModalOpen(false)
    setSelectedRequest(undefined)
  }, [])

  const handleClickBackdrop = useCallback(() => {
    setModalOpen(false)
  }, [])


  const handleMove = useCallback(async (fromStep: number, toStep: number) => {
    if (!data) return
    // const reqs = reorder(data.collection.requests, fromStep, toStep)
    const movedRequests = data.collection.requests
      .filter(r => [fromStep, toStep].includes(r.stepNumber))
    console.log(movedRequests)
    const promises = movedRequests?.map(r => {
      return updateStepNumber({
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        update(){},
        variables: {
          data: {
            stepNumber: {
              set: r.stepNumber === fromStep ? toStep : fromStep
            }
          },
          where: {
            id: r.id
          }
        },
      })
    })
    await Promise.all(promises)
  }, [data])

  useEffect(() => {
    if (data) {
      const requests = data?.collection.requests ? [...data.collection.requests] : []
      // TODO: not sure if this is the most efficient way to keep in sync with database updates
      setRequestList(() => {
        return requests.sort((a,b) => {
          return a.stepNumber < b.stepNumber ? -1 : 1
        })
      })
      setNextStep(data.collection.requests.length + 1)
    } else {
      setNextStep(1)
    }
  }, [data])

  if (loading) return (
    <div className='grid place-items-center'>
      <FaSpinner size={48} className='animate-spin text-2xl'/>
    </div>
  )
  if (error) return <p>Error {error.message}</p>
  if (!data || !data.collection) return <></>

  return (
    <div className='flex flex-col gap-4 items-center'>
      <section className='flex gap-8 items-center mb-8'>
        <h2 className='collection-title text-3xl font-medium'>{data.collection.title}</h2>
        <div className='flex items-center gap-4'>
          <Tooltip className='text-sky-blue hover:text-cadmium-orange hover:scale-105' message='See Past Runs'>
            <Link className='link text-inherit' to={`/collection-runs/${collectionId}`}>
              <MdHistory size='28' className='fill-current'/>
            </Link>
          </Tooltip>
          <Button className='bg-cadmium-orange' size='sm' onClick={handleAddRequest}>Add Request</Button>
          {data.collection.requests.length > 0 && (
            <CollectionRunner/>
          )}
        </div>
      </section>
      {data.collection.requests.length > 0 ? (
        <RequestList onMove={handleMove} requests={requestList} onModalOpen={() => setModalOpen(true)}
                     onDelete={handleDeleteRequest} onSelect={setSelectedRequest}
        />
      ) : (
        <Empty className='max-w-md mt-auto'/>
      )}
      <ModalPortal id='request-form-modal'>
        <Modal open={modalOpen} className='max-w-4xl' onClickBackdrop={handleClickBackdrop}>
          <Modal.Header>
            <h3>
              {selectedRequest ? 'Edit' : 'Add'} Request
            </h3>
          </Modal.Header>
          <Modal.Body>
            <RequestForm onCancel={handleCancel} request={selectedRequest}
                         stepNumber={nextStep}
                         onComplete={toggleOpen}/>
          </Modal.Body>
        </Modal>
      </ModalPortal>
    </div>
  )
}

