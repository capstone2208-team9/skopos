import { useQuery } from '@apollo/client';
import {GetMonitors} from 'graphql/queries'
import {useMemo} from 'react'
import {Monitor} from 'types'
import Component from 'components/monitors/AddMonitor'
import { Tooltip } from 'react-daisyui';

export function useAddMonitor() {
  const { data, error, loading } = useQuery<{ monitors: Monitor[] }>(GetMonitors, {
    variables: {
      where: {
        monitorId: {
          not: null
        }
      }
    }
  });

  const AddMonitor = useMemo(() => {
    const canAdd =  data?.monitors.flatMap(m => m.collections).some(col => !col.monitorId)
    let cName = 'ml-auto mb-4 btn bg-sky-blue'
    if (!canAdd) {
      cName += ' pointer-events-none opacity-50'
    }
    return canAdd ? (
      <Component className={cName}/>
    ) : (
      <Tooltip className='ml-auto' message='All collections currently have monitors'>
        <Component className={cName}/>
      </Tooltip>
    )
  }, [data])


  return {monitors: data?.monitors || [], error, loading, buttonComponent: AddMonitor}
}