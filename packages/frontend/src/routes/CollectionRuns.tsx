import { useQuery } from "@apollo/client";
import { GetCollectionRuns } from "graphql/queries";
import { useToast } from "hooks/ToastProvider";
import { useEffect } from "react";
import { Button } from "react-daisyui";
import { IoMdRefresh} from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import CollectionRunsContainer from "components/CollectionRunsContainer";
import Loader from "components/Loader";

const variables = (collectionId?: string) => {
  if (!collectionId) return {}
  return (
    {
      where: {
        collectionId: {
          equals: Number(collectionId)
        }
      },
      orderBy: [
        {
          createdAt: "desc"
        }
      ],
      take: 10
    }
  )
}

interface Props {}
export default function CollectionRuns({}: Props) {
  const {collectionId} = useParams()
  const {addToast} = useToast()
  const navigate = useNavigate()
  const {data, error, loading, refetch} = useQuery(GetCollectionRuns,
    { variables: variables(collectionId) })


  useEffect(() => {
    if (error) addToast(error.message, 'error')
  }, [error])

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
      <CollectionRunsContainer collectionRuns={data.collectionRuns}/>
    </>
  )
}