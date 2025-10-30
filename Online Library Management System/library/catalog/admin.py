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
    list_display = ['title', 'author', 'category', 'total_copies', 'available_copies', 'price']
    list_filter = ['category', 'language']
    search_fields = ['title', 'author', 'isbn']
    list_editable = ['available_copies', 'price']

class TransactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'book', 'transaction_type', 'date', 'due_date', 'returned']
    list_filter = ['transaction_type', 'returned', 'date']
    search_fields = ['user__username', 'book__title']
    list_editable = ['returned']

class DonationAdmin(admin.ModelAdmin):
    list_display = ['user', 'book_title', 'author', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    list_editable = ['status']
    search_fields = ['book_title', 'author', 'user__username']

class SaleAdmin(admin.ModelAdmin):
    list_display = ['user', 'book_title', 'author', 'price', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    list_editable = ['status']
    search_fields = ['book_title', 'author', 'user__username']

# Register models
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Category)
admin.site.register(Book, BookAdmin)
admin.site.register(Transaction, TransactionAdmin)
admin.site.register(Donation, DonationAdmin)
admin.site.register(Sale, SaleAdmin)