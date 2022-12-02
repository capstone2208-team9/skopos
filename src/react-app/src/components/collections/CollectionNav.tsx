import {useMutation} from '@apollo/client'
import CollectionNavListItem from 'components/collections/CollectionNavListItem'
import Loader from 'components/shared/Loader'
import {DeleteCollection} from 'graphql/mutations'
import {GetCollectionNames, GetCollectionsWithoutMonitors} from 'graphql/queries'
import {useToast} from 'hooks/ToastProvider'
import sortCollectionsByTitle from 'lib/sortCollectionsByTitle'
import {useEffect} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {whereMonitorNullVariables} from 'routes/CreateMonitor'
import {ICollection} from 'types'

type Collection = Pick<ICollection, 'id' | 'title'>

interface Props {
  onSelect: (collection: Collection) => void
  collections?: Pick<ICollection, 'id' | 'title'>[]
  loading: boolean
}

export default function CollectionNav({collections, loading, onSelect}: Props) {
  const {pathname} = useLocation()
  const {addToast} = useToast()
  const navigate = useNavigate()
  const [deleteCollection, {data: deleteData, error}] = useMutation(DeleteCollection, {
    update(cache, {data: {deleteOneCollection}}) {
      cache.updateQuery({
        query: GetCollectionNames,
        variables: {orderBy: [{title: 'asc'}]}
      }, (data) => {
        const collections = sortCollectionsByTitle(data.collections
          .filter(c => c.id !== deleteOneCollection.id))
        return {collections}
      })

      cache.updateQuery({
        query: GetCollectionsWithoutMonitors, variables: whereMonitorNullVariables,
      }, (data) => {
        if (!data || !data.collections) return {collections: []}

        return data
          ? {collections: data.collections.filter(c => c.id !== deleteOneCollection.id)}
          : {collections}
      })
    },
  })

  const handleDelete = async (collection: Collection) => {
    await deleteCollection({
      variables: {
        where: {
          id: Number(collection.id)
        }
      }
    })
  }

  useEffect(() => {
    if (deleteData && pathname.includes(deleteData.deleteOneCollection.id)) {
      navigate('/collections')
    }
  }, [deleteData, pathname])

  useEffect(() => {
    error && addToast(error.message, 'error')
  }, [error, addToast])

  return (
    <ul aria-labelledby='collection-heading' className='my-4'>
      {loading && <Loader/>}
      {collections && collections.map(collection => (
        <CollectionNavListItem key={collection.id}
                               collection={collection}
                               onDelete={handleDelete}
                               onSelect={onSelect}
        />))}
    </ul>
  )
}