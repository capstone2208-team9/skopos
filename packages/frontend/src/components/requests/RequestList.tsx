import {useMutation, useQuery} from '@apollo/client'
import {ReactComponent as Empty} from 'assets/undraw_not_found_re_44w9.svg'
import RequestListItem from 'components/collections/RequestListItem'
import Loader from 'components/Loader'
import {ReorderRequests} from 'graphql/mutations'
import {GetRequests} from 'graphql/queries'
import {useToast} from 'hooks/ToastProvider'
import {useEffect} from 'react'
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd'
import {Outlet, useParams} from 'react-router-dom'
import {useCollection} from 'routes/Collection'

export const getRequestVariables = (collectionId?: string) => ({
  where: {
    collectionId: {
      equals: Number(collectionId)
    }
  },
  orderBy: [
    {
      stepNumber: 'asc'
    }
  ]
})

export default function RequestList() {
  const {collectionId} = useParams()
  const {numRequests} = useCollection()
  const {loading, data, error} = useQuery(GetRequests, {
    variables: getRequestVariables(collectionId)
  })
  const [reorderRequests, {
    loading: reordering
  }] = useMutation(ReorderRequests, {
    update(cache, {data: {reorderRequests}}) {
      cache.writeQuery({
        query: GetRequests, variables: getRequestVariables(collectionId),
        data: {
          requests: reorderRequests
        }
      })
    },
  })
  const {addToast} = useToast()

  const handleDrag = async (result) => {
    if (!result.destination || !collectionId) return
    await reorderRequests({
      variables: {
        data: {
          collectionId: +collectionId,
          fromStep: result.source.index,
          toStep: result.destination.index
        }
      },
      optimisticResponse: {
        reorderRequests: [...data.requests]
          .sort((a, b) => a.stepNumber < b.stepNumber ? -1 : 1)
      }
    })
  }

  useEffect(() => {
    error && addToast(error.message, 'error')
  }, [error])

  if (loading) return <Loader size={48}/>

  if (!data.requests.length) {
    return <Empty className='max-w-md mt-auto'/>
  }

  return (
    <div className='grid grid-rows-1 grid-cols-1 place-items-center w-full'>
      <DragDropContext onDragEnd={handleDrag}>
        <Droppable droppableId='droppable'>
          {(provided) => (
            <ul className='col-start-1 col-span-full row-start-1 row-span-full w-9/12'
                {...provided.droppableProps}
                ref={provided.innerRef}
            >
              {data.requests.map((r) => {
                return (
                  <Draggable key={r.id} draggableId={String(r.id)} index={r.stepNumber}
                             isDragDisabled={reordering}
                  >
                    {(provided, snapshot) => (
                      <RequestListItem
                        nextStep={numRequests + 1}
                        dragging={snapshot.isDragging}
                        reordering={reordering}
                        innerRef={provided.innerRef}
                        handleProps={provided.dragHandleProps}
                        dragProviderProps={provided.draggableProps}
                        key={r.id}
                        request={r}
                      />
                    )}
                  </Draggable>
                )
              })}
              {provided.placeholder}
            </ul>

          )}
        </Droppable>
      </DragDropContext>
      <div className='col-start-1 col-span-full row-start-1 row-span-full z-20 w-full'>
        <Outlet/>
      </div>
    </div>
  )
}