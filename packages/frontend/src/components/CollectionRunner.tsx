import {useLazyQuery} from '@apollo/client'
import axios from 'axios'
import CollectionRunResponse from "components/CollectionRunResponse";
import ModalPortal from "components/ModalPortal";
import {GetLastCollectionRun} from 'graphql/queries'
import {useEffect, useState} from 'react'
import {Button, Modal} from 'react-daisyui'
import { useParams } from 'react-router-dom'
import { Response } from 'types'
import { BsCollectionPlay} from 'react-icons/bs'

const BACKEND_SERVER = process.env.REACT_APP_BACKEND_URL


export default function CollectionRunner() {
  const {collectionId} = useParams()
  const [getLastCollectionRun, {loading, data, error}] = useLazyQuery(GetLastCollectionRun, { variables: {
      where: {
        collectionId: {
          equals: Number(collectionId)
        }
      },
      orderBy: [
        {
          createdAt: "desc"
        }
      ],
      take: 1
    }, fetchPolicy: 'network-only'})
  const [responses, setResponses] = useState<Response[]>([])

  const handleRunCollection = async () => {
    const url = `${BACKEND_SERVER}/${collectionId}`
    try {
      await axios.post(url)
      await getLastCollectionRun()
    } catch(err) {
      console.log(err)
    }
  }

  useEffect(() => {
    if (data && data.collectionRuns.length) {
      const results = data.collectionRuns[0].responses
      setResponses(results)
    }
  }, [data])

  if (loading) return <p>Loading...</p>
  if (!data) return <Button startIcon={<BsCollectionPlay/>}
                            onClick={handleRunCollection}
                            className='bg-viridian-green'
                            size='sm'
  ><span className='ml-2'>Run</span></Button>
  if (error) return <p>Error {error.message}</p>

  return (
    <div>
      <Button className='bg-viridian-green' size='sm' startIcon={<BsCollectionPlay/>} disabled={loading} onClick={handleRunCollection}>Run</Button>
      <ModalPortal id='collection-runner-results'>
        <Modal open={responses.length > 0} onClickBackdrop={() => setResponses([])}>
          <Modal.Body>
            {responses.map(response => (
              <CollectionRunResponse response={response}/>
            ))}
          </Modal.Body>
        </Modal>

      </ModalPortal>
    </div>
  )
}
