"""Middleware to set current user for audit logging."""

from apps.common.audit_signals import clear_request_context, set_request_context


class AuditUserMiddleware:
    """Store the current request user in thread-local for audit signal handlers."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        forwarded = request.META.get('HTTP_X_FORWARDED_FOR', '')
        ip_address = forwarded.split(',')[0].strip() if forwarded else request.META.get('REMOTE_ADDR')
        token = set_request_context(
            user=getattr(request, 'user', None),
            ip_address=ip_address,
        )
        try:
            return self.get_response(request)
        finally:
            clear_request_context(token)
