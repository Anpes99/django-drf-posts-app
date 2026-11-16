import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
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
  const [reloadKey, setReloadKey] = useState(0) // add 1 to refetch the current page
  const userId = useSelector((state) => state.app.user?.id) // refetch on login/logout: my_vote is per user

  useEffect(() => {
    api
      .get('/posts/', {
        params: { search: searchWord || undefined, page, page_size: PAGE_SIZE },
      })
      .then((res) => {
        setPosts(res.data.results)
        setTotalPages(Math.ceil(res.data.count / PAGE_SIZE))
      })
  }, [searchWord, page, reloadKey, userId])

  const handleSearch = (word) => {
    setSearchWord(word)
    setPage(1)
  }

  const handleUpdate = (updated) => {
    setPosts((current) => current.map((p) => (p.id === updated.id ? updated : p)))
  }

  const handleDelete = () => {
    // If the last post on this page was deleted, go back one page
    if (posts.length === 1 && page > 1) setPage(page - 1)
    else setReloadKey((k) => k + 1)
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
  }

  return (
    <section>
      <h1>Home</h1>
      <SearchBar onSearch={handleSearch} />
      <div>
      {posts.map(post =><PostFeedItem key={post.id} post={post} onDelete={handleDelete} onUpdate={handleUpdate}/>)}</div>
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
    </section>
  )
}
