import AddMonitor from 'components/monitors/AddMonitor'
import MonitorList from 'components/monitors/MonitorList'
import { Outlet, useLocation } from "react-router-dom";
import {ReactComponent as MonitorSVG} from "assets/undraw_surveillance_re_8tkl.svg"

export default function Monitors() {
  const { pathname} = useLocation()
  return (
    <div className='m-auto grid grid-rows-1 grid-cols-1 relative max-w-2xl'>
      <section className="flex flex-col row-span-full row-start-1 col-span-full my-4">
        <div className='flex'>
          <h2 className="text-2xl font-medium">Monitors</h2>
          <AddMonitor/>
        </div>
        <div className='absolute -top-12 left-1/2 -translate-x-1/2'>
          <MonitorSVG className="opacity-50" />
        </div>
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