from django.urls import path
from . import api_views

urlpatterns = [
    # API Root
    path('', api_views.api_root, name='api-root'),
    path('csrf/', api_views.get_csrf_token, name='api-csrf-token'),
    
    # Authentication
    path('register/', api_views.RegisterView.as_view(), name='api-register'),
    path('login/', api_views.LoginView.as_view(), name='api-login'),
    path('logout/', api_views.LogoutView.as_view(), name='api-logout'),
    path('user/', api_views.CurrentUserView.as_view(), name='api-current-user'),
    
    # Books
    path('books/', api_views.BookListCreateView.as_view(), name='api-books'),
    path('books/<int:pk>/', api_views.BookDetailView.as_view(), name='api-book-detail'),
    path('books/available/', api_views.AvailableBooksView.as_view(), name='api-available-books'),
    
    # Categories
    path('categories/', api_views.CategoryListView.as_view(), name='api-categories'),
    
    # Donations
    path('donations/', api_views.DonationListCreateView.as_view(), name='api-donations'),
    path('donations/<int:pk>/', api_views.DonationDetailView.as_view(), name='api-donation-detail'),
    path('donations/<int:pk>/approve/', api_views.approve_donation, name='api-approve-donation'),
    path('donations/<int:pk>/reject/', api_views.reject_donation, name='api-reject-donation'),
    path('my-donations/', api_views.MyDonationsView.as_view(), name='api-my-donations'),
    
    # Sales
    path('sales/', api_views.SaleListCreateView.as_view(), name='api-sales'),
    path('sales/<int:pk>/', api_views.SaleDetailView.as_view(), name='api-sale-detail'),
    path('sales/<int:pk>/approve/', api_views.approve_sale, name='api-approve-sale'),
    path('sales/<int:pk>/reject/', api_views.reject_sale, name='api-reject-sale'),
    path('my-sales/', api_views.MySalesView.as_view(), name='api-my-sales'),
    
    # Transactions (Borrowed Books)
    path('transactions/', api_views.TransactionListView.as_view(), name='api-transactions'),
    path('my-borrowed-books/', api_views.MyBorrowedBooksView.as_view(), name='api-my-borrowed-books'),
    path('borrowed-books/', api_views.BorrowedBooksView.as_view(), name='api-borrowed-books'),
    path('books/<int:book_id>/borrow/', api_views.borrow_book, name='api-borrow-book'),
    path('transactions/<int:transaction_id>/return/', api_views.return_book, name='api-return-book'),
    
    # User Management (Admin)
    path('users/', api_views.UserListView.as_view(), name='api-users'),
    path('users/<int:pk>/', api_views.UserDetailView.as_view(), name='api-user-detail'),
    
    # Dashboard
    path('dashboard/stats/', api_views.dashboard_stats, name='api-dashboard-stats'),
]