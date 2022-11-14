import { Button, Modal } from "react-daisyui";

interface Props {
  message?: string
  onDelete: () => void
  onCancel: () => void
  open: boolean
}

export default function ConfirmDeleteModal({message = 'Are you sure', open, onDelete, onCancel}: Props) {
  return (
    <Modal open={open}>
      <Modal.Header>
        <h2>Confirm Delete</h2>
      </Modal.Header>
      <Modal.Body className='text-center'>
        <p className='text-error font-medium my-4'>{message}</p>
        <div className='text-center'>
          <Button className='mr-4 bg-cadmium-orange' onClick={onDelete}>Delete</Button>
          <Button onClick={onCancel} className='bg-sky-blue'>Cancel</Button>
        </div>
      </Modal.Body>
    </Modal>
  )
}