import { Link } from 'react-router-dom'

interface Props {
  className?: string
}

export default function AddMonitor({className = 'btn bg-sky-blue ml-auto'}: Props) {
  return (
  <Link to='monitors/new' className={className}>Add Monitor</Link>
  )
}