import AddMonitor from 'components/monitors/AddMonitor'
import MonitorList from 'components/monitors/MonitorList'
import { Outlet, useLocation } from "react-router-dom";
import {ReactComponent as Logo} from 'assets/SVGs/Skopos_Branding_Final Logo_Favicon_without circle.svg'

export default function Monitors() {
  const { pathname} = useLocation()
  return (
    <div className='m-auto grid grid-rows-1 grid-cols-1 relative max-w-2xl'>
      <section className="flex flex-col relative row-span-full row-start-1 col-span-full my-4">
        <div className='flex'>
          <h2 className="text-2xl font-medium">Monitors</h2>
          <AddMonitor/>
        </div>
        <Logo className='-z-10 opacity-20 absolute left-0 -top-16 max-w-full w-full h-auto'/>
      </section>
      <div className='row-span-full row-start-1 col-span-full'>
        {pathname === '/monitors' && <MonitorList/>}
        <div>
          <Outlet/>
        </div>
      </div>
    </div>
  );
}