# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import colorfield.fields


class Migration(migrations.Migration):

    dependencies = [
        ('players', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='avatar',
            name='body_fill',
            field=colorfield.fields.ColorField(default=b'#111111', max_length=10),
        ),
        migrations.AddField(
            model_name='avatar',
            name='body_stroke',
            field=colorfield.fields.ColorField(default=b'#0ff000', max_length=10),
        ),
        migrations.AddField(
            model_name='avatar',
            name='eye_fill',
            field=colorfield.fields.ColorField(default=b'#eff000', max_length=10),
        ),
        migrations.AddField(
            model_name='avatar',
            name='eye_stroke',
            field=colorfield.fields.ColorField(default=b'#aff000', max_length=10),
        ),
    ]
