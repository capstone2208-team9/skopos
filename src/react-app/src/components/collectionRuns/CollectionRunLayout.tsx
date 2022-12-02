import {PropsWithChildren} from 'react'
import {Button} from 'react-daisyui'
import {useNavigate} from 'react-router-dom'

export default function CollectionRunLayout({children}: PropsWithChildren) {
  const navigate = useNavigate()
  return (
    <div className='mx-auto flex mt-8 gap-4'>
      <Button size='sm' className='bg-cadmium-orange mb-8'
              onClick={() => navigate(-1)}
      >Back</Button>
      {children}
    </div>)
}