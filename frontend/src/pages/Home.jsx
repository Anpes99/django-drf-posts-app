import { useEffect, useState } from 'react'
import api from '../api.js'
import Pagination from '../components/Pagination.jsx'
import PostFeedItem from '../components/PostFeedItem.jsx'
import SearchBar from '../components/SearchBar.jsx'

const PAGE_SIZE = 5

export default function Home() {
  const [posts, setPosts] = useState([])
  const [searchWord, setSearchWord] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    api
      .get('/posts/', {
        params: { search: searchWord || undefined, page, page_size: PAGE_SIZE },
      })
      .then((res) => {
        setPosts(res.data.results)
        setTotalPages(Math.ceil(res.data.count / PAGE_SIZE))
      })
  }, [searchWord, page])

  const handleSearch = (word) => {
    setSearchWord(word)
    setPage(1)
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
  }

  return (
    <section>
      <h1>Home</h1>
      <SearchBar onSearch={handleSearch} />
      <div>
      {posts.map(post =><PostFeedItem key={post.id} post={post}/>)}</div>
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
    </section>
  )
}
