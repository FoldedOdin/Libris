from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Book, Donation, Sale, Transaction, CustomUser, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class BookSerializer(serializers.ModelSerializer):
    is_available = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author', 'isbn', 'category', 
            'description', 'publication_date', 'pages', 'language', 
            'available_copies', 'total_copies', 'price', 'image', 
            'is_available', 'created_at', 'updated_at'
        ]


class DonationSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        required=False,
        allow_null=True
    )
    # Add nested objects for frontend compatibility
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = Donation
        fields = [
            'id', 'user', 'user_name', 'book_title', 'author', 'category', 
            'category_name', 'condition', 'description', 'quantity', 'status', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_user(self, obj):
        """Return user data in nested format for frontend"""
        return {
            'id': obj.user.id if obj.user else None,
            'username': obj.user.username if obj.user else 'Unknown'
        }
    
    def to_internal_value(self, data):
        # Handle category as string - convert to ID
        if 'category' in data and data['category']:
            category_value = data['category']
            if isinstance(category_value, str) and not category_value.isdigit():
                # It's a category name, find or create it
                category, _ = Category.objects.get_or_create(name=category_value)
                data = data.copy()
                data['category'] = category.id
        return super().to_internal_value(data)


class SaleSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        required=False,
        allow_null=True
    )
    # Add nested objects for frontend compatibility
    book = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = Sale
        fields = [
            'id', 'user', 'user_name', 'book', 'book_title', 'author', 'category', 
            'category_name', 'condition', 'price', 'description', 'status', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_book(self, obj):
        """Return book data in nested format for frontend"""
        return {
            'title': obj.book_title,
            'author': obj.author,
            'category': obj.category.name if obj.category else None
        }
    
    def get_user(self, obj):
        """Return user data in nested format for frontend"""
        return {
            'id': obj.user.id if obj.user else None,
            'username': obj.user.username if obj.user else 'Unknown'
        }
    
    def to_internal_value(self, data):
        # Handle category as string - convert to ID
        if 'category' in data and data['category']:
            category_value = data['category']
            if isinstance(category_value, str) and not category_value.isdigit():
                # It's a category name, find or create it
                category, _ = Category.objects.get_or_create(name=category_value)
                data = data.copy()
                data['category'] = category.id
        return super().to_internal_value(data)


class TransactionSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    book_title = serializers.SerializerMethodField()
    book_author = serializers.SerializerMethodField()
    book = serializers.SerializerMethodField()
    date = serializers.DateTimeField(read_only=True)
    due_date = serializers.SerializerMethodField()
    return_date = serializers.SerializerMethodField()
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'user', 'user_name', 'book', 'book_title', 'book_author',
            'transaction_type', 'date', 'due_date', 'returned', 'return_date'
        ]
    
    def get_book(self, obj):
        """Return book data in nested format for frontend"""
        try:
            if obj.book:
                return {
                    'id': obj.book.id,
                    'title': obj.book.title,
                    'author': obj.book.author,
                    'isbn': obj.book.isbn,
                    'category': obj.book.category
                }
            return None
        except Exception:
            return None
    
    def get_user_name(self, obj):
        try:
            return obj.user.username if obj.user else 'Unknown User'
        except Exception:
            return 'Unknown User'
    
    def get_book_title(self, obj):
        try:
            return obj.book.title if obj.book else 'Unknown Book'
        except Exception:
            return 'Unknown Book'
    
    def get_book_author(self, obj):
        try:
            return obj.book.author if obj.book else 'Unknown Author'
        except Exception:
            return 'Unknown Author'
    
    def get_due_date(self, obj):
        if obj.due_date:
            # Convert datetime to date if needed
            if hasattr(obj.due_date, 'date'):
                return obj.due_date.date()
            return obj.due_date
        return None
    
    def get_return_date(self, obj):
        if obj.return_date:
            # Convert datetime to date if needed
            if hasattr(obj.return_date, 'date'):
                return obj.return_date.date()
            return obj.return_date
        return None


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active', 'date_joined']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'first_name', 'last_name', 'password', 'password_confirm')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = CustomUser.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        import logging
        logger = logging.getLogger(__name__)
        
        username = attrs.get('username')
        password = attrs.get('password')

        logger.info("Login attempt for username: %s", username)

        if username and password:
            # Try to authenticate with username first
            user = authenticate(username=username, password=password)
            
            # If that fails, try to find user by email and authenticate with username
            if not user:
                try:
                    user_obj = CustomUser.objects.get(email=username)
                    user = authenticate(username=user_obj.username, password=password)
                except CustomUser.DoesNotExist:
                    pass
            
            if not user:
                logger.warning(f"Authentication failed for: {username}")
                raise serializers.ValidationError('Invalid username or password')
            if not user.is_active:
                logger.warning(f"Inactive account login attempt: {username}")
                raise serializers.ValidationError('Your account has been deactivated. Please contact the administrator.')
            
            logger.info(f"Authentication successful for: {user.username}")
            attrs['user'] = user
        else:
            logger.error(f"Missing credentials - username: {bool(username)}, password: {bool(password)}")
            raise serializers.ValidationError('Must include username and password')
        
        return attrs