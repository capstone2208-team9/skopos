import CollectionRunner from 'components/CollectionRunner'
import {Tooltip} from 'react-daisyui'
import {FaSpinner} from 'react-icons/fa'
import {MdHistory} from 'react-icons/md'
import {Link, Outlet, useLocation, useOutletContext, useParams} from 'react-router-dom'
import {useCollections} from 'routes/Collections'

type Context = {
  numRequests: number
}

export const useCollection = () => {
  return useOutletContext<Context>()
}

export default function Collection() {
  const {collectionId} = useParams()
  const {collections, loading} = useCollections()
  const { pathname } = useLocation()

  console.log(collections)
  const collection = collections.find(c => c.id === Number(collectionId))
  console.log(collection)

  if (loading || !collection) return (
    <div className='grid place-items-center'>
      <FaSpinner size={48} className='animate-spin text-2xl'/>
    </div>
  )

  return (
    <div className='flex flex-col gap-4 items-center w-full'>
      <section className='flex gap-8 items-center mb-8'>
        <h2 className='collection-title text-3xl font-medium'>{collection?.title}</h2>
        <div className='flex items-center gap-4'>
          <Tooltip className='text-sky-blue hover:text-cadmium-orange hover:scale-105' message='See Past Runs'>
            <Link className='link text-inherit' to={`/collection-runs/${collectionId}`}>
              <MdHistory size='28' className='fill-current'/>
            </Link>
          </Tooltip>
          <Link className='btn btn-sm bg-cadmium-orange' to='requests/new'>Add Request</Link>
          {collection?._count.requests > 0 && (
            <CollectionRunner/>
          )}
        </div>
      </section>
      {pathname.includes('requests') ? (
        <Outlet context={{ numRequests: collection?._count.requests}}/>
      ) : (
        <Link className='btn btn-lg bg-sky-blue' to='requests'>View Requests</Link>
      )}
    </div>
  )
}

