import { useState } from 'react'
import { useSelector } from 'react-redux'
import api, { getErrorMessage } from '../api.js'

export default function PostFeedItem({ post, onDelete }) {
  const user = useSelector((state) => state.app.user)
  const [deleting, setDeleting] = useState(false)

  const isOwner = user?.username === post.author

  const date = new Date(post.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${post.title}"?`)) return

    setDeleting(true)
    try {
      await api.delete(`/posts/${post.id}/`)
      onDelete?.(post.id)
    } catch (err) {
      window.alert(getErrorMessage(err))
      setDeleting(false)
    }
  }

  return (
    <article className="post-item">
      <div className="post-header">
        <h2 className="post-title">{post.title}</h2>
        {isOwner && (
          <button
            type="button"
            className="post-delete"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        )}
      </div>
      <p className="post-meta">
        <span className="post-author">{post.author}</span>
        {date}
      </p>
      <p className="post-text">{post.text}</p>
    </article>
  )
}
