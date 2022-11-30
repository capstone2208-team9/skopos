import {useLazyQuery} from '@apollo/client'
import axios from 'axios'
import CollectionRunResponse from 'components/collectionRuns/CollectionRunResponse'
import Loader from 'components/shared/Loader'
import ModalPortal from 'components/shared/ModalPortal'
import {GetLastCollectionRun} from 'graphql/queries'
import {useToast} from 'hooks/ToastProvider'
import {useEffect, useState} from 'react'
import {Button, Modal, Tooltip} from 'react-daisyui'
import {BsCollectionPlayFill} from 'react-icons/bs'
import {useParams} from 'react-router-dom'
import {Response} from 'types'

const BACKEND_SERVER = process.env.REACT_APP_BACKEND_URL

export default function CollectionRunner() {
  const {collectionId} = useParams()
  const {addToast} = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [callingCollectionRunner, setCallingCollectionRunner] = useState(false)
  const [getLastCollectionRun, {loading, data, error}] = useLazyQuery(GetLastCollectionRun)
  const [responses, setResponses] = useState<Response[]>([])

  const handleRunCollection = async () => {
    const url = `${BACKEND_SERVER}/${collectionId}`
    setCallingCollectionRunner(true)
    try {
      await axios.post(url)
      await getLastCollectionRun({
        fetchPolicy: 'no-cache',
        variables: {
          where: {
            collectionId: {
              equals: Number(collectionId)
            }
          },
          orderBy: [
            {
              createdAt: 'desc'
            }
          ],
          take: 1
        }
      })
    } catch (err) {
      console.log(err)
    } finally {
      setCallingCollectionRunner(false)
    }
  }

  useEffect(() => {
    if (data && data.collectionRuns.length) {
      const results = data.collectionRuns[0].responses
      setResponses(results)
    }
  }, [data])

  useEffect(() => {
    setModalOpen(Boolean(responses.length))
  }, [responses])

  useEffect(() => {
    if (error) addToast(error.message, 'error')
  }, [addToast, error])

  if (!data) return (
    <Tooltip message='Run collection'>
      <Button startIcon={loading || callingCollectionRunner ? <Loader size='32'/> : <BsCollectionPlayFill size='32'/>}
              onClick={handleRunCollection}
              className='bg-transparent text-sky-blue hover:text-cadmium-orange hover:scale-105 hover:bg-transparent border-none'
              size='md'/>
    </Tooltip>
  )
  return (
    <div>
      <Tooltip message='Run collection'>
        <Button startIcon={loading || callingCollectionRunner ? <Loader size='32'/> : <BsCollectionPlayFill size='32'/>}
                onClick={handleRunCollection}
                className='bg-transparent text-sky-600 hover:scale-105 hover:bg-transparent hover:text-sky-300 border-none'
                size='md'/>
      </Tooltip>
      <ModalPortal id='collection-runner-results'>
        <Modal className='max-w-full' open={modalOpen} onClickBackdrop={() => setResponses([])}>
          <Modal.Body>
            {data.collectionRuns && data.collectionRuns[0].collection.requests.length !== responses.length && (
              <p className='text-cedar-chest'>Some responses were not recorded due to errors</p>
            )}
            {responses.map(response => (
              <CollectionRunResponse onSelect={() => setModalOpen(false)} key={response.id} response={response}/>
            ))}
          </Modal.Body>
        </Modal>

      </ModalPortal>
    </div>
  )
}
