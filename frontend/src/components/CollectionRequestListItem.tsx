import { useMutation } from "@apollo/client";
import { GetCollection} from "graphql/queries";
import { RemoveRequestFromCollection } from 'graphql/mutations'
import { Badge, Button, ButtonGroup, Tooltip } from "react-daisyui";
import { MdDelete, MdEdit, MdHistory } from "react-icons/md";
import { Link, useParams } from "react-router-dom";
import { ICollection, Request } from "types";

interface Props {
  request: Request
  onSelect: (request?: Request) => void
  onModalOpen: () => void
}
export default function CollectionRequestListItem({request, onSelect, onModalOpen}: Props) {
  const { collectionId } = useParams();
  const [deleteRequest] = useMutation(RemoveRequestFromCollection, {
    update(cache, { data: { updateOneRequest } }) {
      const variables = {
        data: {
          collection: {
            disconnect: true
          }
        },
        where: {
          id: Number(collectionId)
        },
        orderBy: [
          {
            stepNumber: "asc"
          }
        ]
      };
      const { collection } = cache.readQuery(
        {
          query: GetCollection, variables
        }
      ) as { collection: ICollection };
      const requests = collection.requests.filter(request => request.id !== updateOneRequest.id);
      cache.writeQuery({
        query: GetCollection,
        variables,
        data: { collection: { ...collection, requests } }
      });
    }
  });

  const handleClickDelete = async (id: number) => {
    await deleteRequest({
      variables: {
        where: { id },
        data: {
          collection: {
            disconnect: true
          }
        }
      }
    });
    onSelect(undefined);
  };

  const handleClickEdit = (request: Request) => {
    onSelect(request);
    onModalOpen();
  };

  return (
    <li className="flex items-center justify-between gap-4 mb-2" key={request.id}>
               <span className="font-medium"><Badge className='mr-4 bg-viridian-green'>
                 {request.stepNumber}
               </Badge> {request.title}</span>
      <ButtonGroup className='ml-4'>
        <Tooltip message='See Past Runs'>
          <Link className='btn btn-ghost btn-sm' to={`/collection-runs/${collectionId}`}>
            <MdHistory size='20' className='text-viridian-green'/>
          </Link>
        </Tooltip>
        <Button size="sm" color="ghost" type="button" onClick={() => handleClickEdit(request)}><MdEdit
          size='20' className="text-sky-blue text-xl" /></Button>
        <Button size="sm" color="ghost" type="button" onClick={() => handleClickDelete(request.id)}><MdDelete
          size='20' className="text-error text-xl" /></Button>
      </ButtonGroup>
    </li>
  )
}