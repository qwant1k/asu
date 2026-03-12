"""Пагинация для API проекта ИС «АСУ»."""

from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
    """Стандартная пагинация для всех API-эндпоинтов."""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
