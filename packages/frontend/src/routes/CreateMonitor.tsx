import {useQuery, useMutation} from '@apollo/client'
import AddCollection from 'components/collections/AddCollection'
import Loader from 'components/Loader'
import MonitorForm from 'components/MonitorForm'
import {CreateOneMonitor} from 'graphql/mutations'
import {GetCollectionsWithoutMonitors, GetMonitors} from 'graphql/queries'
import {useToast} from 'hooks/ToastProvider'
import {useEffect} from 'react'
import { Button } from 'react-daisyui'
import {useNavigate} from 'react-router-dom'
import {ICollection, Monitor, MonitorCreateInput} from 'types'

const whereMonitorNullVariables = {
  where: {
    monitor: {
      is: null,
    }
  }
}

const whereMonitorNotNullVariables = {
  where: {monitorId: {not: null}}
}


export default function CreateMonitor() {
  const {addToast} = useToast()
  const navigate = useNavigate()
  const {data: collectionData, loading} = useQuery(GetCollectionsWithoutMonitors, {
    variables: whereMonitorNullVariables,
  })
  const [addMonitor, {data, error, loading: saving}] = useMutation(CreateOneMonitor, {
    update(cache, {data: {createOneMonitor}}) {
      const monitorQuery = cache.readQuery<{ monitors: Monitor[] }>({
        query: GetMonitors, variables: whereMonitorNotNullVariables
      })
      if (monitorQuery) {
        cache.writeQuery({
          query: GetMonitors,
          data: {monitors: [...monitorQuery.monitors, createOneMonitor]}
        })
      }

      const getCollectionNames = cache.readQuery<{ collections: ICollection[] }>({
        query: GetCollectionsWithoutMonitors, variables: whereMonitorNullVariables})
      if (getCollectionNames) {
        cache.writeQuery({
          query: GetCollectionsWithoutMonitors, variables: whereMonitorNullVariables, data: {
            collections: getCollectionNames?.collections
              .filter(collection => createOneMonitor.collections.includes(collection.id))
          }
        })
      }
    }
  })

  const handleSave = async ({contactInfo, value, units, collections}: MonitorCreateInput) => {
    const variables: any = {
      data: {
        schedule: `${value} ${+value > 1 ? units : units.slice(0, -1)}`,
        collections: {
          connect: collections.map(id => ({id}))
        }
      }
    }
    // only add contactInfo if values provided
    if (contactInfo && Object.keys(contactInfo).length > 0) {
      variables.data.contactInfo = contactInfo
    }
    await addMonitor({variables})
  }

  useEffect(() => {
    if (data) {
      addToast('Monitor created', 'success')
      navigate('/monitors')
    }
    if (error) {
      addToast('Error creating monitor', 'error')
      console.log(error.message)
    }
  }, [data, error, addToast])

  if (loading) return <Loader size={46}/>

  if (collectionData && collectionData.collections.length === 0) {
    return <div className='grid place-items-center gap-8'>
      <h2 className='font-bold text-xl'>All collections are already assigned to a monitor.</h2>
      <p className='max-w-md text-center'>You can update an existing monitor, remove a monitor, or create a new collection</p>
      <div className='flex gap-4'>
        <Button size='md' className='bg-cadmium-orange' onClick={() => navigate(-1)}>Back</Button>
        <AddCollection/>
      </div>
    </div>
  }

  return (
    <div className='grid place-items-center'>
      <MonitorForm loading={saving} onSave={handleSave} availableCollections={collectionData?.collections}/>
    </div>
  )
}