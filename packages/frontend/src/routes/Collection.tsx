import CollectionRunner from 'components/collectionRuns/CollectionRunner'
import {Tooltip} from 'react-daisyui'
import {FaSpinner} from 'react-icons/fa'
import {MdHistory} from 'react-icons/md'
import {Link, Outlet, useLocation, useOutletContext, useParams} from 'react-router-dom'
import {useCollections} from 'routes/Collections'
import {ReactComponent as CollectionImage} from 'assets/SVGs/Skopos_Branding_Final Logo_Favicon_without circle.svg'
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

  const collection = collections.find(c => c.id === Number(collectionId))

  if (loading || !collection) return (
    <div className='grid place-items-center'>
      <FaSpinner size={48} className='animate-spin text-2xl'/>
    </div>
  )
  return (
    <div className="flex flex-col gap-4 relative items-center min-h-screen w-full">
      <CollectionImage className='-z-10 opacity-20 absolute left-0 -top-36 lg:-top-48 max-w-full w-full h-auto'/>
      <header className='flex gap-8 items-center mb-8'>
        <h2 className='collection-title text-3xl font-medium'>{collection?.title}</h2>
        <div className='flex items-center gap-4'>
          {collection?._count.requests > 0 && (
            <>
              <Tooltip className='text-sky-blue hover:text-cadmium-orange hover:scale-105' message='See Past Runs'>
                <Link className='link text-inherit' to={`/collection-runs/${collectionId}`}>
                  <MdHistory size='28' className='fill-current duration-500 hover:-rotate-180'/>
                </Link>
              </Tooltip>
              <CollectionRunner/>
            </>
          )}
          <Link className='btn btn-sm bg-cadmium-orange hover:bg-opacity-80' to='requests/new'
                state={{nextStep: collection?._count.requests + 1}}
          >Add Request</Link>
        </div>
      </header>
      <div className='grid w-full'>
        {pathname.includes('requests') ? (
          <Outlet context={{ numRequests: collection?._count.requests}}/>
        ) : (
          <div className='text-center w-full'>
            <Link className='mt-24 btn btn-lg bg-sky-blue' to='requests'>View Requests</Link>
          </div>
        )}
      </div>
    </div>
  )
}

