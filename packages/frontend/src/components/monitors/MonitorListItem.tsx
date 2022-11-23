import {useMutation} from '@apollo/client'
import ConfirmDeleteModal from 'components/shared/ConfirmDeleteModal'
import Loader from 'components/shared/Loader'
import ModalPortal from 'components/shared/ModalPortal'
import {DeleteOneMonitor, ToggleMonitorEnabled} from 'graphql/mutations'
import {GetCollectionsWithoutMonitors, GetMonitors} from 'graphql/queries'
import {useToast} from 'hooks/ToastProvider'
import {useModal} from 'hooks/useModal'
import {useEffect} from 'react'
import {Button, Dropdown, Form, Table, Toggle, Tooltip} from 'react-daisyui'
import {MdDelete, MdEdit, MdHistory, MdMoreVert} from 'react-icons/md'
import {Link} from 'react-router-dom'
import {whereMonitorNotNullVariables} from 'routes/CreateMonitor'
import {ICollection, MonitorContactInfo} from 'types'

interface Props {
  schedule: string;
  collections: ICollection[];
  contactInfo: MonitorContactInfo;
  enabled: boolean;
  id: number;
}

const ICON_SIZE = 24

const whereMonitorNullVariables = {
  where: {
    monitor: {
      is: null,
    }
  }
}

export default function MonitorListItem({enabled, schedule, collections, contactInfo, id}: Props) {
  const [deleteModalOpen, toggleDeleteModalOpen] = useModal()
  const {addToast} = useToast()
  const [toggleMonitorEnabled, {loading: toggling, error: toggleError}] = useMutation(ToggleMonitorEnabled)
  const [deleteMonitor, {loading: deleting, error: deleteError}] = useMutation(DeleteOneMonitor, {
    update(cache, {data: {deleteOneMonitor}}) {
      cache.updateQuery({
        query: GetMonitors, variables: whereMonitorNotNullVariables
      }, (data) => {
        return {monitors: data.monitors.filter(m => m.id !== deleteOneMonitor.id)}
      },)

      cache.updateQuery({
        query: GetCollectionsWithoutMonitors, variables: whereMonitorNullVariables,
      }, (data) => {
        return data
          ? {collections: [...data.collections, ...collections]}
          : {collections}
      })
    }
  })

  const handleDelete = async () => {
    toggleDeleteModalOpen()
    await deleteMonitor({variables: {where: {id}}})
  }

  const toggleEnabled = () => {
    toggleMonitorEnabled({variables: {
        data: {
          enabled: {
            set: !enabled
          }
        },
        where: {id}
      }})
  }

  useEffect(() => {
    if (deleteError) addToast(deleteError.message, 'error')
  }, [deleteError, addToast])

  useEffect(() => {
    if (toggleError) addToast(toggleError.message, 'error')
  }, [toggleError, addToast])

  const info = contactInfo ? Object.keys(contactInfo).filter(k => contactInfo[k] !== '').join(', ') : 'N/A'

  return (
    <>
      <Table.Row >
        <p className={`capitalize${!enabled ? ' text-cedar-chest' : ''}`}>Running every {schedule}</p>
        <p className='text-center truncate capitalize'>{info || 'N/A'}</p>
        <Dropdown horizontal='right' vertical='end' hover className='z-auto group ml-auto'>
          <Dropdown.Toggle size='sm' color='secondary' className='group ml-auto'>
            <span className='text-gray-50 text-lg font-medium'>
              {collections.length} collection{`${collections.length > 1 ? 's' : ''}`}
            </span>
            <MdMoreVert size='20' className='group-hover:fill-cadmium-orange  fill-gray-50 ml-2'/>
          </Dropdown.Toggle>
          <Dropdown.Menu className='shadow-xl bg-sky-50'>
            {collections.map(col => (
              <Dropdown.Item key={col.id}
                             className='bg-sky-50 text-dark-green hover:text-sky-blue font-medium text-lg'>
                <Tooltip message='View History'>
                  <Link className='text-inherit' to={`/collection-runs/${col.id}`}>
                    <div className='flex gap-2 items-center'>
                      <span>{col.title}</span>
                      <MdHistory size={ICON_SIZE} className='fill-current'/>
                    </div>
                  </Link>
                </Tooltip>
                </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
        <div className='flex items-center'>
          <Link className='btn btn-link hover:opacity-75 hover:scale-110' to={`/monitors/${id}/edit`}>
            <MdEdit size={ICON_SIZE} className='text-sky-blue'/>
          </Link>
          <Button className='btn btn-link hover:opacity-75 hover:scale-110' startIcon={deleting ? <Loader size={ICON_SIZE} /> :
            <MdDelete size={ICON_SIZE} className='text-error'/>} size='md'
                  onClick={toggleDeleteModalOpen}
          />
          {toggling ? (<Loader size={ICON_SIZE}/>) : (
            <Form>
              <Tooltip className='ml-1 pt-[5px]' message={`Monitor is ${enabled ? 'ON' : 'OFF'}`}>
                <Toggle size='sm' className="bg-sky-blue"
                        onChange={toggleEnabled} checked={enabled}
                ></Toggle>
              </Tooltip>
            </Form>
          )}
        </div>
      </Table.Row>
      <ModalPortal id='confirm-delete-modal'>
        <ConfirmDeleteModal open={deleteModalOpen} onDelete={handleDelete}
                            onCancel={toggleDeleteModalOpen}/>
      </ModalPortal>
    </>
  )
}