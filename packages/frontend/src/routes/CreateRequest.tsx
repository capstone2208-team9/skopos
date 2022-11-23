import RequestForm from 'components/requests/RequestForm'
import { Card} from 'react-daisyui'
import { useLocation } from 'react-router-dom'


export default function CreateRequest() {
  const { state } = useLocation()
  return (
    <Card className='create-request bg-sky-50 p-4 rounded shadow-xl'>
      <Card.Title>
        <h3>
          Add Request
        </h3>
      </Card.Title>
      <Card.Body>
        <RequestForm stepNumber={state.nextStep}/>
      </Card.Body>
    </Card>

  )
}