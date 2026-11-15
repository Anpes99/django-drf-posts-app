export default function SearchBar({onSearch}) {
  const handleSubmit = (e) => {
    e.preventDefault()
    const searchWord = new FormData(e.currentTarget).get('q').trim()

    onSearch(searchWord)
  }

  // The input's × button clears the field without submitting, so reset the search here
  const handleChange = (e) => {
    if (e.target.value === '') onSearch('')
  }

  return (
    <form className="search-bar" role="search" onSubmit={handleSubmit}>
      <svg className="search-icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        name="q"
        placeholder="Search posts…"
        aria-label="Search posts"
        onChange={handleChange}
      />
    </form>
  )
}
