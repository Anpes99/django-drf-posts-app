import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router'
import api, { getErrorMessage } from '../api.js'

export default function PostFeedItem({ post, onDelete, onUpdate, linkTitle = true }) {
  const user = useSelector((state) => state.app.user)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [voting, setVoting] = useState(false)

  const isOwner = user?.username === post.author
  const myVote = post.my_vote ?? 0
  const score = (post.upvotes ?? 0) - (post.downvotes ?? 0)

  // Clicking the active arrow again removes the vote (value 0).
  const handleVote = async (value) => {
    setVoting(true)
    try {
      const res = await api.put(`/posts/${post.id}/vote/`, {
        value: myVote === value ? 0 : value,
      })
      onUpdate?.(res.data) // the post with new counts
    } catch (err) {
      window.alert(getErrorMessage(err))
    } finally {
      setVoting(false)
    }
  }

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

  const handleCancel = () => {
    setEditing(false)
    setError('')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const text = new FormData(e.currentTarget).get('text')

    if (text === post.text) return handleCancel() // nothing changed

    setSaving(true)
    setError('')
    try {
      const res = await api.patch(`/posts/${post.id}/`, { text })
      onUpdate?.(res.data) // the updated post
      setEditing(false)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <article className="post-item">
        <form className="post-edit-form" onSubmit={handleSave}>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <h2 className="post-title">{post.title}</h2>
          <textarea name="text" defaultValue={post.text} rows={5} maxLength={10000} required />
          <div className="post-actions">
            <button type="button" className="btn btn-outline" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </article>
    )
  }

  return (
    <article className="post-item">
      <div className="post-header">
        <h2 className="post-title">
          {linkTitle ? <Link to={`/posts/${post.id}`}>{post.title}</Link> : post.title}
        </h2>
        {isOwner && (
          <div className="post-actions">
            <button type="button" className="post-edit" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button
              type="button"
              className="post-delete"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        )}
      </div>
      <p className="post-meta">
        <span className="post-author">{post.author}</span>
        {date}
      </p>
      <p className="post-text">{post.text}</p>
      <div className="post-votes">
        <button
          type="button"
          className={`vote-btn vote-up${myVote === 1 ? ' active' : ''}`}
          aria-label="Upvote"
          aria-pressed={myVote === 1}
          title={user ? 'Upvote' : 'Log in to vote'}
          onClick={() => handleVote(1)}
          disabled={!user || voting}
        >
          ▲
        </button>
        <span className="vote-score" aria-label="Score">
          {score}
        </span>
        <button
          type="button"
          className={`vote-btn vote-down${myVote === -1 ? ' active' : ''}`}
          aria-label="Downvote"
          aria-pressed={myVote === -1}
          title={user ? 'Downvote' : 'Log in to vote'}
          onClick={() => handleVote(-1)}
          disabled={!user || voting}
        >
          ▼
        </button>
      </div>
    </article>
  )
}
