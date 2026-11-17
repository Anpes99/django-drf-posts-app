import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import api, { getErrorMessage } from '../api.js'

const getCursorFromUrl = (url) => (url ? new URL(url).searchParams.get('cursor') : null)

const formatDate = (iso) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

// Use with key={postId}: a new post id remounts this component, resetting its state.
export default function Comments({ postId }) {
  const user = useSelector((state) => state.app.user)
  const [comments, setComments] = useState([])
  const [nextCursor, setNextCursor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const loadPage = (cursor) =>
    api
      .get(`/posts/${postId}/comments/`, { params: { cursor: cursor ?? undefined } })
      .then((res) => {
        // first page replaces, "load more" appends
        setComments((current) => (cursor ? [...current, ...res.data.results] : res.data.results))
        setNextCursor(getCursorFromUrl(res.data.next))
        setLoadError('')
      })
      .catch((err) => setLoadError(getErrorMessage(err)))
      .finally(() => setLoading(false))

  useEffect(() => {
    loadPage(null)
  }, [])

  const handleLoadMore = () => {
    setLoading(true)
    loadPage(nextCursor)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const text = new FormData(form).get('text').trim()
    if (!text) return

    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await api.post(`/posts/${postId}/comments/`, { text })
      setComments((current) => [res.data, ...current])
      form.reset()
    } catch (err) {
      setSubmitError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="comments" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="comments-heading">
        Comments
      </h2>

      {user ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          {submitError && (
            <p className="form-error" role="alert">
              {submitError}
            </p>
          )}
          <label htmlFor="comment-text" className="visually-hidden">
            Add a comment
          </label>
          <textarea
            id="comment-text"
            name="text"
            rows={3}
            maxLength={2000}
            placeholder="Add a comment…"
            required
          />
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Posting…' : 'Comment'}
          </button>
        </form>
      ) : (
        <p className="comments-note">Log in to comment.</p>
      )}

      {loadError && (
        <p className="form-error" role="alert">
          {loadError}
        </p>
      )}

      {!loading && !loadError && comments.length === 0 && (
        <p className="comments-note">No comments yet.</p>
      )}

      <ul className="comment-list">
        {comments.map((c) => (
          <li key={c.id} className="comment">
            <p className="comment-meta">
              <span className="post-author">{c.author}</span>
              {formatDate(c.created_at)}
            </p>
            <p className="comment-text">{c.text}</p>
          </li>
        ))}
      </ul>

      {loading && <p className="comments-note">Loading comments…</p>}

      {!loading && nextCursor && (
        <button type="button" className="btn btn-outline" onClick={handleLoadMore}>
          Load more comments
        </button>
      )}
    </section>
  )
}
