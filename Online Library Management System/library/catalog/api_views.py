from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth import login, logout
from django.db.models import Q
from datetime import datetime, timedelta
from .models import Book, Donation, Sale, Transaction, CustomUser, Category


# API Root
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def api_root(request):
    return Response({
        'message': 'Online Library Management System API',
        'version': '1.0',
        'endpoints': {
            'authentication': {
                'register': '/api/register/',
                'login': '/api/login/',
                'logout': '/api/logout/',
                'current_user': '/api/user/'
            },
            'books': {
                'list': '/api/books/',
                'available': '/api/books/available/',
                'detail': '/api/books/{id}/',
                'borrow': '/api/books/{id}/borrow/'
            },
            'user_data': {
                'my_donations': '/api/my-donations/',
                'my_sales': '/api/my-sales/',
                'my_borrowed_books': '/api/my-borrowed-books/'
            }
        }
    })


# CSRF Token endpoint
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_csrf_token(request):
    from django.middleware.csrf import get_token
    token = get_token(request)
    return Response({'csrfToken': token})
from .serializers import (
    BookSerializer, DonationSerializer, SaleSerializer, 
    TransactionSerializer, UserSerializer, CategorySerializer,
    UserRegistrationSerializer, UserLoginSerializer
)


# Authentication Views
@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        print(f"Register request data: {request.data}")
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            login(request, user)
            return Response({
                'user': UserSerializer(user).data,
                'message': 'Registration successful'
            }, status=status.HTTP_201_CREATED)
        print(f"Register serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        print(f"Login request data: {request.data}")
        print(f"Login request headers: {dict(request.headers)}")
        
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            return Response({
                'user': UserSerializer(user).data,
                'message': 'Login successful'
            })
        
        print(f"Login serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({'message': 'Logout successful'})


class CurrentUserView(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            return Response(UserSerializer(request.user).data)
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)


# Books API
class BookListCreateView(generics.ListCreateAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Book.objects.all()
        search = self.request.query_params.get('search', None)
        category = self.request.query_params.get('category', None)
        available = self.request.query_params.get('available', None)
        
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(author__icontains=search) |
                Q(description__icontains=search)
            )
        
        if category:
            queryset = queryset.filter(category__name__icontains=category)
        
        # Filter by availability if requested
        if available is not None and available.lower() == 'true':
            queryset = queryset.filter(available_copies__gt=0)
            
        return queryset.order_by('-created_at')


class BookDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class AvailableBooksView(generics.ListAPIView):
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        return Book.objects.filter(available_copies__gt=0).order_by('-created_at')


# Categories API
class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


# Donations API
class DonationListCreateView(generics.ListCreateAPIView):
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Donation.objects.none()
        if self.request.user.is_staff:
            return Donation.objects.all().order_by('-created_at')
        return Donation.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MyDonationsView(generics.ListAPIView):
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Donation.objects.none()
        return Donation.objects.filter(user=self.request.user).order_by('-created_at')


class DonationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Donation.objects.none()
        if self.request.user.is_staff:
            return Donation.objects.all()
        return Donation.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def approve_donation(request, pk):
    if not request.user.is_staff:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        donation = Donation.objects.get(pk=pk)
        
        # Check if already approved
        if donation.status == 'approved':
            return Response({'message': 'Donation already approved'})
        
        # Get category name from the Category object if it exists
        category_name = donation.category.name if donation.category else 'Fiction'
        
        # Ensure category matches one of the Book model choices
        valid_categories = ['Science', 'Fiction', 'Mathematics', 'History', 'DataScience']
        if category_name not in valid_categories:
            category_name = 'Fiction'  # Default to Fiction if not in valid choices
        
        # Create a new book from the donation
        book = Book.objects.create(
            title=donation.book_title,
            author=donation.author,
            category=category_name,
            description=donation.description or f"Donated by {donation.user.username}",
            available_copies=1,
            total_copies=1,
            price=0.00,  # Donated books are free
            publication_date=None,
            pages=None,
            language='English',
            isbn=''
        )
        
        # Update donation status
        donation.status = 'approved'
        donation.save()
        
        return Response({
            'message': 'Donation approved successfully',
            'book_id': book.id,
            'book_title': book.title
        })
    except Donation.DoesNotExist:
        return Response({'error': 'Donation not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Error approving donation: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def reject_donation(request, pk):
    if not request.user.is_staff:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        donation = Donation.objects.get(pk=pk)
        donation.status = 'rejected'
        donation.save()
        return Response({'message': 'Donation rejected'})
    except Donation.DoesNotExist:
        return Response({'error': 'Donation not found'}, status=status.HTTP_404_NOT_FOUND)


# Sales API
class SaleListCreateView(generics.ListCreateAPIView):
    serializer_class = SaleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Sale.objects.none()
        if self.request.user.is_staff:
            return Sale.objects.all().order_by('-created_at')
        return Sale.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MySalesView(generics.ListAPIView):
    serializer_class = SaleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Sale.objects.none()
        return Sale.objects.filter(user=self.request.user).order_by('-created_at')


class SaleDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SaleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Sale.objects.none()
        if self.request.user.is_staff:
            return Sale.objects.all()
        return Sale.objects.filter(user=self.request.user)


@api_view(['POST'])
def approve_sale(request, pk):
    if not request.user.is_staff:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        sale = Sale.objects.get(pk=pk)
        sale.status = 'approved'
        sale.save()
        return Response({'message': 'Sale approved successfully'})
    except Sale.DoesNotExist:
        return Response({'error': 'Sale not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def reject_sale(request, pk):
    if not request.user.is_staff:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        sale = Sale.objects.get(pk=pk)
        sale.status = 'rejected'
        sale.save()
        return Response({'message': 'Sale rejected'})
    except Sale.DoesNotExist:
        return Response({'error': 'Sale not found'}, status=status.HTTP_404_NOT_FOUND)


# Transactions API (Borrowed Books)
class TransactionListView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Transaction.objects.none()
        if self.request.user.is_staff:
            return Transaction.objects.all().order_by('-date')
        return Transaction.objects.filter(user=self.request.user).order_by('-date')


class MyBorrowedBooksView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Transaction.objects.none()
        return Transaction.objects.filter(
            user=self.request.user,
            transaction_type='borrow',
            returned=False
        ).order_by('-date')


class BorrowedBooksView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        return Transaction.objects.filter(
            transaction_type='borrow',
            returned=False
        ).order_by('-date')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def borrow_book(request, book_id):
    print(f"\n{'='*60}")
    print(f"BORROW REQUEST RECEIVED")
    print(f"User: {request.user} (authenticated: {request.user.is_authenticated})")
    print(f"Book ID: {book_id}")
    print(f"Request data: {request.data}")
    print(f"{'='*60}\n")
    
    if not request.user.is_authenticated:
        print("ERROR: User not authenticated!")
        return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        book = Book.objects.get(id=book_id)
        
        print(f"Book found: {book.title}")
        print(f"Available copies: {book.available_copies}")
        
        if book.available_copies <= 0:
            print("ERROR: No copies available")
            return Response({'error': 'Book not available'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already has this book borrowed
        existing_transaction = Transaction.objects.filter(
            user=request.user,
            book=book,
            transaction_type='borrow',
            returned=False
        ).exists()
        
        if existing_transaction:
            print("ERROR: User already has this book borrowed")
            return Response({'error': 'You already have this book borrowed'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create transaction
        due_date = datetime.now().date() + timedelta(days=14)  # 2 weeks
        transaction = Transaction.objects.create(
            user=request.user,
            book=book,
            transaction_type='borrow',
            due_date=due_date
        )
        
        # Update book availability
        book.available_copies -= 1
        book.save()
        
        print(f"SUCCESS: Book borrowed! New available count: {book.available_copies}")
        print(f"Transaction ID: {transaction.id}")
        
        return Response({
            'message': 'Book borrowed successfully',
            'transaction': TransactionSerializer(transaction).data
        })
        
    except Book.DoesNotExist:
        print(f"ERROR: Book with ID {book_id} not found")
        return Response({'error': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"ERROR: Unexpected exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def return_book(request, transaction_id):
    try:
        transaction = Transaction.objects.get(
            id=transaction_id,
            user=request.user,
            transaction_type='borrow',
            returned=False
        )
        
        # Mark as returned
        transaction.returned = True
        transaction.return_date = datetime.now().date()
        transaction.save()
        
        # Update book availability
        book = transaction.book
        book.available_copies += 1
        book.save()
        
        return Response({'message': 'Book returned successfully'})
        
    except Transaction.DoesNotExist:
        return Response({'error': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)


# User Management API (Admin only)
class UserListView(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]


# Dashboard Stats API
@api_view(['GET'])
def dashboard_stats(request):
    if request.user.is_staff:
        # Admin dashboard stats
        stats = {
            'total_books': Book.objects.count(),
            'total_users': CustomUser.objects.count(),
            'total_donations': Donation.objects.count(),
            'total_sales': Sale.objects.count(),
            'books_borrowed_today': Transaction.objects.filter(
                transaction_type='borrow',
                date__date=datetime.now().date()
            ).count(),
            'pending_donations': Donation.objects.filter(status='pending').count(),
            'pending_sales': Sale.objects.filter(status='pending').count(),
            'overdue_books': Transaction.objects.filter(
                transaction_type='borrow',
                returned=False,
                due_date__lt=datetime.now().date()
            ).count()
        }
    else:
        # User dashboard stats
        stats = {
            'borrowed_books': Transaction.objects.filter(
                user=request.user,
                transaction_type='borrow',
                returned=False
            ).count(),
            'my_donations': Donation.objects.filter(user=request.user).count(),
            'my_sales': Sale.objects.filter(user=request.user).count(),
            'overdue_books': Transaction.objects.filter(
                user=request.user,
                transaction_type='borrow',
                returned=False,
                due_date__lt=datetime.now().date()
            ).count()
        }
    
    return Response(stats)