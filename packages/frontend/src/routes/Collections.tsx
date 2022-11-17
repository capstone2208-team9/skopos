import AddCollection from 'components/collections/AddCollection'
import CollectionForm from 'components/collections/CollectionForm'
import CollectionNav from 'components/collections/CollectionNav'
import {useState} from 'react'
import {Outlet, useLocation} from 'react-router-dom'
import {ReactComponent as CollectionImage} from 'assets/undraw_collecting_re_lp6p.svg'
import {ICollection} from 'types'

export default function Collections() {
  const {pathname} = useLocation()
  const [editCollection, setEditCollection] = useState<Pick<ICollection, 'id' | 'title'> | null>(null)

  return (
    <div className='grid grid-cols-12 min-w-[768px]'>
      <div className='col-span-3'>
        <div className='flex gap-4'>
          <h2 id='collection-heading' className='text-xl mb-4 font-medium'>Collections</h2>
          <AddCollection buttonSize='sm' compact />
        </div>
        <CollectionNav onSelect={setEditCollection} pathname={pathname}/>
      </div>

      <div className='col-span-9 self-center'>
        {pathname === '/collections' ? (
          <CollectionImage className='max-w-full'/>
        ) : (<Outlet/>)}
      </div>
      <CollectionForm collection={editCollection} show={editCollection !== null} onClose={() => setEditCollection(null)}/>
    </div>
  )
}