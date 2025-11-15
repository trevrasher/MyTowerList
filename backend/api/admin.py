from django.contrib import admin
from .models import Tower, Area, Creator, Profile, Badge
from django.db.models import Count

@admin.register(Area)
class AreaAdmin(admin.ModelAdmin):
    list_display = ('name', 'order')
    list_editable = ('order',)
    ordering = ('order', 'name')

@admin.register(Tower)
class TowerAdmin(admin.ModelAdmin):
    list_display = ('name', 'difficulty', 'area', 'type', 'score', 'diff_category', 'display_creators')
    list_filter = ('area', 'type', 'diff_category')
    search_fields = ('name',)
    list_editable = ('type', 'score')
    ordering = ('name',)

    def display_creators(self, obj):
        return ", ".join([c.name for c in obj.creators_m2m.all()])
    display_creators.short_description = 'Creators (M2M)'

@admin.register(Creator)
class CreatorAdmin(admin.ModelAdmin):
    list_display = ('name', 'tower_count', 'display_towers')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.annotate(_tower_count=Count('towers'))

    def tower_count(self, obj):
        return obj._tower_count
    tower_count.admin_order_field = '_tower_count'
    tower_count.short_description = 'Number of Towers'

    def display_towers(self, obj):
        return ", ".join([t.name for t in obj.towers.all()])
    display_towers.short_description = 'Towers'

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'roblox_user_id', 'display_completed_towers')
    
    def display_completed_towers(self, obj):
        return ", ".join([tower.name for tower in obj.complete_towers.all()])
    display_completed_towers.short_description = 'Completed Towers'

@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    display = ('id')