import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router'
import api, { getErrorMessage } from '../api.js'
import Comments from '../components/Comments.jsx'
import PostFeedItem from '../components/PostFeedItem.jsx'

export default function PostPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const userId = useSelector((state) => state.app.user?.id)

  // page is "loading" whenever the current id/user doesn't have a result yet.
  const key = `${id}:${userId}`
  const [result, setResult] = useState({ key: null, status: null, post: null, error: '' })
  const status = result.key === key ? result.status : 'loading' // 'loading' | 'ready' | 'not-found' | 'error'

  useEffect(() => {
    let ignore = false // drop the response if id/user changes or the page unmounts first

    api
      .get(`/posts/${id}/`)
      .then((res) => {
        if (!ignore) setResult({ key, status: 'ready', post: res.data, error: '' })
      })
      .catch((err) => {
        if (ignore) return
        if (err.response?.status === 404) {
          setResult({ key, status: 'not-found', post: null, error: '' })
        } else {
          setResult({ key, status: 'error', post: null, error: getErrorMessage(err) })
        }
      })

    return () => {
      ignore = true
    }
  }, [id, key])

  const handleUpdate = (updated) => setResult((r) => ({ ...r, post: updated }))

  return (
    <section className="post-page">
      <Link to="/" className="back-link">
        ← Back to posts
      </Link>

      {status === 'loading' && <p className="page-status">Loading…</p>}

      {status === 'not-found' && (
        <div className="page-status">
          <h1>Post not found</h1>
          <p>It may have been deleted, or the link is wrong.</p>
        </div>
      )}

      {status === 'error' && (
        <p className="form-error page-status" role="alert">
          {result.error}
        </p>
      )}

      {status === 'ready' && (
        <>
          <PostFeedItem
            post={result.post}
            linkTitle={false}
            onUpdate={handleUpdate}
            onDelete={() => navigate('/')}
          />
          {/* key={id}: a new post id remounts Comments, so its state (comments, cursor) resets */}
          <Comments key={id} postId={id} />
        </>
      )}
    </section>
  )
}
