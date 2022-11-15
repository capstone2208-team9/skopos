import { useQuery, useMutation } from "@apollo/client";
import CollectionRequestListItem from "components/CollectionRequestListItem";
import CollectionRunner from "components/CollectionRunner";
import ModalPortal from "components/ModalPortal";
import {UpdateStepNumber} from 'graphql/mutations'
import { GetCollection} from "graphql/queries";
import {updateStepNumbers} from 'lib/updateStepNumbers'
import { useCallback, useEffect, useState } from "react";
import { Button, Modal, Tooltip  } from "react-daisyui";
import { FaSpinner } from "react-icons/fa";
import { useParams, Link } from "react-router-dom";
import { ICollection, Request } from "types";
import { ReactComponent as Empty } from 'assets/undraw_not_found_re_44w9.svg'
import RequestForm from "../components/RequestForm";
import { MdHistory } from "react-icons/md";

export default function Collection() {
  const { collectionId } = useParams();
  const [selectedRequest, setSelectedRequest] = useState<Request | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  let { loading, error, data } = useQuery<{ collection: ICollection }>(GetCollection, {
    variables: {
      where: {
        id: Number(collectionId)
      },
      orderBy: [
        {
          stepNumber: "asc"
        }
      ]
    }
  });

  const [updateStepNumber] = useMutation(UpdateStepNumber, {
    update(cache, {data: {updateOneRequest}}) {
      const {collection} = cache.readQuery<{collection: ICollection}>({query: GetCollection, variables: {
          where: {
            id: Number(collectionId)
          },
          orderBy: [
            {
              stepNumber: "asc"
            }
          ]
        }
      }) || {}
      if (!collection) return
      const requests = collection.requests.map(r => r.id === updateOneRequest.id ? updateOneRequest : r)
      cache.writeQuery({
        query: GetCollection,
        data: {collection: {...collection, requests}}
      })
    },
  })

  const toggleOpen = () => setModalOpen(prev => !prev);

  const handleAddRequest = () => {
    setModalOpen(true);
  };

  const handleDeleteRequest = async (id: number) => {
    setSelectedRequest(undefined)

    if (!data) return
    const remainingRequests = data.collection.requests.filter(r => r.id !== id)
    if (remainingRequests.length > 0) {
      const reqs = updateStepNumbers(remainingRequests)
      const promises = reqs.map(r => {
        return updateStepNumber({
          variables: {
            data: {
              stepNumber: {
                set: r.stepNumber
              }
            },
            where: {
              id: r.id
            }
          }
        })
      })
      await Promise.all(promises)
    }
  }

  const handleCancel = useCallback(() => {
    setModalOpen(false);
    setSelectedRequest(undefined);
  }, []);

  const handleClickBackdrop = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    if (data && data.collection) {
      setCurrentStep(data.collection.requests.length || 1);
    }
  }, [data]);

  if (loading) return (
    <div className='grid place-items-center'>
      <FaSpinner size={48} className="animate-spin text-2xl" />
    </div>
  );
  if (error) return <p>Error {error.message}</p>;
  if (!data || !data.collection) return <></>;

  return (
    <div className="flex flex-col gap-4 items-center h-full">
      <section className='flex gap-4 items-center'>
        <h2 className="collection-title text-3xl font-medium">{data.collection.title}</h2>
        <div className="flex items-center gap-2">
          <Tooltip message='See Past Runs'>
            <Link className='btn btn-sm' to={`/collection-runs/${collectionId}`}>
              <MdHistory size='20' className='text-white'/>
            </Link>
          </Tooltip>
          <Button className="bg-cadmium-orange" size="sm" onClick={handleAddRequest}>Add Request</Button>
          <CollectionRunner />
        </div>
      </section>
      {data.collection.requests.length > 0 ? (
        <ul className="col-span-2">
          {data.collection.requests && data.collection.requests.map(request => (
            <CollectionRequestListItem key={request.id} onModalOpen={() => setModalOpen(true)} request={request} onDelete={handleDeleteRequest} onSelect={setSelectedRequest}/>
          ))}
        </ul>
      ) : (
        <Empty className='max-w-md mt-auto'/>
      )}
      <ModalPortal id="request-form-modal">
        <Modal open={modalOpen} className="max-w-4xl" onClickBackdrop={handleClickBackdrop}>
          <Modal.Header>
            <h3>
              {selectedRequest ? "Edit" : "Add"} Request
            </h3>
          </Modal.Header>
          <Modal.Body>
            <RequestForm onCancel={handleCancel} request={selectedRequest}
                         stepNumber={currentStep}
                         onComplete={toggleOpen} />
          </Modal.Body>
        </Modal>
      </ModalPortal>
    </div>
  );
}

