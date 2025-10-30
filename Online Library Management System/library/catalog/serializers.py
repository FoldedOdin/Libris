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
    
    class Meta:
        model = Donation
        fields = [
            'id', 'user', 'user_name', 'book_title', 'author', 'category', 
            'category_name', 'condition', 'description', 'status', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']


class SaleSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)
    
    class Meta:
        model = Sale
        fields = [
            'id', 'user', 'user_name', 'book_title', 'author', 'category', 
            'category_name', 'condition', 'price', 'description', 'status', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']


class TransactionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_author = serializers.CharField(source='book.author', read_only=True)
    date = serializers.DateTimeField(read_only=True)
    due_date = serializers.SerializerMethodField()
    return_date = serializers.SerializerMethodField()
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'user', 'user_name', 'book', 'book_title', 'book_author',
            'transaction_type', 'date', 'due_date', 'returned', 'return_date'
        ]
    
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
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'date_joined']


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
        username = attrs.get('username')
        password = attrs.get('password')

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
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include username and password')
        
        return attrs