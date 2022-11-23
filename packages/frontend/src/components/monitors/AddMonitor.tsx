import { Link, useLocation } from 'react-router-dom'

interface Props {
  className?: string
}

export default function AddMonitor({className = 'z-10 btn bg-sky-blue ml-auto my-4 hover:bg-cadmium-orange'}: Props) {
  const {pathname} = useLocation()
  return (
  <Link to='/monitors/new' className={className + `${pathname.includes('new') ? ' bg-opacity-50 pointer-events-none z-auto' : ''}`}>Add Monitor</Link>
  )
}