import CollectionNavListItem from 'components/collections/CollectionNavListItem'
import {useEffect} from 'react'
import {useQuery, useMutation} from '@apollo/client'
import {FaSpinner} from 'react-icons/fa'
import {useNavigate} from 'react-router-dom'
import {GetCollectionNames} from 'graphql/queries'
import {DeleteCollection} from 'graphql/mutations'
import {ICollection} from 'types'

type Collection = Pick<ICollection, 'id' | 'title'>

interface Props {
  onSelect: (collection: Collection) => void
  pathname: string
}

export default function CollectionNav({pathname, onSelect }: Props) {
  const navigate = useNavigate()
  const {loading, data} = useQuery<{ collections: Collection[] }>(GetCollectionNames)
  const [deleteCollection, {data: deleteData}] = useMutation(DeleteCollection, {
    update(cache, {data: {deleteOneCollection}}) {
      const {collections} = cache.readQuery({query: GetCollectionNames}) as { collections: Pick<ICollection, 'id' | 'title'>[] }
      cache.writeQuery({
        query: GetCollectionNames,
        data: {collections: collections.filter(c => c.id !== deleteOneCollection.id)}
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
      {loading && <><span className='sr-only'>Loading</span><FaSpinner /></>}
      {data && data.collections.map(collection => (
        <CollectionNavListItem key={collection.id}
                               collection={collection}
                               onDelete={handleDelete}
                               onSelect={onSelect}
        />))}
    </ul>

  )
}