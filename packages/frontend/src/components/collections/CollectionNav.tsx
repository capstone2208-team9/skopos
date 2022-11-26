import {useMutation} from '@apollo/client'
import CollectionNavListItem from 'components/collections/CollectionNavListItem'
import {DeleteCollection} from 'graphql/mutations'
import {GetCollectionNames} from 'graphql/queries'
import sortCollectionsByTitle from 'lib/sortCollectionsByTitle'
import {useEffect} from 'react'
import {FaSpinner} from 'react-icons/fa'
import {useNavigate} from 'react-router-dom'
import {ICollection} from 'types'

type Collection = Pick<ICollection, 'id' | 'title'>

interface Props {
  onSelect: (collection: Collection) => void
  pathname: string
  collections?: Pick<ICollection, 'id' | 'title'>[]
  loading: boolean
}

export default function CollectionNav({collections, loading, pathname, onSelect}: Props) {
  const navigate = useNavigate()
  const [deleteCollection, {data: deleteData}] = useMutation(DeleteCollection, {
    update(cache, {data: {deleteOneCollection}}) {
      cache.updateQuery({
        query: GetCollectionNames,
        variables: {orderBy: [{title: 'asc'}]}
      }, (data) => {
        const collections = sortCollectionsByTitle(data.collections
          .filter(c => c.id !== deleteOneCollection.id))
        return {collections}
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

      return (
        <ul aria-labelledby='collection-heading' className='my-4'>
          {loading && <><span className='sr-only'>Loading</span><FaSpinner/></>}
          {collections && collections.map(collection => (
            <CollectionNavListItem key={collection.id}
                                   collection={collection}
                                   onDelete={handleDelete}
                                   onSelect={onSelect}
            />))}
        </ul>
      )
    }