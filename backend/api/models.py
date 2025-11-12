from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.core.validators import MaxValueValidator, MinValueValidator

class Area(models.Model):
    name = models.CharField(max_length=100, unique=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return self.name

class Tower(models.Model):
    name=models.CharField(max_length=200)
    difficulty = models.FloatField()
    creators = ArrayField(models.CharField(max_length=100), default=list)
    floors = models.IntegerField()
    area = models.ForeignKey(Area, on_delete=models.SET_NULL, null=True)
    score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    type = models.CharField(
        max_length=50,
        choices=[
            ('tower', 'Tower'),
            ('mini_tower', 'Mini-Tower'),
            ('steeple', 'Steeple'),
            ('citadel', 'Citadel'),
        ],
        default='tower'
    )


