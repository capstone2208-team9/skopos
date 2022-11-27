import {useMutation} from '@apollo/client'
import ModalPortal from "components/shared/ModalPortal";
import TextInput from 'components/shared/TextInput'
import {UpdateCollectionTitle} from 'graphql/mutations'
import {GetCollectionNames} from 'graphql/queries'
import sortCollectionsByTitle from 'lib/sortCollectionsByTitle'
import React from 'react'
import {Button, Modal} from 'react-daisyui'
import {ICollection} from 'types'
import {Formik, Form} from 'formik'
import * as Yup from 'yup'

const validationSchema = Yup.object().shape({
  title: Yup.string().trim().min(1).required('A title is required')
})

interface Props {
  collection: Pick<ICollection, 'id' | 'title'> | null
  show: boolean
  onClose: () => void
}

export default function CollectionForm({collection, show, onClose}: Props) {
  const [updateCollectionTitle] = useMutation(UpdateCollectionTitle, {
    update(cache, {data: {createOneCollection}}) {
      cache.updateQuery({
        query: GetCollectionNames,
        variables: {orderBy: [{title: 'asc'}]}
      }, (data) => {
        const collections = [...data.collections, {...createOneCollection, _count: {requests: 0}}]
        sortCollectionsByTitle(collections)
        return data
          ? {collections }
          : {collections: [{...createOneCollection, _count: {requests: 0}}]}
      })
    },

  });
  
  const handleSaveTitle = async (title: string) => {
    return await updateCollectionTitle({
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
  }

  return (
    <ModalPortal id='edit-collection-title-modal'>
      <Modal open={show}>
        <Modal.Header className='mb-2'>
          <h3>Edit title</h3>
        </Modal.Header>
        <Modal.Body>
          <Formik
            enableReinitialize
            initialValues={{
              title: collection?.title || ''
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, {resetForm}) => {
              const result = await handleSaveTitle(values.title)
              if (!result.errors) {
                resetForm()
                onClose()
              }
            }}
          >
            {({resetForm, isValid, dirty}) => (
              <Form data-testid='edit-collection-form' id='rename-collection' className='flex col-span-2'>
                <TextInput wrapperClassName='w-full' name='title' label='Title'
                       placeholder='Collection Name'
                />
                <div className='flex items-end'>
                  <Button type='submit' className='mx-2 bg-sky-blue'
                          disabled={collection ? !isValid : !isValid || !dirty}
                  >Save</Button>
                  <Button type='button' onClick={() => {
                    resetForm()
                    onClose()
                  }} className='bg-cadmium-orange'>Cancel</Button>
                </div>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>

    </ModalPortal>
  )
}
