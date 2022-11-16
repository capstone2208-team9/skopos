import { useMutation } from "@apollo/client";
import { GetCollection} from "graphql/queries";
import {RemoveRequestFromCollection} from 'graphql/mutations'
import { Badge, Button, ButtonGroup} from "react-daisyui";
import { MdDelete, MdEdit} from "react-icons/md";
import { useParams } from "react-router-dom";
import { ICollection, Request } from "types";

interface Props {
  request: Request
  onSelect: (request?: Request) => void
  onDelete: (id: number) => void
  onModalOpen: () => void
}
export default function CollectionRequestListItem({request, onDelete, onSelect, onModalOpen}: Props) {
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
    onDelete(id);
  };

  const handleClickEdit = (request: Request) => {
    onSelect(request);
    onModalOpen();
  };

  return (
    <li className="flex justify-start gap-4 mb-2 text-xl border-b py-2" key={request.id}>
                 <Badge className='mr-4 rounded-full w-6 h-6 bg-sky-blue'>
                 {request.stepNumber}
               </Badge> {request.title}
      <ButtonGroup className='ml-auto'>
        <Button size="sm" color="ghost" type="button" onClick={() => handleClickEdit(request)}><MdEdit
          size='20' className="text-sky-blue text-xl" /></Button>
        <Button size="sm" color="ghost" type="button" onClick={() => handleClickDelete(request.id)}><MdDelete
          size='20' className="text-error text-xl" /></Button>
      </ButtonGroup>
    </li>
  )
}