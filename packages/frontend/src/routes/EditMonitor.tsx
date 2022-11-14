import { useMutation, useQuery } from "@apollo/client";
import Loader from "components/Loader";
import MonitorForm from "components/MonitorForm";
import {
  GetEditMonitor,
} from "graphql/queries";
import {
  UpdateOneMonitor
} from "graphql/mutations";
import { useToast } from "hooks/ToastProvider";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MonitorUpdateInput } from "types";

export default function EditMonitor() {
  const {id} = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast();
  const {data, loading, error} = useQuery(GetEditMonitor, {
    variables: {where: { id: Number(id)}}
  })
  const [updateMonitor, { data: updateData, loading: updating, error: updateError}] = useMutation(UpdateOneMonitor);

  useEffect(() => {
    if (updateData) {
      addToast('Monitor updated', 'success')
      navigate(-1)
    }
    if (updateError || error) {
      const message = updateError ? 'Error creating monitor' : 'Oops! Something went wrong'
      addToast(message, 'error')
    }
  }, [addToast, data, error, navigate])

  const handleUpdate = async ({units, value, contactInfo, id}: MonitorUpdateInput) => {
    let unit = units;
    if (units.endsWith("s") && value === "1") {
      unit = unit.slice(0, -1);
    }
    const variables = {
      data: {
        schedule: {
          set: `${value} ${unit}`
        },
        contactInfo: {
          set: contactInfo
        }
      },
      where: {
        id
      }
    };
    await updateMonitor(
      { variables }
    );
  };


  if (loading) return <Loader/>
  if (!data) return <></>

  return (
    <div className='grid place-items-center'>
      <MonitorForm monitor={data.monitor} loading={updating} onUpdate={handleUpdate} />
    </div>
  )
}