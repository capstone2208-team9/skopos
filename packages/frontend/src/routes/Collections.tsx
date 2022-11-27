import AddCollection from 'components/collections/AddCollection'
import CollectionForm from 'components/collections/CollectionForm'
import CollectionNav from 'components/collections/CollectionNav'
import Loader from 'components/shared/Loader'
import {GetCollectionNames} from 'graphql/queries'
import {useToast} from 'hooks/ToastProvider'
import {useEffect, useState} from 'react'
import {Outlet, useLocation, useOutletContext} from 'react-router-dom'
import {ReactComponent as CollectionImage} from 'assets/undraw_collecting_re_lp6p.svg'
import {ICollection} from 'types'
import { useQuery } from '@apollo/client'

type Collection = Pick<ICollection, 'id' | 'title'> & {
  _count: {
    requests
  }
}

type ContextType = {collections: Collection[], loading: boolean}

export function useCollections() {
  return useOutletContext<ContextType>()
}

export default function Collections() {
  const {pathname} = useLocation()
  const {addToast} = useToast()
  const [editCollection, setEditCollection] = useState<Pick<ICollection, 'id' | 'title'> | null>(null)
  const {loading, data, error} = useQuery<{ collections: Collection[] }>(GetCollectionNames, {
    variables: {orderBy: [{title: 'asc'}]}
  })


  useEffect(() => {
    error && addToast(error.message, 'error')
  }, [])

  if (loading) return <Loader size={64}/>

  return (
    <div className='grid grid-cols-collections min-w-[768px]'>
      <div className='max-w-[15rem]'>
        <div className='flex items-center gap-4 mt-24'>
          <h2 id='collection-heading' className='text-xl font-medium'>Collections</h2>
          <AddCollection buttonSize='sm' compact />
        </div>
        <CollectionNav onSelect={setEditCollection}
                       collections={data?.collections} loading={loading}
        />
      </div>

      <div className='self-center ml-4'>
        {pathname === '/collections' ? (
          <CollectionImage className='max-w-full'/>
        ) : (<Outlet context={{collections: data?.collections || []}} />)}
      </div>
      <CollectionForm collection={editCollection} show={editCollection !== null} onClose={() => setEditCollection(null)}/>
    </div>
  )
}