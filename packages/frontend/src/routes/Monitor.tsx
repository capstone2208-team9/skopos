import { useQuery } from "@apollo/client";
import CollectionRun from "components/CollectionRun";
import Loader from "components/Loader";
import { GetMonitor } from "graphql/queries";
import { useToast } from "hooks/ToastProvider";
import { useEffect } from "react";
import {useNavigate, useParams } from "react-router-dom";
import {ICollection} from 'types'
import { IoMdRefresh} from "react-icons/io";
import { Button, Tooltip } from "react-daisyui";

export default function Monitor() {
  const {id} = useParams()
  const {addToast} = useToast()
  const { data, loading, error, refetch } = useQuery(GetMonitor, {
    notifyOnNetworkStatusChange: true,
    variables: {
      where: {
        id: Number(id),
      },
      orderBy: [
        {
          createdAt: "desc"
        }
      ],
      take: 5
    }
  })
  const navigate = useNavigate()

  useEffect(() => {
    if (error) addToast(error.message, 'error')
  }, [data])


  if (loading) return <Loader/>
  if (!data) return <></>

  return (
    <div className='grid justify-center'>
      <div className='flex items-center gap-4'>
        <Button size='sm' className='bg-cadmium-orange' onClick={() => navigate(-1)}>Back</Button>
        <Tooltip message='Last 5 runs'>
          <Button size='sm' className='bg-viridian-green' disabled={loading} onClick={() => refetch()}>
            {loading ? (<Loader size='24'/>) : (
              <IoMdRefresh size='24' className='text-white'/>
            )}
          </Button>
        </Tooltip>
      </div>
      {data.monitor.collections.map((collection: ICollection) => {
        return (<div className='self-center' key={collection.id}>
          <h2 className='text-2xl font-bold'>{collection.title}</h2>
          {collection.collectionRuns.map(run => (<CollectionRun key={run.id}
                                                                collectionRun={run}
          />))}
        </div>)
      })}
    </div>
  )
}