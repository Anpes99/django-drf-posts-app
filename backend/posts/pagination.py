from rest_framework.pagination import PageNumberPagination


class PostPagination(PageNumberPagination):
    page_size = 10                      # posts per page
    page_size_query_param = 'page_size' # optional: lets the client ask for ?page_size=20
    max_page_size = 50                  # upper limit for page_size
