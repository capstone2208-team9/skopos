import { CollectionRun as CollectionRunType } from "types"
import CollectionRun from 'components/CollectionRun'
import { v4 as uuid} from 'uuid'
import {ReactComponent as SVGComponent } from 'assets/undraw_not_found_re_44w9.svg'

interface Props {
  collectionRuns: CollectionRunType[]
}
export default function CollectionRunsContainer({collectionRuns}: Props) {
  if (collectionRuns.length === 0) {
    return <div className='grid place-items-center my-8 grid-cols-2'>
      <h4 className='text-2xl font-medium col-start-1'>Nothing to see yet</h4>
      <SVGComponent className='max-w-full col-start-1 col-span-full' />
    </div>
  }
  return (
    <div className=''>
      {collectionRuns.map(run => (
        <CollectionRun key={uuid()} collectionRun={run}/>
      ))}
    </div>
  )
}