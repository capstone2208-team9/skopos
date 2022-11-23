import { Button, Modal } from "react-daisyui";

interface Props {
  onDelete: () => void
  onCancel: () => void
  open: boolean
}

export default function ConfirmDeleteModal({open, onDelete, onCancel}: Props) {
  return (
    <Modal open={open}>
      <Modal.Header>
        <h2>Confirm Delete</h2>
      </Modal.Header>
      <Modal.Body className='text-center'>
        <div className='text-center'>
          <Button type='button' className='mr-4 bg-cadmium-orange' onClick={onDelete}>Delete</Button>
          <Button type='button' onClick={onCancel} className='bg-sky-blue'>Cancel</Button>
        </div>
      </Modal.Body>
    </Modal>
  )
}