import CollectionRequestListItem from 'components/collections/CollectionRequestListItem'
import { DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd'
import {Request} from 'types'

interface Props {
  requests: Request[]
  onModalOpen: () => void
  onDelete: (id: number) => void
  onSelect: (request?: Request) => void
  onMove: (fromStep: number, toStep: number) => void
}

export default function RequestList({onModalOpen, onDelete, onSelect, requests, onMove}: Props) {
  const handleDrag = (result) => {
    if (!result.destination) return
    onMove(result.source.index, result.destination.index)
  }

  return (
    <DragDropContext onDragEnd={handleDrag} >
      <Droppable droppableId='droppable'>
        {(provided) => (
          <ul className='col-span-2 w-9/12'
              {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {requests.map((r) => {
              return (
                <Draggable key={r.id} draggableId={String(r.id)} index={r.stepNumber}>
                  {(provided, snapshot) => (
                    <CollectionRequestListItem
                      dragging={snapshot.isDragging}
                      innerRef={provided.innerRef}
                      handleProps={provided.dragHandleProps}
                      dragProviderProps={provided.draggableProps}
                      key={r.id}
                      request={r}
                      onModalOpen={onModalOpen}
                      onDelete={onDelete}
                      onSelect={onSelect}
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
  )
}