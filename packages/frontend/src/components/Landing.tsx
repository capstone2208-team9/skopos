import {ReactComponent as SkoposLargeLogo} from 'assets/SVGs/Skopos_Branding_Final Logo_SKOPOS_logo_color.svg'
import AddCollection from 'components/collections/AddCollection'
import AddMonitor from 'components/monitors/AddMonitor'
import { ButtonGroup } from 'react-daisyui'

export default function Landing() {

  return (
    <div className='grid place-items-center'>
      <ButtonGroup className='gap-4'>
        <AddMonitor className='ml-auto mb-4 btn bg-sky-blue'/>
        <AddCollection/>
      </ButtonGroup>
      <SkoposLargeLogo className='max-w-md'/>
      <h2 className='text-3xl font-medium my-4'>Monitor critical API workflows</h2>
    </div>
  )
}