import Loader from "components/Loader";
import {useAddMonitor} from 'hooks/useAddMonitor'
import { Table } from "react-daisyui";
import { ReactComponent as MonitorSVG } from "assets/undraw_surveillance_re_8tkl.svg";
import MonitorListItem from "components/MonitorListItem";
import { useToast } from "hooks/ToastProvider";
import {useEffect} from 'react'
import { Link } from "react-router-dom";

export default function Monitors() {
  const {monitors, loading, error, buttonComponent} = useAddMonitor()
  const { addToast } = useToast();

  useEffect(() => {
    if (error) addToast(error.message, "error");
  }, [error, addToast]);

  if (loading) return <Loader/>
  if (error) return <></>

  if (monitors.length === 0) {
    return (
      <div className="flex flex-col">
        <h2 className="text-2xl font-medium">Monitors</h2>
        <Link to='new' className='btn bg-sky-blue ml-auto'>Add Monitor</Link>
        <div className='self-center'>
          <MonitorSVG className="w-full max-w-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className='grid place-items-center min-w-[768px] overflow-x-auto'>
      {buttonComponent}
      <Table compact>
        <Table.Head className='text-center'>
          <span>Schedule</span>
          <span>On Error Contact</span>
          <span>Collections</span>
          <span>Actions</span>
        </Table.Head>
        <Table.Body>
          {monitors.map(monitor => (<MonitorListItem key={monitor.id} {...monitor}/>))}
        </Table.Body>
      </Table>
    </div>
  );
}