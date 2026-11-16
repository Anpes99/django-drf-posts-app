from rest_framework import status
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.views import exception_handler


class InvalidCredentials(APIException):
    # Not AuthenticationFailed: DRF turns that into a 403 with session auth.
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = 'Invalid credentials'


def custom_exception_handler(exc, context):
    """Shape every API error as {"error": {"message": "...", "fields"?: {...}}}."""
    response = exception_handler(exc, context)
    if response is None:  # unexpected server error: let Django handle it
        return None

    if isinstance(exc, ValidationError):
        fields = response.data if isinstance(response.data, dict) else {'non_field_errors': response.data}
        message = '\n'.join(
            msg if name == 'non_field_errors' else f'{name.capitalize()}: {msg}'
            for name, msgs in fields.items()
            for msg in msgs
        )
        response.data = {'error': {'message': message, 'fields': fields}}
    else:
        response.data = {'error': {'message': response.data['detail']}}
    return response
