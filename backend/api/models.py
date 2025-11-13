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
    creators_m2m = models.ManyToManyField('Creator', related_name='towers', blank=True)
    floors = models.IntegerField()
    area = models.ForeignKey(Area, on_delete=models.SET_NULL, null=True)
    score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)], db_index=True)
    type = models.CharField(
        choices=[
            ('tower', 'Tower'),
            ('mini_tower', 'Mini-Tower'),
            ('steeple', 'Steeple'),
            ('citadel', 'Citadel'),
        ],
        default='tower'
    )
    diff_category = models.CharField(
        default='easy',
        choices=[
            ('easy', 'Easy'),
            ('medium', 'Medium'),
            ('hard', 'Hard'),
            ('difficult', 'Difficult'),
            ('challenging', 'Challenging'),
            ('intense', 'Intense'),
            ('remorseless', 'Remorseless'),
            ('insane', 'Insane'),
            ('extreme', 'Extreme'),
            ('terrifying', 'Terrifying'),
            ('catastrophic', 'Catastrophic'),
        ]
    )

class Creator(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

