import { useQuery } from '@apollo/client'
import Loader from 'components/Loader'
import RequestForm from 'components/RequestForm'
import {GetRequest} from 'graphql/queries'
import {useToast} from 'hooks/ToastProvider'
import {useEffect} from 'react'
import { Card} from 'react-daisyui'
import {useNavigate, useParams } from 'react-router-dom'
import { Request } from 'types'


export default function EditRequest() {
  const {requestId} = useParams()
  const {addToast } = useToast()
  const navigate = useNavigate()
  const {data, loading, error} = useQuery<{request: Request}>(GetRequest, {
    variables: {
      where: {
        id: Number(requestId)
      }
    }
  })

  if (!requestId) return <></>

  useEffect(() => {
    if (error) {
      addToast(error.message, 'error')
      navigate('/')
    }
  })
  return (
    <Card className='p-4 bg-gray-100 w-full'>
      <Card.Title>
        <h3>
          Edit Request
        </h3>
      </Card.Title>
      <Card.Body>
        {(loading || !data) ? (<Loader size={48}/>) : (
          <RequestForm stepNumber={data.request.stepNumber} request={data.request}/>
        )}
      </Card.Body>
    </Card>

  )
}