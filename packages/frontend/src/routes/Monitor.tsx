import { useQuery } from "@apollo/client";
import CollectionRun from "components/CollectionRun";
import Loader from "components/Loader";
import { GetMonitor } from "graphql/queries";
import { useToast } from "hooks/ToastProvider";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import {ICollection} from 'types'

export default function Monitor() {
  const {id} = useParams()
  const {addToast} = useToast()
  const { data, loading, error} = useQuery(GetMonitor, {
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

  useEffect(() => {
    if (error) addToast(error.message, 'error')
  }, [data])


  if (loading) return <Loader/>
  if (!data) return <></>

  return (
    <div className='grid justify-center'>
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