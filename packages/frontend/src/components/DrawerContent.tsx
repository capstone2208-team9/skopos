import {v4 as uuid} from 'uuid'
import {Menu} from 'react-daisyui'
import {BsCollection} from 'react-icons/bs'
import { FaWatchmanMonitoring } from 'react-icons/fa'
import {NavLink} from 'react-router-dom'

interface Props {
  onToggleDrawer: () => void
}

type NavLinkProps = string | ((props: { isActive: boolean; isPending: boolean; }) => string | undefined) | undefined

export default function DrawerContent({onToggleDrawer}: Props) {
  const navClassName: NavLinkProps = ({isActive}) => {
    const baseClassName = `flex gap-2 items-center text-dark-green mb-2 text-xl`
    return isActive ? baseClassName + ` font-medium text-sky-blue` : baseClassName;
  }
  return (
    <div className='flex flex-col items-center gap-8 w-48 bg-sky-100 bg-opacity-95 p-4'>
      <h1 className='text-3xl font-medium mb-8'>Skopos</h1>
      <Menu className='gap-4'>
        <NavLink className={navClassName}
                 key={uuid()}
                 to={`collections`}
                 onClick={onToggleDrawer}
        >
          <BsCollection/>Collections
        </NavLink>
        <NavLink className={navClassName}
                 key={uuid()}
                 to={`monitors`}
                 onClick={onToggleDrawer}
        >
          <FaWatchmanMonitoring/>Monitors
        </NavLink>
      </Menu>
    </div>
  )
}