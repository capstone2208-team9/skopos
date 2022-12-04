import AddCollection from 'components/collections/AddCollection'
import CollectionForm from 'components/collections/CollectionForm'
import CollectionNav from 'components/collections/CollectionNav'
import Loader from 'components/shared/Loader'
import {GetCollectionNames} from 'graphql/queries'
import {useToast} from 'hooks/ToastProvider'
import {useEffect, useState} from 'react'
import {Outlet, useLocation, useOutletContext} from 'react-router-dom'
import {ReactComponent as CollectionImage} from 'assets/SVGs/Skopos_Branding_Final Logo_Favicon_without circle.svg'
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
    <div className='grid grid-cols-collections min-w-[768px] mt-16'>
      <div className='max-w-[15rem]'>
        <div className='flex items-center gap-4'>
          <h2 id='collection-heading' className='text-2xl font-medium'>Collections</h2>
          <AddCollection buttonSize='sm' compact />
        </div>
        <CollectionNav onSelect={setEditCollection}
                       collections={data?.collections} loading={loading}
        />
      </div>

      <div className='self-center ml-4'>
        {pathname === '/collections' ? (
          <div className='text-center'>
            <p className='font-medium text-lg'>Select/Create a collection from the menu</p>
            <CollectionImage className='-transform-y-48 m-auto w-auto h-full max-h-[75vh]'/>
          </div>
        ) : (<Outlet context={{collections: data?.collections || []}} />)}
      </div>
      <CollectionForm collection={editCollection} show={editCollection !== null} onClose={() => setEditCollection(null)}/>
    </div>
  )
}