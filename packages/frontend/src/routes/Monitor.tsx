import {useQuery } from "@apollo/client";
import Loader from "components/Loader";
import {GetMonitor} from 'graphql/queries'
import { useToast } from "hooks/ToastProvider";
import {useEffect } from 'react'
import { Button} from "react-daisyui";
import {Link, Outlet, useNavigate, useParams } from "react-router-dom";

export default function Monitor() {
  const {id} = useParams()
  const navigate = useNavigate()
  const {addToast} = useToast()
  const { data, loading, error} = useQuery(GetMonitor, {
    notifyOnNetworkStatusChange: true,
    variables: {
      where: {
        id: Number(id),
      },
      orderBy: [
        {
          createdAt: "asc"
        }
      ],
    }
  })

  useEffect(() => {
    if (error) addToast(error.message, 'error')
  }, [data])

  useEffect(() => {
    if (data) {
      navigate(`${data.monitor.collections[0].id}`)
    }
  }, [data])


  if (loading) return <Loader/>
  if (!data) return <></>

  return (
    <div className='py-4 z-30 absolute top-32 w-full min-w-[768px] gap-8 grid grid-cols-12 justify-center bg-sky-50 shadow-xl' >
      <div className='flex flex-col col-span-3 gap-4 items-start'>
        <Button size='sm' className='bg-sky-blue' onClick={() => {
          navigate('/monitors')
        }}>Monitors</Button>
        <h2 className='text-2xl'>Collections</h2>
        <ul >
          {data.monitor.collections.map(c => (
            <li key={c.id}>
              <Link className='btn-link text-sky-blue' to={`${c.id}`}>{c.title}</Link>
            </li>
          ))}
        </ul>
      </div>
      <div className='col-span-9 w-full overflow-y-scroll'>
        <Outlet/>
      </div>
    </div>
  )
}