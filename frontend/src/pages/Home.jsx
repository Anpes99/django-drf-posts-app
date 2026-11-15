import { useEffect, useState } from 'react'
import api from '../api.js'
import PostFeedItem from '../components/PostFeedItem.jsx'

export default function Home() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    api
      .get('/posts')
      .then((res) => {
        
        setPosts(res.data)})
  }, [])

  return (
    <section>
      <h1>Home</h1>
      <div>
      {posts.map(post =><PostFeedItem key={post.id} post={post}/>)}</div>
    </section>
  )
}
