import { useEffect, useState } from 'react'
import api from '../api.js'
import PostFeedItem from '../components/PostFeedItem.jsx'
import SearchBar from '../components/SearchBar.jsx'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [searchWord, setSearchWord] = useState("")

  useEffect(() => {
    api
      .get('/posts', {params: searchWord ?{search:searchWord} :{}})
      .then((res) => {
        
        setPosts(res.data)})
  }, [searchWord])

  return (
    <section>
      <h1>Home</h1>
      <SearchBar onSearch={setSearchWord} />
      <div>
      {posts.map(post =><PostFeedItem key={post.id} post={post}/>)}</div>
    </section>
  )
}
