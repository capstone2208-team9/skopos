import { Table } from "react-daisyui";
import MonitorListItem from "components/MonitorListItem";
import Loader from "components/Loader";
import {GetMonitors} from 'graphql/queries'
import { useToast } from "hooks/ToastProvider";
import {useEffect} from 'react'
import { useQuery } from "@apollo/client";
import {Monitor} from 'types'

export default function MonitorList() {
  const { data, error, loading } = useQuery<{ monitors: Monitor[] }>(GetMonitors, {
    variables: {
      where: {
        monitorId: {
          not: null
        }
      }
    }
  });
  const { addToast } = useToast();

  useEffect(() => {
    if (error) addToast(error.message, "error");
  }, [error, addToast]);

  if (loading) return <Loader/>
  if (data && !data.monitors.length) return <></>

  return (
    <div className='grid place-items-center mt-32 min-w-[768px] overflow-x-auto'>
      <Table compact className='shadow-xl'>
        <Table.Head className='text-center'>
          <span>Schedule</span>
          <span>On Error Contact</span>
          <span>Collections</span>
          <span>Actions</span>
        </Table.Head>
        <Table.Body>
          {data?.monitors.map(monitor => (<MonitorListItem key={monitor.id} {...monitor}/>))}
        </Table.Body>
      </Table>
    </div>
  )
}