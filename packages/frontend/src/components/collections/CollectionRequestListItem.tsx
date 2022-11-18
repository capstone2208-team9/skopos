import {useMutation} from '@apollo/client'
import Loader from 'components/Loader'
import {RemoveRequestFromCollection} from 'graphql/mutations'
import {GetCollection} from 'graphql/queries'
import {LegacyRef, useCallback} from 'react'
import {DraggableProvidedDraggableProps, DraggableProvidedDragHandleProps} from 'react-beautiful-dnd'
import {Badge, Button, ButtonGroup} from 'react-daisyui'
import {MdDelete, MdEdit} from 'react-icons/md'
import {useParams} from 'react-router-dom'
import {ICollection, Request} from 'types'

interface Props {
  request: Request
  onSelect: (request?: Request) => void
  onDelete: (id: number) => void
  onModalOpen: () => void
}

type RequestCardProps = Pick<Props, 'onDelete' | 'onSelect' | 'request'> & {
  deleting: boolean
}

const RequestCard = ({deleting, request, onDelete, onSelect}: RequestCardProps) => {
  return (
    <div className='flex justify-between'>
      <Badge className='mr-4 rounded-full w-6 h-6 bg-sky-blue'>
        {request.stepNumber}
      </Badge>
      {request.title}
      <ButtonGroup className='flex flex-row gap-4'>
        <Button size='sm' color='ghost' type='button' onClick={() => onSelect(request)}>
          <MdEdit size='20' className='text-sky-blue text-xl'/>
        </Button>
        <Button size='sm' color='ghost' type='button' onClick={() => onDelete(request.id)}>
          {deleting ? <Loader size='20'/> : <MdDelete
            size='20' className='text-error text-xl'/>}
        </Button>
      </ButtonGroup>
    </div>

  )
}

interface Props {
  dragging: boolean
  innerRef: LegacyRef<HTMLLIElement> | undefined//(element?: (HTMLElement | null | undefined)) => HTMLElement
  request: Request
  onSelect: (request?: Request) => void
  onDelete: (id: number) => void
  onModalOpen: () => void
  dragProviderProps: DraggableProvidedDraggableProps
  handleProps?: DraggableProvidedDragHandleProps
}

export default function CollectionRequestListItem({ dragging, handleProps, dragProviderProps,
                                                    innerRef, request, onDelete, onSelect, onModalOpen}: Props) {
  const {collectionId} = useParams()
  const [deleteRequest, {loading: deleting}] = useMutation(RemoveRequestFromCollection, {
    update(cache, {data: {updateOneRequest}}) {
      const variables = {
        data: {
          collection: {
            disconnect: true
          }
        },
        where: {
          id: Number(collectionId)
        },
        orderBy: [
          {
            stepNumber: 'asc'
          }
        ]
      }
      const {collection} = cache.readQuery(
        {
          query: GetCollection, variables
        }
      ) as { collection: ICollection }
      const requests = collection.requests.filter(request => request.id !== updateOneRequest.id)
      cache.writeQuery({
        query: GetCollection,
        variables,
        data: {collection: {...collection, requests}}
      })
    }
  })
  const handleClickDelete = useCallback(async (id: number) => {
    await deleteRequest({
      variables: {
        where: {id},
        data: {
          collection: {
            disconnect: true
          }
        }
      }
    })
    onDelete(id)
  }, [onDelete])

  const handleClickEdit = useCallback((request?: Request) => {
    onSelect(request)
    onModalOpen()
  }, [onSelect, onModalOpen])

  const dragClass = dragging ? ` opacity-50` : ''

  return (
    <li key={request.id}
        className={`border border-gray-300 rounded w-full p-4 mb-2 text-xl${dragClass}`}
        ref={innerRef}
        {...handleProps} {...dragProviderProps}
    >
      <RequestCard request={request} onDelete={handleClickDelete} onSelect={handleClickEdit} deleting={deleting}/>
    </li>
  )
}