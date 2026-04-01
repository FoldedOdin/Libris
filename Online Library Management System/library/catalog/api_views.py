import logging
from datetime import datetime, timedelta

from django.conf import settings
from django.contrib.auth import login, logout
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Book, Category, CustomUser, Donation, Sale, Transaction
from .serializers import (
    BookSerializer,
    CategorySerializer,
    DonationSerializer,
    SaleSerializer,
    TransactionSerializer,
    UserLoginSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)

logger = logging.getLogger(__name__)


# --------------------------------------------------------------------------- #
#  Custom Throttle for auth endpoints
# --------------------------------------------------------------------------- #
class AuthRateThrottle(AnonRateThrottle):
    """Stricter rate limit for authentication endpoints."""
    rate = '5/minute'


# --------------------------------------------------------------------------- #
#  Utility helpers
# --------------------------------------------------------------------------- #
def _get_tokens_for_user(user):
    """Generate JWT access + refresh pair for *user*."""
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


def _error(code: str, message: str, status_code: int, details: dict | None = None):
    """Standardised error response."""
    body = {'error': {'code': code, 'message': message}}
    if details:
        body['error']['details'] = details
    return Response(body, status=status_code)


# --------------------------------------------------------------------------- #
#  API Root & CSRF
# --------------------------------------------------------------------------- #
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def api_root(request):
    return Response({
        'message': 'Libris API',
        'version': '1.0',
        'endpoints': {
            'authentication': {
                'register': '/api/register/',
                'login': '/api/login/',
                'logout': '/api/logout/',
                'current_user': '/api/user/',
            },
            'books': {
                'list': '/api/books/',
                'available': '/api/books/available/',
                'detail': '/api/books/{id}/',
                'borrow': '/api/books/{id}/borrow/',
            },
            'user_data': {
                'my_donations': '/api/my-donations/',
                'my_sales': '/api/my-sales/',
                'my_borrowed_books': '/api/my-borrowed-books/',
            },
        },
    })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_csrf_token(request):
    from django.middleware.csrf import get_token
    return Response({'csrfToken': get_token(request)})


@api_view(['GET', 'POST'])
@permission_classes([permissions.AllowAny])
def stub_endpoint(request):
    """Stub to prevent 404 from browser extensions / monitoring."""
    return Response({'status': 'ok'}, status=status.HTTP_204_NO_CONTENT)


# --------------------------------------------------------------------------- #
#  Authentication Views
# --------------------------------------------------------------------------- #
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            login(request, user)
            tokens = _get_tokens_for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'tokens': tokens,
                'message': 'Registration successful',
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            tokens = _get_tokens_for_user(user)
            logger.info('Login successful for user: %s', user.username)
            return Response({
                'user': UserSerializer(user).data,
                'tokens': tokens,
                'message': 'Login successful',
            })
        logger.warning('Login validation failed: %s', serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    def post(self, request):
        # Blacklist the refresh token if provided
        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                logger.warning('Failed to blacklist refresh token during logout')
        logout(request)
        return Response({'message': 'Logout successful'})


class CurrentUserView(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            return Response(UserSerializer(request.user).data)
        return _error('NOT_AUTHENTICATED', 'Not authenticated', status.HTTP_401_UNAUTHORIZED)


# --------------------------------------------------------------------------- #
#  Books API
# --------------------------------------------------------------------------- #
class BookListCreateView(generics.ListCreateAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Book.objects.all()
        search = self.request.query_params.get('search')
        category = self.request.query_params.get('category')
        available = self.request.query_params.get('available')

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(author__icontains=search)
                | Q(description__icontains=search)
            )
        if category:
            queryset = queryset.filter(category__name__icontains=category)
        if available and available.lower() == 'true':
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


# --------------------------------------------------------------------------- #
#  Categories API
# --------------------------------------------------------------------------- #
class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


# --------------------------------------------------------------------------- #
#  Donations API
# --------------------------------------------------------------------------- #
class DonationListCreateView(generics.ListCreateAPIView):
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Donation.objects.none()

        if self.request.user.is_staff:
            queryset = Donation.objects.all()
        else:
            queryset = Donation.objects.filter(user=self.request.user)

        # Filters
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        category_filter = self.request.query_params.get('category')
        if category_filter:
            queryset = queryset.filter(category__name=category_filter)

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(book_title__icontains=search)
                | Q(author__icontains=search)
                | Q(user__username__icontains=search)
            )

        return queryset.order_by('-created_at')

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
    try:
        donation = Donation.objects.get(pk=pk)
    except Donation.DoesNotExist:
        return _error('NOT_FOUND', 'Donation not found', status.HTTP_404_NOT_FOUND)

    if donation.status == 'approved':
        return Response({'message': 'Donation already approved'})

    category_name = donation.category.name if donation.category else 'Fiction'
    valid_categories = ['Science', 'Fiction', 'Mathematics', 'History', 'DataScience']
    if category_name not in valid_categories:
        category_name = 'Fiction'

    quantity = getattr(donation, 'quantity', 1) or 1

    try:
        with transaction.atomic():
            existing_book = Book.objects.filter(
                title__iexact=donation.book_title,
                author__iexact=donation.author,
            ).select_for_update().first()

            if existing_book:
                existing_book.total_copies += quantity
                existing_book.available_copies += quantity
                existing_book.save()
                book = existing_book
                message = f'Donation approved. Added {quantity} copies to existing book.'
            else:
                book = Book.objects.create(
                    title=donation.book_title,
                    author=donation.author,
                    category=category_name,
                    description=donation.description or f'Donated by {donation.user.username}',
                    available_copies=quantity,
                    total_copies=quantity,
                    price=0.00,
                    language='English',
                    isbn='',
                )
                message = f'Donation approved. Added {quantity} new copies to catalog.'

            donation.status = 'approved'
            donation.save()

        return Response({
            'message': message,
            'book_id': book.id,
            'book_title': book.title,
            'quantity': quantity,
        })
    except Exception as e:
        logger.exception('Error approving donation pk=%s', pk)
        return _error(
            'APPROVAL_FAILED',
            'Failed to approve donation.',
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def reject_donation(request, pk):
    try:
        donation = Donation.objects.get(pk=pk)
    except Donation.DoesNotExist:
        return _error('NOT_FOUND', 'Donation not found', status.HTTP_404_NOT_FOUND)

    donation.status = 'rejected'
    donation.save()
    return Response({'message': 'Donation rejected'})


# --------------------------------------------------------------------------- #
#  Sales API
# --------------------------------------------------------------------------- #
class SaleListCreateView(generics.ListCreateAPIView):
    serializer_class = SaleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Sale.objects.none()

        if self.request.user.is_staff:
            queryset = Sale.objects.all()
        else:
            queryset = Sale.objects.filter(user=self.request.user)

        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        category_filter = self.request.query_params.get('category')
        if category_filter:
            queryset = queryset.filter(category__name=category_filter)

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(book_title__icontains=search)
                | Q(author__icontains=search)
                | Q(user__username__icontains=search)
            )

        return queryset.order_by('-created_at')

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
@permission_classes([permissions.IsAdminUser])
def approve_sale(request, pk):
    try:
        sale = Sale.objects.get(pk=pk)
    except Sale.DoesNotExist:
        return _error('NOT_FOUND', 'Sale not found', status.HTTP_404_NOT_FOUND)

    try:
        with transaction.atomic():
            sale.status = 'approved'
            sale.save()

            existing_book = Book.objects.filter(
                title__iexact=sale.book_title,
                author__iexact=sale.author,
            ).select_for_update().first()

            if existing_book:
                existing_book.price = sale.price
                existing_book.save()
                message = f'Sale approved. Book price updated to ₹{sale.price}'
                book_id = existing_book.id
            else:
                book = Book.objects.create(
                    title=sale.book_title,
                    author=sale.author,
                    category=sale.category.name if sale.category else 'Other',
                    description=sale.description or f'Book sold by {sale.user.username}',
                    price=sale.price,
                    total_copies=1,
                    available_copies=1,
                )
                message = f'Sale approved and book added to catalog with price ₹{sale.price}'
                book_id = book.id

        return Response({'message': message, 'book_id': book_id})
    except Exception as e:
        logger.exception('Error approving sale pk=%s', pk)
        return _error(
            'APPROVAL_FAILED',
            'Failed to approve sale.',
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def reject_sale(request, pk):
    try:
        sale = Sale.objects.get(pk=pk)
    except Sale.DoesNotExist:
        return _error('NOT_FOUND', 'Sale not found', status.HTTP_404_NOT_FOUND)

    sale.status = 'rejected'
    sale.save()
    return Response({'message': 'Sale rejected'})


# --------------------------------------------------------------------------- #
#  Transactions API (Borrow / Return)
# --------------------------------------------------------------------------- #
class TransactionListView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Transaction.objects.none()
        if self.request.user.is_staff:
            return Transaction.objects.select_related('book', 'user').all().order_by('-date')
        return Transaction.objects.select_related('book', 'user').filter(
            user=self.request.user
        ).order_by('-date')


class MyBorrowedBooksView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            return Transaction.objects.none()
        return Transaction.objects.select_related('book', 'user').filter(
            user=self.request.user,
            transaction_type='borrow',
            returned=False,
        ).order_by('-date')


class BorrowedBooksView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return Transaction.objects.select_related('book', 'user').filter(
            transaction_type='borrow',
            returned=False,
        ).order_by('-date')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def borrow_book(request, book_id):
    """Borrow a book — with atomic transaction and borrowing-limit check."""
    if not request.user.is_authenticated:
        return _error('NOT_AUTHENTICATED', 'Authentication required', status.HTTP_401_UNAUTHORIZED)

    max_borrows = getattr(settings, 'LIBRIS_MAX_BORROWS_PER_USER', 5)
    borrow_days = getattr(settings, 'LIBRIS_BORROW_PERIOD_DAYS', 14)

    try:
        with transaction.atomic():
            # Lock the book row to prevent race conditions
            try:
                book = Book.objects.select_for_update().get(id=book_id)
            except Book.DoesNotExist:
                return _error('NOT_FOUND', 'Book not found', status.HTTP_404_NOT_FOUND)

            if book.available_copies <= 0:
                return _error(
                    'BOOK_NOT_AVAILABLE',
                    'This book is currently not available for borrowing.',
                    status.HTTP_400_BAD_REQUEST,
                    {'book_id': book_id, 'available_copies': 0},
                )

            # Check if user already has this book
            if Transaction.objects.filter(
                user=request.user,
                book=book,
                transaction_type='borrow',
                returned=False,
            ).exists():
                return _error(
                    'ALREADY_BORROWED',
                    'You already have this book borrowed.',
                    status.HTTP_400_BAD_REQUEST,
                )

            # Check borrowing limit
            active_borrows = Transaction.objects.filter(
                user=request.user,
                transaction_type='borrow',
                returned=False,
            ).count()

            if active_borrows >= max_borrows:
                return _error(
                    'BORROW_LIMIT_REACHED',
                    f'You have reached the maximum of {max_borrows} borrowed books.',
                    status.HTTP_400_BAD_REQUEST,
                    {'current_borrows': active_borrows, 'max_borrows': max_borrows},
                )

            due_date = timezone.now().date() + timedelta(days=borrow_days)
            txn = Transaction.objects.create(
                user=request.user,
                book=book,
                transaction_type='borrow',
                due_date=due_date,
            )
            book.available_copies -= 1
            book.save()

        logger.info(
            'Book borrowed: user=%s book_id=%d txn_id=%d',
            request.user.username, book.id, txn.id,
        )
        return Response({
            'message': 'Book borrowed successfully',
            'transaction': TransactionSerializer(txn).data,
        })

    except Exception as e:
        logger.exception('Unexpected error during borrow: book_id=%s user=%s', book_id, request.user)
        return _error(
            'BORROW_FAILED',
            'An unexpected error occurred while borrowing.',
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def return_book(request, transaction_id):
    """Return a borrowed book — with atomic transaction and fine calculation."""
    try:
        with transaction.atomic():
            try:
                txn = Transaction.objects.select_for_update().get(
                    id=transaction_id,
                    user=request.user,
                    transaction_type='borrow',
                    returned=False,
                )
            except Transaction.DoesNotExist:
                return _error('NOT_FOUND', 'Transaction not found', status.HTTP_404_NOT_FOUND)

            txn.returned = True
            txn.return_date = timezone.now().date()
            txn.save()  # Fine gets calculated in model's save()

            book = Book.objects.select_for_update().get(id=txn.book_id)
            book.available_copies += 1
            book.save()

        logger.info(
            'Book returned: user=%s txn_id=%d fine=%.2f',
            request.user.username, txn.id, txn.fine,
        )
        response_data = {'message': 'Book returned successfully'}
        if txn.fine > 0:
            response_data['fine'] = float(txn.fine)
            response_data['fine_message'] = f'A fine of ₹{txn.fine} has been applied for late return.'

        return Response(response_data)

    except Exception as e:
        logger.exception('Unexpected error during return: txn_id=%s user=%s', transaction_id, request.user)
        return _error(
            'RETURN_FAILED',
            'An unexpected error occurred while returning the book.',
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# --------------------------------------------------------------------------- #
#  User Management API (Admin only)
# --------------------------------------------------------------------------- #
class UserListView(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]


# --------------------------------------------------------------------------- #
#  Dashboard Stats API
# --------------------------------------------------------------------------- #
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    today = timezone.now().date()

    if request.user.is_staff:
        stats = {
            'total_books': Book.objects.count(),
            'total_users': CustomUser.objects.count(),
            'total_donations': Donation.objects.count(),
            'total_sales': Sale.objects.count(),
            'books_borrowed_today': Transaction.objects.filter(
                transaction_type='borrow',
                date__date=today,
            ).count(),
            'pending_donations': Donation.objects.filter(status='pending').count(),
            'pending_sales': Sale.objects.filter(status='pending').count(),
            'overdue_books': Transaction.objects.filter(
                transaction_type='borrow',
                returned=False,
                due_date__lt=today,
            ).count(),
        }
    else:
        stats = {
            'borrowed_books': Transaction.objects.filter(
                user=request.user,
                transaction_type='borrow',
                returned=False,
            ).count(),
            'my_donations': Donation.objects.filter(user=request.user).count(),
            'my_sales': Sale.objects.filter(user=request.user).count(),
            'overdue_books': Transaction.objects.filter(
                user=request.user,
                transaction_type='borrow',
                returned=False,
                due_date__lt=today,
            ).count(),
        }

    return Response(stats)