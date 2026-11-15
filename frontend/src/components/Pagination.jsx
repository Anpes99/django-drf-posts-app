// Page numbers to show, e.g. [1, '…', 4, 5, 6, '…', 12]
function getPages(curPage, totalPages) {
  const pages = []
  for (let n = 1; n <= totalPages; n++) {
    // always show first, last, and the pages next to the current one
    if (n === 1 || n === totalPages || Math.abs(n - curPage) <= 1) {
      pages.push(n)
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…')
    }
  }
  return pages
}

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="page-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ‹ Prev
      </button>

      {getPages(currentPage, totalPages).map((n, i) =>
        n === '…' ? (
          <span key={`gap-${i}`} className="page-gap">
            …
          </span>
        ) : (
          <button
            key={n}
            type="button"
            className={`page-btn ${n === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange(n)}
            aria-current={n === currentPage ? 'page' : undefined}
          >
            {n}
          </button>
        ),
      )}

      <button
        type="button"
        className="page-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next ›
      </button>
    </nav>
  )
}
