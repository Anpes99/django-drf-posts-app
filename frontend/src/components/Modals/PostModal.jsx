import Modal from './Modal.jsx'

export default function PostModal({ open, onClose }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: send the post to the backend
  }

  return (
    <Modal open={open} onClose={onClose} title="New post">
      <form className="modal-form" onSubmit={handleSubmit}>
        <label>
          Title
          <input type="text" name="title" required />
        </label>
        <label>
          Text
          <textarea name="text" rows={6} required />
        </label>
        <button type="submit" className="btn btn-primary">
          Publish
        </button>
      </form>
    </Modal>
  )
}
