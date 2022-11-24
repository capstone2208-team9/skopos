import CollectionRunResponse from "components/collectionRuns/CollectionRunResponse";
import { formatDate } from "lib/dateUtils";
import { useState } from "react";
import { Collapse } from "react-daisyui";
import { CollectionRun as CollectionRunType } from "types";
import { v4 as uuid} from 'uuid'

interface Props {
  collectionRun: CollectionRunType
}

export default function CollectionRun({collectionRun}: Props) {
  const [, setExpanded] = useState(false)
  const handleOpen = () => setExpanded(true)
  const handleClose = () => setExpanded(false)
  const toggle = () => setExpanded(prev => !prev)
  const date = formatDate(collectionRun.createdAt)

  const notRun = (collectionRun.collection?.requests.length || 0) - collectionRun.responses.length
  return (
    <Collapse key={uuid()}
              checkbox
              icon='arrow'
              onToggle={toggle}
              onOpen={handleOpen}
              onClose={handleClose}
    >
      <Collapse.Title className='text-xl text-dark-green my-4'
      >
        <span className='font-medium'>Run Date</span> {date}
      </Collapse.Title>
      <Collapse.Content className='flex flex-col items-center'>
        {notRun > 0 && (
          <p className='text-cedar-chest'><span>{notRun}</span> responses were not recorded due to errors</p>
        )}
        <div className='grid grid-cols-1 gap-2'>
            {collectionRun.responses.map(response => (
              <CollectionRunResponse key={response.id} response={response}/>
            ))}
        </div>
      </Collapse.Content>
    </Collapse>
  )
}