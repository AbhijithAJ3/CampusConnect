from django.contrib import admin
from .models import College, StudentRegistry, User, Category, Listing

admin.site.register(College)
admin.site.register(StudentRegistry)
admin.site.register(User)
admin.site.register(Category)
admin.site.register(Listing)