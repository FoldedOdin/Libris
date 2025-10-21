from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate, logout
from django.contrib import messages
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.db.models import Count, Sum
import csv
from datetime import datetime, timedelta
from .models import Book, Transaction, Donation, Sale, CustomUser, Category
from .forms import CustomUserCreationForm, CustomAuthenticationForm, DonationForm, SaleForm, BookForm,HybridDonationForm
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from io import BytesIO

# Home page view
def home(request):
    # Get data for the homepage
    total_books = Book.objects.count()
    total_users = CustomUser.objects.count()
    total_donations = Donation.objects.count()
    
    # Calculate books borrowed this month
    start_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    books_borrowed_month = Transaction.objects.filter(
        transaction_type='borrow', 
        date__gte=start_of_month
    ).count()
    
    # Calculate books borrowed today
    today = datetime.now().date()
    books_borrowed_today = Transaction.objects.filter(
        transaction_type='borrow', 
        date__date=today
    ).count()
    
    # Get recent books (last 8 added)
    recent_books = Book.objects.all().order_by('-id')[:8]
    
    # Estimate active users (users who have borrowed books in the last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    active_users_count = CustomUser.objects.filter(
        transaction__transaction_type='borrow',
        transaction__date__gte=thirty_days_ago
    ).distinct().count()
    
    # New arrivals this week
    week_ago = datetime.now() - timedelta(days=7)
    new_arrivals = Book.objects.filter(created_at__gte=week_ago).count()
    
    context = {
        'total_books': total_books,
        'total_users': total_users,
        'total_donations': total_donations,
        'books_borrowed_month': books_borrowed_month,
        'books_borrowed_today': books_borrowed_today,
        'recent_books': recent_books,
        'active_users_count': active_users_count,
        'new_arrivals': new_arrivals,
    }
    
    return render(request, 'catalog/home.html', context)

@login_required
def dashboard(request):
    # Get recent transactions for admin
    recent_transactions = Transaction.objects.all().order_by('-date')[:5]

    # Get counts for admin dashboard
    if request.user.is_superuser or (hasattr(request.user, 'role') and request.user.role == 'admin'):
        # Admin dashboard data
        books_count = Book.objects.count()
        users_count = CustomUser.objects.count()
        transactions_count = Transaction.objects.count()
        donations_count = Donation.objects.count()
        pending_donations = Donation.objects.filter(status='pending').count()
        pending_sales = Sale.objects.filter(status='pending').count()
        
        # Additional stats for admin
        overdue_books = Transaction.objects.filter(
            transaction_type='borrow',
            due_date__lt=datetime.now().date(),
            # returned=False
        ).count()
        
        low_stock_books = Book.objects.filter(stock__lt=5).count()
        
        context = {
            'books_count': books_count,
            'users_count': users_count,
            'transactions_count': transactions_count,
            'donations_count': donations_count,
            'pending_donations': pending_donations,
            'pending_sales': pending_sales,
            'recent_transactions': recent_transactions,
            'overdue_books': overdue_books,
            'low_stock_books': low_stock_books,
        }
        return render(request, "catalog/admin_dashboard.html", context)
    else:
        # User dashboard data
        user_borrowed_books = Transaction.objects.filter(user=request.user, transaction_type='borrow')
        user_donations = Donation.objects.filter(user=request.user).count()
        user_sales = Sale.objects.filter(user=request.user).count()
        
        context = {
            'borrowed_books': user_borrowed_books,
            'user_donations': user_donations,
            'user_sales': user_sales,
        }
        return render(request, "catalog/user_dashboard.html", context)

# User Management Views
@login_required
def user_management(request):
    if not request.user.is_superuser and not (hasattr(request.user, 'role') and request.user.role == 'admin'):
        messages.error(request, "You don't have permission to access this page.")
        return redirect('dashboard')
    
    users = CustomUser.objects.all().order_by('-date_joined')
    return render(request, 'catalog/user_management.html', {'users': users})

@login_required
def delete_user(request, user_id):
    if not request.user.is_superuser and not (hasattr(request.user, 'role') and request.user.role == 'admin'):
        messages.error(request, "You don't have permission to delete users.")
        return redirect('dashboard')
    
    user = get_object_or_404(CustomUser, id=user_id)
    if request.method == 'POST':
        username = user.username
        user.delete()
        messages.success(request, f"User '{username}' has been deleted successfully.")
        return redirect('user_management')
    
    return render(request, 'catalog/confirm_delete.html', {
        'object': user,
        'object_type': 'user'
    })

# Book Management Views
@login_required
def book_management(request):
    if not request.user.is_superuser and not (hasattr(request.user, 'role') and request.user.role == 'admin'):
        messages.error(request, "You don't have permission to access this page.")
        return redirect('dashboard')
    
    books = Book.objects.all().order_by('-created_at')
    return render(request, 'catalog/book_management.html', {'books': books})

@login_required
def add_book(request):
    if not request.user.is_superuser and not (hasattr(request.user, 'role') and request.user.role == 'admin'):
        messages.error(request, "You don't have permission to add books.")
        return redirect('dashboard')
    
    if request.method == 'POST':
        form = BookForm(request.POST,request.FILES)
        if form.is_valid():
            book = form.save()
            messages.success(request, f"Book '{book.title}' has been added successfully.")
            return redirect('book_management')
    else:
        form = BookForm()
    
    return render(request, 'catalog/add_book.html', {'form': form})

@login_required
def edit_book(request, book_id):
    if not request.user.is_superuser and not (hasattr(request.user, 'role') and request.user.role == 'admin'):
        messages.error(request, "You don't have permission to edit books.")
        return redirect('dashboard')
    
    book = get_object_or_404(Book, id=book_id)
    if request.method == 'POST':
        form = BookForm(request.POST, instance=book)
        if form.is_valid():
            form.save()
            messages.success(request, f"Book '{book.title}' has been updated successfully.")
            return redirect('book_management')
    else:
        form = BookForm(instance=book)
    
    return render(request, 'catalog/edit_book.html', {'form': form, 'book': book})

@login_required
def delete_book(request, book_id):
    if not request.user.is_superuser and not (hasattr(request.user, 'role') and request.user.role == 'admin'):
        messages.error(request, "You don't have permission to delete books.")
        return redirect('dashboard')
    
    book = get_object_or_404(Book, id=book_id)
    if request.method == 'POST':
        title = book.title
        book.delete()
        messages.success(request, f"Book '{title}' has been deleted successfully.")
        return redirect('book_management')
    
    return render(request, 'catalog/confirm_delete.html', {
        'object': book,
        'object_type': 'book'
    })

# Donation Management Views
@login_required
def donation_management(request):
    if not request.user.is_superuser and not (hasattr(request.user, 'role') and request.user.role == 'admin'):
        messages.error(request, "You don't have permission to access this page.")
        return redirect('dashboard')
    
    donations = Donation.objects.all().order_by('-created_at')
    return render(request, 'catalog/donation_management.html', {'donations': donations})

@login_required
def approve_donation(request, donation_id):
    if not request.user.is_superuser and not (hasattr(request.user, 'role') and request.user.role == 'admin'):
        messages.error(request, "You don't have permission to approve donations.")
        return redirect('dashboard')
    
    donation = get_object_or_404(Donation, id=donation_id)
    if request.method == 'POST':
        donation.status = 'approved'
        donation.save()
        
        # Create a book from the approved donation
        Book.objects.create(
            title=donation.title,
            author=donation.author,
            category=donation.category,
            isbn=f"DONATION-{donation.id}",
            stock=1,
            price=0.00,
            is_available=True,
            description=f"Donated by {donation.user.username}. Condition: {donation.condition}"
        )
        
        messages.success(request, f"Donation '{donation.title}' has been approved and added to the library.")
        return redirect('donation_management')
    
    return redirect('donation_management')

@login_required
def reject_donation(request, donation_id):
    if not request.user.is_superuser and not (hasattr(request.user, 'role') and request.user.role == 'admin'):
        messages.error(request, "You don't have permission to reject donations.")
        return redirect('dashboard')
    
    donation = get_object_or_404(Donation, id=donation_id)
    if request.method == 'POST':
        donation.status = 'rejected'
        donation.save()
        messages.success(request, f"Donation '{donation.title}' has been rejected.")
        return redirect('donation_management')
    
    return redirect('donation_management')

@login_required
def delete_donation(request, donation_id):
    if not request.user.is_superuser and not (hasattr(request.user, 'role') and request.user.role == 'admin'):
        messages.error(request, "You don't have permission to delete donations.")
        return redirect('dashboard')
    
    donation = get_object_or_404(Donation, id=donation_id)
    if request.method == 'POST':
        title = donation.title
        donation.delete()
        messages.success(request, f"Donation '{title}' has been deleted successfully.")
        return redirect('donation_management')
    
    return render(request, 'catalog/confirm_delete.html', {
        'object': donation,
        'object_type': 'donation'
    })

# PDF Generation Views
@login_required
def generate_pdf_report(request):
    """Generate a comprehensive PDF report"""
    if not request.user.is_superuser and not (hasattr(request.user, 'role') and request.user.role == 'admin'):
        messages.error(request, "You don't have permission to generate reports.")
        return redirect('dashboard')
    
    # Create a file-like buffer to receive PDF data
    buffer = BytesIO()
    
    # Create the PDF object
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    # Add title
    title = Paragraph("Library Management System - Comprehensive Report", styles['Title'])
    story.append(title)
    story.append(Spacer(1, 12))
    
    # Add generation date
    date_str = Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal'])
    story.append(date_str)
    story.append(Spacer(1, 20))
    
    # Get data for the report
    books = Book.objects.all()
    users = CustomUser.objects.all()
    transactions = Transaction.objects.all().order_by('-date')[:50]
    donations = Donation.objects.all()
    
    # Summary statistics
    summary_data = [
        ['Total Books', str(books.count())],
        ['Total Users', str(users.count())],
        ['Total Transactions', str(Transaction.objects.count())],
        ['Total Donations', str(donations.count())],
        ['Available Books', str(Book.objects.filter(is_available=True).count())],
        ['Pending Donations', str(Donation.objects.filter(status='pending').count())],
    ]
    
    summary_table = Table(summary_data, colWidths=[200, 100])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    story.append(Paragraph("Summary Statistics", styles['Heading2']))
    story.append(Spacer(1, 12))
    story.append(summary_table)
    story.append(Spacer(1, 20))
    
    # Books table
    book_data = [['Title', 'Author', 'ISBN', 'Stock', 'Price']]
    for book in books:
        book_data.append([book.title, book.author, book.isbn, str(book.stock), f"${book.price}"])
    
    if len(book_data) > 1:
        book_table = Table(book_data, colWidths=[150, 100, 100, 50, 50])
        book_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
        ]))
        
        story.append(Paragraph("Books Inventory", styles['Heading2']))
        story.append(Spacer(1, 12))
        story.append(book_table)
        story.append(Spacer(1, 20))
    
    # Recent transactions
    transaction_data = [['User', 'Book', 'Type', 'Date']]
    for transaction in transactions:
        transaction_data.append([
            transaction.user.username,
            transaction.book.title,
            transaction.transaction_type,
            transaction.date.strftime('%Y-%m-%d')
        ])
    
    if len(transaction_data) > 1:
        trans_table = Table(transaction_data, colWidths=[80, 120, 60, 80])
        trans_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
        ]))
        
        story.append(Paragraph("Recent Transactions (Last 50)", styles['Heading2']))
        story.append(Spacer(1, 12))
        story.append(trans_table)
    
    # Build PDF
    doc.build(story)
    
    # Get the value of the BytesIO buffer and write it to the response
    pdf = buffer.getvalue()
    buffer.close()
    
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="library_comprehensive_report.pdf"'
    response.write(pdf)
    return response

@login_required
def generate_books_pdf(request):
    """Generate PDF report for books only"""
    if not request.user.is_superuser and not (hasattr(request.user, 'role') and request.user.role == 'admin'):
        messages.error(request, "You don't have permission to generate reports.")
        return redirect('dashboard')
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    title = Paragraph("Books Inventory Report", styles['Title'])
    story.append(title)
    story.append(Spacer(1, 12))
    
    books = Book.objects.all()
    
    book_data = [['Title', 'Author', 'ISBN', 'Stock', 'Price', 'Available']]
    for book in books:
        book_data.append([
            book.title,
            book.author,
            book.isbn,
            str(book.stock),
            f"${book.price}",
            'Yes' if book.is_available else 'No'
        ])
    
    book_table = Table(book_data, colWidths=[120, 100, 100, 50, 50, 50])
    book_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    
    story.append(book_table)
    doc.build(story)
    
    pdf = buffer.getvalue()
    buffer.close()
    
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="books_inventory.pdf"'
    response.write(pdf)
    return response

#########################################################


def register(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, "Registration successful! Welcome to our library.")
            return redirect("dashboard")
        else:
            # Show specific form errors
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{field}: {error}")
    else:
        form = CustomUserCreationForm()
    
    return render(request, "catalog/register.html", {"form": form})

#  LOGIN VIEW
def custom_login(request):
    if request.method == "POST":
        form = CustomAuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f"Welcome back, {username}!")
                return redirect("dashboard")
        else:
            messages.error(request, "Invalid username or password.")
    else:
        form = CustomAuthenticationForm()
    
    return render(request, "catalog/login.html", {"form": form})

# UPDATED BOOK LIST - Show only available books
def book_list(request):
    books = Book.objects.filter(is_available=True)
    return render(request, "catalog/book_list.html", {"books": books})

def book_detail(request, pk):
    book = get_object_or_404(Book, pk=pk)
    return render(request, "catalog/book_detail.html", {"book": book})

@login_required
def borrow_book(request, pk):
    book = get_object_or_404(Book, pk=pk)
    if book.stock > 0 and book.is_available:
        # Check if user already borrowed this book
        existing_borrow = Transaction.objects.filter(
            book=book, 
            user=request.user, 
            transaction_type='borrow'
        ).exists()
        
        if not existing_borrow:
            book.stock -= 1
            if book.stock == 0:
                book.is_available = False
            book.save()
            Transaction.objects.create(book=book, user=request.user, transaction_type="borrow")
            messages.success(request, f"Successfully borrowed '{book.title}'")
        else:
            messages.error(request, "You have already borrowed this book.")
    else:
        messages.error(request, "This book is not available for borrowing.")
    return redirect("book_list")

@login_required
def return_book(request, pk):
    book = get_object_or_404(Book, pk=pk)
    # Find the borrow transaction
    borrow_transaction = Transaction.objects.filter(
        book=book, 
        user=request.user, 
        transaction_type='borrow'
    ).first()
    
    if borrow_transaction:
        book.stock += 1
        book.is_available = True
        book.save()
        Transaction.objects.create(book=book, user=request.user, transaction_type="return")
        messages.success(request, f"Successfully returned '{book.title}'")
    else:
        messages.error(request, "You haven't borrowed this book.")
    return redirect("book_list")

# UPDATED DONATION VIEWS - Use DonationForm
@login_required
def donate_book(request):
    if request.method == "POST":
        form = HybridDonationForm(request.POST, user=request.user)
        if form.is_valid():
            donation = form.save(commit=False)
            donation.user = request.user

            # Ensure category is set
            if not donation.category:
                messages.error(request, "Please select a valid category.")
                return render(request, "catalog/donate.html", {"form": form})

            donation.save()
            messages.success(request, "Thank you for your donation! It will be reviewed by our staff.")
            return redirect("donation_list")
        else:
            messages.error(request, "Please correct the errors below.")
    else:
        form = HybridDonationForm(user=request.user)

    return render(request, "catalog/donate.html", {"form": form})
@login_required
def donation_list(request):
    donations = Donation.objects.all() if request.user.is_superuser else Donation.objects.filter(user=request.user)
    return render(request, "catalog/donation_list.html", {"donations": donations})

@login_required
def sell_book(request):
    books = Book.objects.filter(is_available=True) 

    if request.method == "POST":
        book_id = request.POST.get("book_id")
        price = request.POST.get("price")
        if book_id and price:
            book = get_object_or_404(Book, pk=book_id)

            # Check if user already has a pending sale for this book
            if Sale.objects.filter(book=book, user=request.user, status='pending').exists():
                messages.error(request, "You already have a pending sale for this book.")
                return redirect("sale_list")

            Sale.objects.create(user=request.user, book=book, price=price)
            messages.success(request, f"Your book '{book.title}' is now listed for sale.")
            return redirect("sale_list")
        else:
            messages.error(request, "Please select a book and enter a price.")

    return render(request, "catalog/sell.html", {"books": books})


@login_required
def sale_list(request):
    if request.user.is_superuser or getattr(request.user, 'role', '') == 'admin':
        sales = Sale.objects.all()  # Admin sees all
    else:
        sales = Sale.objects.filter(user=request.user)  # User sees only their own
    return render(request, "catalog/sale_list.html", {"sales": sales})




from django.http import HttpResponse
from django.template.loader import render_to_string
import csv
from datetime import datetime

@login_required
def generate_report(request):
    """Generate a PDF report (basic HTML version for now)"""
    if not request.user.is_superuser:
        messages.error(request, "You don't have permission to generate reports.")
        return redirect('dashboard')
    
    # Get data for the report
    books = Book.objects.all()
    transactions = Transaction.objects.all().order_by('-date')[:100]  # Last 100 transactions
    donations = Donation.objects.all()
    sales = Sale.objects.all()
    
    context = {
        'books': books,
        'transactions': transactions,
        'donations': donations,
        'sales': sales,
        'generated_date': datetime.now(),
        'total_books': books.count(),
        'total_transactions': transactions.count(),
        'total_users': CustomUser.objects.count(),
    }
    
    # For now, return HTML. You can integrate with reportlab for PDF later
    html_content = render_to_string('catalog/report_template.html', context)
    response = HttpResponse(html_content)
    response['Content-Disposition'] = 'attachment; filename="library_report.html"'
    return response

@login_required
def export_data(request):
    """Export data as CSV"""
    if not request.user.is_superuser:
        messages.error(request, "You don't have permission to export data.")
        return redirect('dashboard')
    
    export_type = request.GET.get('type', 'books')
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="library_{export_type}_{datetime.now().strftime("%Y%m%d")}.csv"'
    
    writer = csv.writer(response)
    
    if export_type == 'books':
        writer.writerow(['Title', 'Author', 'Category', 'ISBN', 'Stock', 'Price', 'Available'])
        for book in Book.objects.all():
            writer.writerow([
                book.title, book.author, 
                book.category.name if book.category else 'N/A',
                book.isbn, book.stock, book.price, book.is_available
            ])
    
    elif export_type == 'users':
        writer.writerow(['Username', 'Email', 'First Name', 'Last Name', 'Role', 'Date Joined'])
        for user in CustomUser.objects.all():
            writer.writerow([
                user.username, user.email, user.first_name, 
                user.last_name, user.role, user.date_joined.strftime("%Y-%m-%d")
            ])
    
    elif export_type == 'transactions':
        writer.writerow(['User', 'Book', 'Type', 'Date', 'Due Date', 'Fine'])
        for transaction in Transaction.objects.all():
            writer.writerow([
                transaction.user.username,
                transaction.book.title,
                transaction.transaction_type,
                transaction.date.strftime("%Y-%m-%d %H:%M"),
                transaction.due_date.strftime("%Y-%m-%d") if transaction.due_date else 'N/A',
                transaction.fine
            ])
    elif export_type == 'donations':
        writer.writerow(['User', 'Title', 'Author', 'Status', 'Condition', 'Created At'])
        for donation in Donation.objects.all():
            writer.writerow([
                donation.user.username,
                donation.title,
                donation.author,
                donation.status,
                donation.condition,
                donation.created_at.strftime("%Y-%m-%d")
            ])   

    return response

@login_required
def export_selection(request):
    """Page to select what data to export"""
    if not request.user.is_superuser:
        messages.error(request, "You don't have permission to export data.")
        return redirect('dashboard')
    
    return render(request, 'catalog/export_selection.html')






# Update user
@login_required
def update_user(request, user_id):
    if not request.user.is_superuser and not (hasattr(request.user, 'role') and request.user.role == 'admin'):
        messages.error(request, "You don't have permission to edit users.")
        return redirect('dashboard')
    
    user = get_object_or_404(CustomUser, id=user_id)
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST, instance=user)
        if form.is_valid():
            form.save()
            messages.success(request, f"User '{user.username}' updated successfully.")
            return redirect('user_management')
    else:
        form = CustomUserCreationForm(instance=user)
    
    return render(request, 'catalog/edit_user.html', {'form': form, 'user': user})


# Approve sale
@login_required
def approve_sale(request, sale_id):
    if not request.user.is_superuser and not (hasattr(request.user, 'role') and request.user.role == 'admin'):
        messages.error(request, "You don't have permission to approve sales.")
        return redirect('dashboard')
    
    sale = get_object_or_404(Sale, id=sale_id)
    sale.status = 'approved'
    sale.save()
    messages.success(request, f"Sale for '{sale.book.title}' approved.")
    return redirect('sale_list')

# Reject sale
@login_required
def reject_sale(request, sale_id):
    if not request.user.is_superuser and not (hasattr(request.user, 'role') and request.user.role == 'admin'):
        messages.error(request, "You don't have permission to reject sales.")
        return redirect('dashboard')
    
    sale = get_object_or_404(Sale, id=sale_id)
    sale.status = 'rejected'
    sale.save()
    messages.success(request, f"Sale for '{sale.book.title}' rejected.")
    return redirect('sale_list')

# Delete sale
@login_required
def delete_sale(request, sale_id):
    sale = get_object_or_404(Sale, id=sale_id)

    # Allow admin/superuser or the owner of the sale
    if not request.user.is_superuser and not (getattr(request.user, 'role', '') == 'admin') and sale.user != request.user:
        messages.error(request, "You don't have permission to delete this sale.")
        return redirect('dashboard')

    if request.method == 'POST':
        title = sale.book.title
        sale.delete()
        messages.success(request, f"Sale for '{title}' deleted successfully.")
        return redirect('sale_list')

    return render(request, 'catalog/confirm_delete.html', {
        'object': sale,
        'object_type': 'sale'
    })

# Update sale
@login_required
def edit_sale(request, sale_id):
    sale = get_object_or_404(Sale, id=sale_id)

    # Only owner or admin can edit
    if not request.user.is_superuser and getattr(request.user, 'role', '') != 'admin' and sale.user != request.user:
        messages.error(request, "You don't have permission to edit this sale.")
        return redirect('dashboard')

    if request.method == 'POST':
        form = SaleForm(request.POST, instance=sale)
        if form.is_valid():
            updated_sale = form.save(commit=False)
            # Reset status to pending if user edits
            if sale.status != 'pending':
                updated_sale.status = 'pending'
            updated_sale.save()
            messages.success(request, f"Sale for '{sale.book.title}' updated successfully.")
            return redirect('sale_list')
    else:
        form = SaleForm(instance=sale)

    return render(request, 'catalog/edit_sale.html', {'form': form, 'sale': sale})



# Bulk approve donations
@login_required
def bulk_approve_donations(request):
    if request.method == 'POST' and (request.user.is_superuser or getattr(request.user, 'role', '') == 'admin'):
        ids = request.POST.getlist('selected_ids')
        donations = Donation.objects.filter(id__in=ids)
        for donation in donations:
            donation.status = 'approved'
            donation.save()
            Book.objects.create(
                title=donation.title,
                author=donation.author,
                isbn=f"DONATION-{donation.id}",
                stock=1,
                price=0.00,
                is_available=True,
                description=f"Donated by {donation.user.username}. Condition: {donation.condition}"
            )
        messages.success(request, f"{donations.count()} donation(s) approved and added to the library.")
    return redirect('donation_management')

# Bulk approve sales
@login_required
def bulk_approve_sales(request):
    if request.method == 'POST' and (request.user.is_superuser or getattr(request.user, 'role', '') == 'admin'):
        ids = request.POST.getlist('selected_ids')
        sales = Sale.objects.filter(id__in=ids)
        for sale in sales:
            sale.status = 'approved'
            sale.save()
        messages.success(request, f"{sales.count()} sale(s) approved.")
    return redirect('sale_list')



@login_required
def donation_detail(request, donation_id):
    donation = get_object_or_404(Donation, id=donation_id)
    return render(request, 'catalog/donation_detail.html', {'donation': donation})

@login_required
def edit_donation(request, donation_id):
    donation = get_object_or_404(Donation, id=donation_id)

    if donation.status != 'pending':
        messages.error(request, "Only pending donations can be edited.")
        return redirect('donation_list')

    if request.method == 'POST':
        form = HybridDonationForm(request.POST, instance=donation, user=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, f"Donation '{donation.title}' updated successfully.")
            return redirect('donation_list')
    else:
        form = HybridDonationForm(instance=donation, user=request.user)

    return render(request, 'catalog/edit_donation.html', {'form': form, 'donation': donation})


@login_required
def borrowed_books(request):
    borrowed_books = Transaction.objects.filter(
        user=request.user,
        transaction_type='borrow'
    ).order_by('-date')  # Latest first

    context = {
        'borrowed_books': borrowed_books
    }
    return render(request, 'catalog/borrowed_books.html', context)
