from django.contrib import admin
from .models import Tower, Area

@admin.register(Area)
class AreaAdmin(admin.ModelAdmin):
    list_display = ('name', 'order')
    list_editable = ('order',)
    ordering = ('order', 'name')

@admin.register(Tower)
class TowerAdmin(admin.ModelAdmin):
    list_display = ('name', 'difficulty', 'floors', 'area', 'type', 'score', 'creators')
    list_filter = ('area', 'type', 'difficulty')
    search_fields = ('name', 'creators')
    list_editable = ('type', 'score')
    ordering = ('name',)
