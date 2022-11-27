import {useLazyQuery} from '@apollo/client'
import axios from 'axios'
import CollectionRunResponse from 'components/collectionRuns/CollectionRunResponse'
import Loader from 'components/shared/Loader'
import ModalPortal from 'components/shared/ModalPortal'
import {GetLastCollectionRun} from 'graphql/queries'
import {useEffect, useState} from 'react'
import {Button, Modal, Tooltip} from 'react-daisyui'
import {BsCollectionPlayFill} from 'react-icons/bs'
import {useParams} from 'react-router-dom'
import {Response} from 'types'

const BACKEND_SERVER = process.env.REACT_APP_BACKEND_URL

export default function CollectionRunner() {
  const {collectionId} = useParams()
  const [modalOpen, setModalOpen] = useState(false)
  const [getLastCollectionRun, {loading, data, error}] = useLazyQuery(GetLastCollectionRun, {
    notifyOnNetworkStatusChange: true,
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
    }, fetchPolicy: 'network-only'
  })
  const [responses, setResponses] = useState<Response[]>([])

  const handleRunCollection = async () => {
    const url = `${BACKEND_SERVER}/${collectionId}`
    try {
      await axios.post(url)
      await getLastCollectionRun()
    } catch (err) {
      console.log(err)
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

  if (!data) return <Tooltip message='Run collection'>
    <Button startIcon={loading ? <Loader size='32'/> : <BsCollectionPlayFill size='32'/>}
                            onClick={handleRunCollection}
                            className='bg-transparent text-sky-blue hover:text-cadmium-orange hover:scale-105 hover:bg-transparent border-none'
                            size='md'/>
  </Tooltip>
  if (error) return <p>Error {error.message}</p>

  return (
    <div>
      <Tooltip message='Run collection'>
        <Button startIcon={loading ? <Loader size='32'/> : <BsCollectionPlayFill size='32'/>}
                onClick={handleRunCollection}
                className='bg-transparent text-sky-blue hover:scale-105 hover:bg-transparent hover:text-sky-300 border-none'
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
