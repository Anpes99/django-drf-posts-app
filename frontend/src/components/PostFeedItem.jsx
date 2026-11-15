export default function PostFeedItem({ post }) {
  const date = new Date(post.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <article className="post-item">
      <h2 className="post-title">{post.title}</h2>
      <p className="post-meta">
        <span className="post-author">{post.author}</span>
        {date}
      </p>
      <p className="post-text">{post.text}</p>
    </article>
  )
}
