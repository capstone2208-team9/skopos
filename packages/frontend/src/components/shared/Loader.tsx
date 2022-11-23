import { FaSpinner } from "react-icons/fa";

interface Props {
  color?: string
  size?: string | number
}

export default function Loader({color = 'cadmium-orange', size = 48}: Props) {
  const spinnerColor = `text-${color}`
  return (
    <div className='grid place-items-center'>
      <FaSpinner role='' size={size} className={`animate-spin ${spinnerColor}`}/>
    </div>
  )
}