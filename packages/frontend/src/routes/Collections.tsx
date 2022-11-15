import {useMutation, useQuery} from '@apollo/client'
import AddCollection from 'components/AddCollection'
import CollectionForm from 'components/CollectionForm'
import {GetCollectionNames} from 'graphql/queries'
import {DeleteCollection} from 'graphql/mutations'
import {useEffect, useState} from 'react'
import {Dropdown } from 'react-daisyui'
import {FaSpinner} from 'react-icons/fa'
import {HiOutlineFolder} from 'react-icons/hi'
import {MdDelete, MdEdit} from 'react-icons/md'
import {RiMore2Line} from 'react-icons/ri'
import {NavLink, Outlet, useLocation, useNavigate} from 'react-router-dom'
import {ICollection} from 'types'
import {ReactComponent as CollectionImage} from 'assets/undraw_collecting_re_lp6p.svg'

export default function Collections() {
  const [editCollection, setEditCollection] = useState<Pick<ICollection, 'id' | 'title'> | null>(null)
  const {loading, data} = useQuery<{ collections: Omit<ICollection, 'requests'>[] }>(GetCollectionNames)
  const navigate = useNavigate()
  const {pathname} = useLocation()
  const [deleteCollection, {data: deleteData}] = useMutation(DeleteCollection, {
    update(cache, {data: {deleteOneCollection}}) {
      const {collections} = cache.readQuery({query: GetCollectionNames}) as { collections: Pick<ICollection, 'id' | 'title'>[] }
      cache.writeQuery({
        query: GetCollectionNames,
        data: {collections: collections.filter(c => c.id !== deleteOneCollection.id)}
      })
    },
  })

  useEffect(() => {
    if (deleteData && pathname.includes(deleteData.deleteOneCollection.id)) {
      navigate('/collections')
    }
  }, [deleteData, pathname])

  return (
    <div className='grid grid-cols-12 min-w-[768px]'>
      <div className='col-span-3 md:col-span-2'>
        <div className='flex'>
          <h2 id='collection-heading' className='text-xl mb-4 font-medium'>Collections</h2>
          <AddCollection buttonSize='sm' compact />
        </div>
        <ul aria-labelledby='collection-heading' className='my-4'>
          {loading && <><span className='sr-only'>Loading</span><FaSpinner /></>}
          {data && data.collections.map(collection => (
            <li className='flex items-center text-lg whitespace-nowrap' key={collection.id}>
              <NavLink to={collection.id.toString()} className={({isActive}) => isActive ? `flex items-center gap-2 text-viridian-green font-medium` : `flex text-dark-green items-center gap-2`}>
                <HiOutlineFolder size='26'/>
                <span className='hover:scale-105 transition-transform transition-400'>{collection.title}</span>
              </NavLink>
              <Dropdown horizontal='right'>
                <Dropdown.Toggle size='xs' color='ghost' className='ml-1'>
                  <RiMore2Line size='18'/>
                </Dropdown.Toggle>
                <Dropdown.Menu className='shadow-xl bg-base-100'>
                  <Dropdown.Item className='text-primary' onClick={() => setEditCollection(collection)}><MdEdit/> Edit</Dropdown.Item>
                  <Dropdown.Item className='text-error' onClick={async () => {
                    await deleteCollection({
                      variables: {
                        where: {
                          id: Number(collection.id)
                        }
                      }
                    })
                  }}><MdDelete /> Delete</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </li>
          ))}
        </ul>
      </div>

      <div className='col-span-9'>
        {pathname === '/collections' ? (
          <CollectionImage className='max-w-full'/>
        ) : (<Outlet/>)}
      </div>
      <CollectionForm collection={editCollection} show={editCollection !== null} onClose={() => setEditCollection(null)}/>
    </div>
  )
}