import { ReactComponent as MonitorSVG } from "assets/undraw_surveillance_re_8tkl.svg";
import MonitorList from 'components/monitors/MonitorList'
import { Link, Outlet } from "react-router-dom";

export default function Monitors() {
  return (
    <div className='grid grid-rows-1 grid-cols-1 relative'>
      <section className="flex flex-col row-span-full row-start-1 col-span-full">
        <h2 className="text-2xl font-medium">Monitors</h2>
        <Link to='new' className='btn bg-sky-blue ml-auto z-40'>Add Monitor</Link>
        <div className='self-center'>
          <MonitorSVG className="w-full max-w-xl opacity-50" />
        </div>
      </section>
      <div className='row-span-full row-start-1 col-span-full z-10'>
        <MonitorList/>
        <Outlet/>
      </div>
    </div>
  );
}