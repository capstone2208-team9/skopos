import {useMutation} from '@apollo/client'
import Loader from 'components/Loader'
import {DeleteRequest} from 'graphql/mutations'
import {GetRequests} from 'graphql/queries'
import {LegacyRef} from 'react'
import {DraggableProvidedDraggableProps, DraggableProvidedDragHandleProps} from 'react-beautiful-dnd'
import {Badge, Button, ButtonGroup} from 'react-daisyui'
import {MdDelete, MdEdit} from 'react-icons/md'
import {Link, useParams} from 'react-router-dom'
import {Request} from 'types'

const deleteRequestVariables = (collectionId: number, requestId: number) => ({
  data: {
    collectionId,
    requestId
  }
})

interface RequestCardProps {
  title: string
  stepNumber: number
  id?: number
  reordering: boolean
  nextStep: number
}

const RequestCard = ({title, stepNumber, id, reordering, nextStep }: RequestCardProps) => {
  const {collectionId} = useParams()

  const handleClickDelete = async (id: number) => {
    if (!collectionId) return
    await deleteRequest({
      variables: deleteRequestVariables(+collectionId, id)
    })
  }

  const [deleteRequest, {loading: deleting}] = useMutation(DeleteRequest, {
    update(cache, {data: {deleteRequest}}) {
      if (!collectionId) return
      const variables = {
        where: {
          collectionId: {
            equals: +collectionId
          },
        },
        orderBy: [
          {
            stepNumber: null
          }
        ]
      }
      const requestQuery = cache.readQuery<{requests: Request[]}>(
        {
          query: GetRequests, variables
        }
      )
      if (!requestQuery) return
      cache.writeQuery({
        query: GetRequests,
        variables,
        data: {requests: deleteRequest}
      })
    }
  })
  return (
    <div className='flex justify-between'>
      <Badge className='mr-4 rounded-full w-6 h-6 bg-sky-blue'>
        {reordering ? <Loader/> : stepNumber}
      </Badge>
      {reordering ? <Loader/> : <span className='truncate'>{title}</span>}
      <ButtonGroup className='flex flex-row gap-4'>
        <Link className='btn btn-ghost' state={{nextStep}} to={`${id}/edit`}>
          <MdEdit size='20' className='text-sky-blue text-xl'/>
        </Link>
        <Button size='md' color='ghost' type='button' onClick={() => handleClickDelete}>
          {deleting ? <Loader size='20'/> : <MdDelete
            size='20' className='text-error text-xl'/>}
        </Button>
      </ButtonGroup>
    </div>

  )
}

interface Props {
  nextStep: number
  dragging: boolean
  reordering: boolean
  innerRef: LegacyRef<HTMLLIElement> | undefined//(element?: (HTMLElement | null | undefined)) => HTMLElement
  request: Request
  dragProviderProps: DraggableProvidedDraggableProps
  handleProps?: DraggableProvidedDragHandleProps
}

export default function RequestListItem({
                                          dragging, handleProps, dragProviderProps,
                                          innerRef, request, reordering, nextStep
                                        }: Props) {

  const dragClass = dragging ? ` opacity-50` : ''

  return (
    <li key={request.id}
        className={`border border-gray-300 rounded w-full p-4 mb-2 text-xl${dragClass}`}
        ref={innerRef}
        {...handleProps} {...dragProviderProps}
    >
      <RequestCard {...request} reordering={reordering} nextStep={nextStep} />
    </li>
  )
}