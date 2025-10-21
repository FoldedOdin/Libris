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

    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    isbn = models.CharField(max_length=50, blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    stock = models.IntegerField(default=1)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)   
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Transaction(models.Model):
    TRAN_TYPE = (('borrow','borrow'),('return','return'))
    book = models.ForeignKey('Book', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE) 
    transaction_type = models.CharField(max_length=10, choices=TRAN_TYPE)
    date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True)  # only for borrow
    fine = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    
    def save(self, *args, **kwargs):
        # Assign due date if borrow
        if self.transaction_type == 'borrow' and not self.due_date:
            self.due_date = timezone.now() + timedelta(days=14)  # 2 weeks
        # Fine calculation if return and late
        if self.transaction_type == 'return' and self.due_date:
            if timezone.now() > self.due_date:
                days_late = (timezone.now() - self.due_date).days
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
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    condition = models.CharField(max_length=100, default="Good")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Donation: {self.title} by {self.user.username}"


class Sale(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('sold', 'Sold'),
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Sale: {self.book.title} by {self.user.username} ({self.status})"
