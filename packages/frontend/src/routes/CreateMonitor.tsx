import {useQuery, useMutation} from '@apollo/client'
import AddCollection from 'components/collections/AddCollection'
import Loader from 'components/shared/Loader'
import MonitorForm, {MonitorFormValues} from 'components/monitors/MonitorForm'
import {CreateOneMonitor} from 'graphql/mutations'
import {GetCollectionsWithoutMonitors, GetMonitors} from 'graphql/queries'
import {useToast} from 'hooks/ToastProvider'
import {createSchedule} from 'lib/createSchedule'
import {useEffect} from 'react'
import { Button, Card } from 'react-daisyui'
import {useNavigate} from 'react-router-dom'
import {MonitorContactInfo} from 'types'
import {FiAlertCircle} from 'react-icons/fi'

export const whereMonitorNullVariables = {
  where: {
    monitor: {
      is: null,
    }
  }
}

export const whereMonitorNotNullVariables = {
  where: {monitorId: {not: null}}
}

type CreateMonitorInput = {
  data: {
    schedule: string
    collections: {
      connect: {id: number}[]
    }
    contactInfo?: MonitorContactInfo
  }
}


export default function CreateMonitor() {
  console.log('create monitor')
  const {addToast} = useToast()
  const navigate = useNavigate()
  const {data: collectionData, loading} = useQuery(GetCollectionsWithoutMonitors, {
    variables: whereMonitorNullVariables,
  })
  const [addMonitor, {data, error, loading: saving}] = useMutation(CreateOneMonitor, {
    update(cache, {data: {createOneMonitor}}) {
      cache.updateQuery({
        query: GetMonitors, variables: whereMonitorNotNullVariables
      }, (data) => {
        const {monitors = []} = data
        return {monitors: [...monitors, createOneMonitor]}
      })

      cache.updateQuery({
        query: GetCollectionsWithoutMonitors, variables: whereMonitorNullVariables,
      }, (data) => {
        const ids = createOneMonitor.collections.map(c => c.id)
        return {collections: data.collections.filter(col => !ids.includes(col.id))}
      })
    }
  })

  const handleSave = async ({contactInfo, value, units, collections}: MonitorFormValues) => {
    const variables: CreateMonitorInput = {
      data: {
        schedule: createSchedule(units, String(value)),
        collections: {
          connect: collections.map(id => ({id}))
        }
      }
    }
    // only add contactInfo if values provided
    if (contactInfo && Object.values(contactInfo).some(Boolean)) {
      variables.data.contactInfo = contactInfo
    }
    return await addMonitor({variables})
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
    return <Card className='z-50 grid bg-gray-50 m-auto bg-opacity-90 w-9/12 place-items-center gap-8 rounded shadow-xl p-4'>
      <Card.Title className='text-cedar-chest text-xl'>
        All collections are already assigned to a monitor.
      </Card.Title>
      <Card.Body className='grid place-items-center'>
        <FiAlertCircle size='64'/>
        <p className='max-w-md text-center text-lg'>You can update an existing monitor, remove a monitor, or create a new collection</p>
      </Card.Body>
      <Card.Actions className='flex gap-4'>
        <Button size='md' className='bg-cadmium-orange' onClick={() => navigate(-1)}>Back</Button>
        <AddCollection/>
      </Card.Actions>
    </Card>
  }

  return (
    <div className='grid place-items-center'>
      <MonitorForm loading={saving} onSave={handleSave} availableCollections={collectionData?.collections}/>
    </div>
  )
}