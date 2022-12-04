import {useMutation} from '@apollo/client'
import Loader from 'components/shared/Loader'
import {CreateCollection} from 'graphql/mutations'
import {GetCollectionNames, GetCollectionsWithoutMonitors} from 'graphql/queries'
import {useToast} from 'hooks/ToastProvider'
import sortCollectionsByTitle from 'lib/sortCollectionsByTitle'
import React, {useEffect, useState} from 'react'
import {Button, ButtonGroup, Form, Input, Modal, Tooltip} from 'react-daisyui'
import {useNavigate} from 'react-router-dom'
import {HiOutlineFolderAdd} from 'react-icons/hi'
import {whereMonitorNullVariables} from 'routes/CreateMonitor'

interface Props {
  buttonSize?: 'xs' | 'sm' | 'md' | 'lg'
  compact?: boolean
  className?: string
}

export default function AddCollection({buttonSize = 'md', compact = false, className = 'ml-auto'}: Props) {
  const { addToast } = useToast()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const navigate = useNavigate()
  const [createCollection, { data, error, loading}] =
    useMutation(CreateCollection, {
      update(cache, {data: {createOneCollection}}) {
        cache.updateQuery({
          query: GetCollectionNames,
          variables: {orderBy: [{title: 'asc'}]}
        }, (data) => {
          if (!data) return
          const collections = sortCollectionsByTitle([...data.collections, {...createOneCollection, _count: {requests: 0}}])
          return {collections}
        })

        cache.updateQuery({
          query: GetCollectionsWithoutMonitors, variables: whereMonitorNullVariables,
        }, (data) => {
          if (!data) return
          const {collections = []} = data
          return {collections: [...collections, createOneCollection]}
        })
      },



    });

  const handleAddCollection: React.FormEventHandler = async (e) => {
    e.preventDefault()
    await createCollection({
      variables: {
        data: {
          title
        }
      }
    })
    setTitle('')
  }

  useEffect(() => {
    if (data) {
      setTitle('')
      setOpen(false)
      addToast('Collection Created', 'success')
      navigate(`/collections/${data.createOneCollection.id}/requests`)
    }
  }, [data])

  useEffect(() => {
    if (error) {
      addToast(error.message, 'error')
    }
  }, [error])


  return (
    <>
      {compact ? (
          <Tooltip className={className} message='Add a collection'>
            <Button size={buttonSize} className={`ml-auto bg-transparent hover:bg-transparent text-sky-blue hover:text-cadmium-orange hover:scale-105 transition-transform border-none`} onClick={() => setOpen(true)}>
              <HiOutlineFolderAdd size='36' className='text-inherit'/>
            </Button>
          </Tooltip>
        ) : (
        <Button size={buttonSize} className={`ml-auto bg-sky-blue hover:bg-cadmium-orange`} onClick={() => setOpen(true)}>Add Collection</Button>
      )}
      <Modal open={open} onClickBackdrop={() => {
        setOpen(false)
        setTitle('')
      }}>
        <Modal.Header className='text-center mb-2'>
          <h3>Add Collection</h3>
        </Modal.Header>
        <Modal.Body className='grid place-items-center'>
          <Form onSubmit={handleAddCollection}>
            <div className='flex gap-2 items-center'>
              <Input name='title'
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                     placeholder='Collection Name'
              />
              <ButtonGroup className='gap-2'>
                <Button className='bg-sky-blue' disabled={!title} size='md' type='submit'>
                  {loading && <Loader/>}
                  Save
                </Button>
                <Button className='bg-cadmium-orange' type='button' size='md'
                        onClick={() => {
                          setTitle('')
                          setOpen(false)
                        }}
                >Cancel</Button>
              </ButtonGroup>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  )
}