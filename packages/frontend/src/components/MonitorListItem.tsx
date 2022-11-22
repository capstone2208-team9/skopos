import {useMutation} from '@apollo/client'
import ConfirmDeleteModal from 'components/ConfirmDeleteModal'
import Loader from 'components/Loader'
import ModalPortal from 'components/ModalPortal'
import {DeleteOneMonitor, ToggleMonitorEnabled} from 'graphql/mutations'
import {GetCollectionsWithoutMonitors, GetMonitors} from 'graphql/queries'
import {useToast} from 'hooks/ToastProvider'
import {useModal} from 'hooks/useModal'
import {useEffect} from 'react'
import {Button, Dropdown, Form, Table, Toggle, Tooltip} from 'react-daisyui'
import {MdDelete, MdEdit, MdHistory, MdMoreVert} from 'react-icons/md'
import {Link, useNavigate} from 'react-router-dom'
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
  const navigate = useNavigate()
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

  const info = contactInfo ? Object.keys(contactInfo).join(', ') : 'N/A'

  return (
    <>
      <Table.Row>
        <p className='capitalize'>Running every {schedule}</p>
        <p className='text-center truncate capitalize'>{info}</p>
        <Dropdown horizontal='center' vertical='top' hover className='group ml-auto'>
          <Dropdown.Toggle size='sm' color='secondary' className='group ml-auto'>
            <span className='text-gray-50 text-lg font-medium'>
              {collections.length} collection{`${collections.length > 1 ? 's' : ''}`}
            </span>
            <MdMoreVert size='20' className='group-hover:fill-cadmium-orange  fill-gray-50 ml-2'/>
          </Dropdown.Toggle>
          <Dropdown.Menu className='shadow-xl bg-base-100'>
            {collections.map(col => (
              <Dropdown.Item key={col.id}
                             className='text-secondary font-medium text-lg'
                             onClick={() => navigate(`/collections/${col.id}/requests`)}>{col.title}</Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
        <div className='flex items-center'>
          <Tooltip message='View History'>
            <Link className='btn btn-ghost' to={`/monitors/${id}`}>
              <MdHistory size={ICON_SIZE} className='text-accent'/>
            </Link>
          </Tooltip>
          <Link className='btn btn-ghost' to={`/monitors/${id}/edit`}>
            <MdEdit size={ICON_SIZE} className='text-sky-blue'/>
          </Link>
          <Button startIcon={deleting ? <Loader size={ICON_SIZE} /> :
            <MdDelete size={ICON_SIZE} className='text-error'/>} color='ghost' size='md'
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