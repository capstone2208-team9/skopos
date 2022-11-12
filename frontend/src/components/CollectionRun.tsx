import CollectionRunResponse from "components/CollectionRunResponse";
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
        <span className='font-medium'>Run Date</span> {formatDate(collectionRun.createdAt)}
      </Collapse.Title>
      <Collapse.Content  className='grid md:grid-cols-2 gap-2'>
        {collectionRun.responses.map(response => (
          <CollectionRunResponse key={response.id} response={response}/>
        ))}
      </Collapse.Content>
    </Collapse>
  )
}