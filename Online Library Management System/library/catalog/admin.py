from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Category, Book, Transaction, Donation, Sale

# Simple improved version
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'is_staff']
    list_filter = ['role', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('role',)}),
    )

class BookAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'stock', 'price', 'is_available']
    list_filter = ['category', 'is_available']
    search_fields = ['title', 'author']
    list_editable = ['stock', 'price']

class TransactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'book', 'transaction_type', 'date', 'due_date']
    list_filter = ['transaction_type', 'date']

class DonationAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'author', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    list_editable = ['status']

class SaleAdmin(admin.ModelAdmin):
    list_display = ['user', 'book', 'price', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    list_editable = ['status']

# Register models
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Category)
admin.site.register(Book, BookAdmin)
admin.site.register(Transaction, TransactionAdmin)
admin.site.register(Donation, DonationAdmin)
admin.site.register(Sale, SaleAdmin)