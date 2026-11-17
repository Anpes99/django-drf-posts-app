from rest_framework.pagination import CursorPagination, PageNumberPagination


class PostPagination(PageNumberPagination):
    page_size = 10                      # posts per page
    page_size_query_param = 'page_size' # optional: lets the client ask for ?page_size=20
    max_page_size = 50                  # upper limit for page_size


class CommentPagination(CursorPagination):
    # A cursor stays correct while new comments are added; page numbers would shift
    # and repeat comments. Uses the (post, created_at) index.
    page_size = 5
    ordering = '-created_at'
