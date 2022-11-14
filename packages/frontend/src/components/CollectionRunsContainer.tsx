import { CollectionRun as CollectionRunType } from "types"
import CollectionRun from 'components/CollectionRun'
import { v4 as uuid} from 'uuid'

interface Props {
  collectionRuns: CollectionRunType[]
}
export default function CollectionRunsContainer({collectionRuns}: Props) {
  return (
    <div className=''>
      {collectionRuns.map(run => (
        <CollectionRun key={uuid()} collectionRun={run}/>
      ))}
    </div>
  )
}