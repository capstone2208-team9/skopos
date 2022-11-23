import { CollectionRun as CollectionRunType } from "types"
import CollectionRun from 'components/collectionRuns/CollectionRun'
import {ReactComponent as SVGComponent } from 'assets/undraw_not_found_re_44w9.svg'

interface Props {
  collectionRuns: CollectionRunType[]
}
export default function CollectionRunsContainer({collectionRuns}: Props) {
  if (collectionRuns.length === 0) {
    return <div className='grid place-items-center my-8 grid-cols-2 gap-4 w-full'>
      <h4 className='text-2xl font-medium col-start-1'>Nothing to see yet</h4>
      <SVGComponent className='max-w-full col-start-1 col-span-full' />
    </div>
  }
  return (
    <div>
      {collectionRuns.map(run => (
        <CollectionRun key={run.id} collectionRun={run}/>
      ))}
    </div>
  )
}