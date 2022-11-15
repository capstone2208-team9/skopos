import { useMutation } from "@apollo/client";
import MonitorForm from "components/MonitorForm";
import { CreateOneMonitor} from "graphql/mutations";
import {GetCollectionNames, GetMonitors } from 'graphql/queries'
import { useToast } from "hooks/ToastProvider";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ICollection, Monitor, MonitorCreateInput } from "types";

export default function CreateMonitor() {
  const { addToast } = useToast();
  const navigate = useNavigate()
  const [addMonitor, { data, error, loading }] = useMutation(CreateOneMonitor, {
    update(cache, { data: { createOneMonitor } }) {
      const monitorQuery = cache.readQuery<{ monitors: Monitor[] }>({ query: GetMonitors });
      const variables = {
        where: {
          monitorId: {
            equals: null
          }
        }
      }
      const getCollectionNames = cache.readQuery<{collections: ICollection[]}>({
        query: GetCollectionNames, variables: {
          where: {
            monitorId: {
              equals: null
            }
          }
        }
      });
      cache.writeQuery({ query: GetCollectionNames, variables, data: {
          collections: getCollectionNames?.collections.filter(collection => !createOneMonitor.collections.includes(collection.id))
        } })
      if (!monitorQuery) return;
      cache.writeQuery({
        query: GetMonitors,
        data: { monitors: [...monitorQuery.monitors, createOneMonitor] }
      });
    }
  });

  const handleSave = async ({contactInfo, value, units, collections}: MonitorCreateInput) => {
    const variables: any = {
      data: {
        schedule: `${value} ${+value > 1 ? units : units.slice(0, -1)}`,
        contactInfo,
        collections: {
          connect: collections.map(id => ({id}))
        }
      }
    };
    await addMonitor({ variables });
  };

  useEffect(() => {
    if (data) {
      addToast('Monitor created', 'success')
      navigate(-1)
    }
    if (error) {
      addToast('Error creating monitor', 'error')
      console.log(error.message)
    }
  }, [data, error, addToast])


  return (
    <div className='grid place-items-center'>
      <MonitorForm loading={loading} onSave={handleSave} />
    </div>
  )
}