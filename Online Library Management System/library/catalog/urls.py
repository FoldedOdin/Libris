from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    # Home & Dashboard
    path("", views.home, name="home"),
    path("dashboard/", views.dashboard, name="dashboard"),

    # Authentication
    path("login/", views.custom_login, name="login"),
    path("register/", views.register, name="register"),
    path("logout/", auth_views.LogoutView.as_view(next_page="home"), name="logout"),
    

    # Admin Management 
    path("dashboard/users/", views.user_management, name="user_management"),
    path("dashboard/users/delete/<int:user_id>/", views.delete_user, name="delete_user"),
    
    path("dashboard/books/", views.book_management, name="book_management"),
    path("dashboard/books/add/", views.add_book, name="add_book"),
    path("dashboard/books/edit/<int:book_id>/", views.edit_book, name="edit_book"),
    path("dashboard/books/delete/<int:book_id>/", views.delete_book, name="delete_book"),
    
    path("dashboard/donations/", views.donation_management, name="donation_management"),
    path("dashboard/donations/<int:donation_id>/", views.donation_detail, name="donation_detail"),
    path("dashboard/donations/<int:donation_id>/edit/", views.edit_donation, name="edit_donation"),
    path("dashboard/donations/approve/<int:donation_id>/", views.approve_donation, name="approve_donation"),
    path("dashboard/donations/reject/<int:donation_id>/", views.reject_donation, name="reject_donation"),
    path("dashboard/donations/delete/<int:donation_id>/", views.delete_donation, name="delete_donation"),

    # Books (Public)
    path("books/", views.book_list, name="book_list"),
    path("books/<int:pk>/", views.book_detail, name="book_detail"),
    path("books/<int:pk>/borrow/", views.borrow_book, name="borrow_book"),
    path("books/<int:pk>/return/", views.return_book, name="return_book"),
    path("my-borrowed/", views.borrowed_books, name="borrowed_books"),


    # Donations (Public)
    path("donate/", views.donate_book, name="donate_book"),
    path("donations/", views.donation_list, name="donation_list"),
    

    # Sales (Public / Admin)
    path("sell/", views.sell_book, name="sell_book"),
    path("sales/", views.sale_list, name="sale_list"),
    path("sales/edit/<int:sale_id>/", views.edit_sale, name="edit_sale"),
    path("sales/delete/<int:sale_id>/", views.delete_sale, name="delete_sale"),
    path("sales/approve/<int:sale_id>/", views.approve_sale, name="approve_sale"),
    path("sales/reject/<int:sale_id>/", views.reject_sale, name="reject_sale"),

    # Reports and Export (Admin/Dashboard)
    path("dashboard/generate-report/", views.generate_report, name="generate_report"),
    path("dashboard/generate-pdf-report/", views.generate_pdf_report, name="generate_pdf_report"),
    path("dashboard/generate-books-pdf/", views.generate_books_pdf, name="generate_books_pdf"),
    path("dashboard/export-data/", views.export_data, name="export_data"),
    path("dashboard/export-selection/", views.export_selection, name="export_selection"),
]
