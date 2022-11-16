import {useMutation} from '@apollo/client'
import {CreateCollection, GetCollectionNames} from 'graphql/queries'
import {useToast} from 'hooks/ToastProvider'
import React, {useEffect, useState} from 'react'
import {Button, ButtonGroup, Form, Modal, Tooltip} from 'react-daisyui'
import {FaSpinner} from 'react-icons/fa'
import {useNavigate} from 'react-router-dom'
import {ICollection} from 'types'
import {HiOutlineFolderAdd} from 'react-icons/hi'

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
        const existingCollectionNames = cache.readQuery({query: GetCollectionNames}) as {collections: Pick<ICollection, 'id'| 'title'>[]}
        const collections = [...existingCollectionNames.collections, createOneCollection] || [createOneCollection]
        cache.writeQuery({
          query: GetCollectionNames,
          data: {collections}
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
  }

  useEffect(() => {
    if (data) {
      setTitle('')
      setOpen(false)
      addToast('Collection Created', 'success')
      navigate(`/collections/${data.createOneCollection.id}`)
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
            <Button size={buttonSize} className={`ml-auto bg-viridian-green border-none`} onClick={() => setOpen(true)}>
              <HiOutlineFolderAdd size='24'/>
            </Button>
          </Tooltip>
        ) : (
        <Button size={buttonSize} className={`ml-auto bg-sky-blue `} onClick={() => setOpen(true)}>Add Collection</Button>
      )}
      <Modal open={open} onClickBackdrop={() => setOpen(false)}>
        <Modal.Header className='text-center mb-2'>
          <h3>Add Collection</h3>
        </Modal.Header>
        <Modal.Body className='grid place-items-center'>
          <Form onSubmit={handleAddCollection}>
            <div className='flex gap-2 items-center'>
              <input className='input input-bordered input-md' name='title'
                     onChange={(e) => setTitle(e.target.value)}
                     placeholder='Collection Name'
              />
              <ButtonGroup className='gap-2'>
                <Button className='bg-sky-blue' disabled={!title} size='md' type='submit'>
                  {loading && <FaSpinner className='mx-1 animate-spin'/>}
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