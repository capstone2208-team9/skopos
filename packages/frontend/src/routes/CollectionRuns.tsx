import {useQuery} from '@apollo/client'
import CollectionRunsContainer from 'components/CollectionRunsContainer'
import Loader from 'components/Loader'
import {PaginateCollectionRuns} from 'graphql/queries'
import {useToast} from 'hooks/ToastProvider'
import {useEffect, useRef} from 'react'
import {Button} from 'react-daisyui'
import {IoMdRefresh} from 'react-icons/io'
import {useNavigate, useParams} from 'react-router-dom'
import {CollectionRun} from 'types'

const variables = (collectionId?: string, cursor = '') => {
  return (
    {
      data: {
        collectionIds: [Number(collectionId)],
        cursor,
        take: 4,
      }
    }
  )
}

export default function CollectionRuns() {
  const {collectionId} = useParams()
  const {addToast} = useToast()
  const navigate = useNavigate()
  const ref = useRef<HTMLButtonElement>(null)
  const {
    data,
    error,
    loading,
    refetch,
    fetchMore,
  } = useQuery<{ paginateCollectionRuns: { items: CollectionRun[], cursor: string, hasMore: boolean } }>(PaginateCollectionRuns,
    {
      variables: variables(collectionId),
    })


  useEffect(() => {
    if (error) addToast(error.message, 'error')
  }, [error])

  useEffect(() => {
    if (!data) return
    ref.current?.scrollIntoView({behavior: 'smooth'})
  }, [ref, data])
  

  if (loading) return <Loader/>
  if (!data) return <></>


  return (
    <>
      <div className='flex items-center gap-4'>
        <Button size='sm' className='bg-cadmium-orange' onClick={() => navigate(-1)}>Back</Button>
        <Button size='sm' className='bg-viridian-green' onClick={() => refetch()}>
          {loading ? (<Loader size='20'/>) : (
            <IoMdRefresh size='24' className='text-white'/>
          )}
        </Button>
      </div>
      <div>
        <CollectionRunsContainer collectionRuns={data.paginateCollectionRuns.items}/>
        <Button size='sm' disabled={!data.paginateCollectionRuns.hasMore}
                ref={ref}
                className='bg-dark-green'
                onClick={async () => {
                  await fetchMore({
                    variables: variables(collectionId, data.paginateCollectionRuns.cursor)
                  })
                }}
        >
          {loading ? (<Loader size='20'/>) : (
            'Load More'
          )}
        </Button>

      </div>
    </>
  )
}