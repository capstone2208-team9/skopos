import {useMutation} from '@apollo/client'
import ModalPortal from "components/ModalPortal";
import {UpdateCollectionTitle} from 'graphql/mutations'
import React, {useEffect, useState} from 'react'
import {Button, Form, Input, Modal} from 'react-daisyui'
import {ICollection} from 'types'

interface Props {
  collection: Pick<ICollection, 'id' | 'title'> | null
  show: boolean
  onClose: () => void
}

export default function CollectionForm({collection, show, onClose}: Props) {
  const [title, setTitle] = useState(collection?.title || '')
  const [updateCollectionTitle] = useMutation(UpdateCollectionTitle);
  
  const handleClose = () => {
    console.log('handleClose')
    onClose()
    setTitle('')
  }

  const handleSaveTitle: React.FormEventHandler = async (e) => {
    e.preventDefault()
    await updateCollectionTitle({
      variables: {
        data: {
          title: {
            set: title,
          },
        },
        where: {
          id: Number(collection?.id),
        },
      },
    })
    handleClose()
  }

  useEffect(() => {
    if (collection) {
      setTitle(collection.title)
    }
  }, [collection])

  return (
    <ModalPortal id='edit-collection-title-modal'>
      <Modal open={show}>
        <Modal.Header className='mb-2'>
          <h3>Edit title</h3>
        </Modal.Header>
        <Modal.Body>
          <Form id='rename-collection' className='flex col-span-2' onSubmit={handleSaveTitle}>
            <Input name='title' id='title' value={title}
                   onChange={(e) => setTitle(e.target.value)}
                   placeholder='Collection Name'
            />
            <div className='flex items-center gap-2'>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Actions>
          <Button type='submit' form='rename-collection' className='mx-2' color='primary'>Save</Button>
          <Button type='button' color='secondary' onClick={handleClose}>Cancel</Button>
        </Modal.Actions>
      </Modal>

    </ModalPortal>
  )
}
