import {ReactComponent as SkoposLargeLogo} from 'assets/SVGs/Skopos_Branding_Final Logo_SKOPOS_logo_color.svg'
import AddCollection from 'components/collections/AddCollection'
import {useAddMonitor} from 'hooks/useAddMonitor'
import { ButtonGroup } from 'react-daisyui'

export default function Landing() {
  const {buttonComponent} = useAddMonitor()

  return (
    <div className='grid place-items-center'>
      <ButtonGroup className='gap-4'>
        <AddCollection/>
        {buttonComponent}
      </ButtonGroup>
      <SkoposLargeLogo className='max-w-md'/>
      <h2 className='text-3xl font-medium my-4'>Monitor critical API workflows</h2>
    </div>
  )
}