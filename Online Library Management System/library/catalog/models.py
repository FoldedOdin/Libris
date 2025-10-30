from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from datetime import timedelta
from django.utils import timezone
# Create your models here.

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('user', 'User'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')

    def is_admin(self):
        return self.role == 'admin'

    def is_user(self):
        return self.role == 'user'
    
    def __str__(self):
        return f"{self.username} ({self.role})"


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Book(models.Model):
    CATEGORY_CHOICES = [
        ('Science', 'Science'),
        ('Fiction', 'Fiction'),
        ('Mathematics', 'Mathematics'),
        ('History', 'History'),
        ('DataScience','DataScience'),
    ]
    
    LANGUAGE_CHOICES = [
        ('English', 'English'),
        ('Spanish', 'Spanish'),
        ('French', 'French'),
        ('German', 'German'),
        ('Other', 'Other'),
    ]

    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    isbn = models.CharField(max_length=50, blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True, null=True)
    publication_date = models.DateField(null=True, blank=True)
    pages = models.IntegerField(null=True, blank=True)
    language = models.CharField(max_length=50, choices=LANGUAGE_CHOICES, default='English')
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total_copies = models.IntegerField(default=1)
    available_copies = models.IntegerField(default=1)
    image = models.ImageField(upload_to='book_covers/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)   
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def is_available(self):
        return self.available_copies > 0

    def __str__(self):
        return self.title

class Transaction(models.Model):
    TRAN_TYPE = (('borrow','borrow'),('return','return'))
    book = models.ForeignKey('Book', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE) 
    transaction_type = models.CharField(max_length=10, choices=TRAN_TYPE)
    date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateField(null=True, blank=True)
    returned = models.BooleanField(default=False)
    return_date = models.DateField(null=True, blank=True)
    fine = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    
    def save(self, *args, **kwargs):
        # Assign due date if borrow
        if self.transaction_type == 'borrow' and not self.due_date:
            self.due_date = (timezone.now() + timedelta(days=14)).date()
        # Fine calculation if return and late
        if self.returned and self.return_date and self.due_date:
            # Ensure both are date objects for comparison
            due_date = self.due_date.date() if hasattr(self.due_date, 'date') else self.due_date
            return_date = self.return_date.date() if hasattr(self.return_date, 'date') else self.return_date
            
            if return_date > due_date:
                days_late = (return_date - due_date).days
                self.fine = days_late * 5  # Rs.5 per day late
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.transaction_type} - {self.book.title}"
    
class Donation(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    book_title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    condition = models.CharField(max_length=100, default="Good")
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Donation: {self.book_title} by {self.user.username}"


class Sale(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('sold', 'Sold'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    book_title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    condition = models.CharField(max_length=100, default="Good")
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Sale: {self.book_title} by {self.user.username} ({self.status})"
