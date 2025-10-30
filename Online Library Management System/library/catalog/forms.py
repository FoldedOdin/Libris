from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import CustomUser, Donation, Sale, Book

# Custom User Registration Form
class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True, widget=forms.EmailInput(attrs={'class': 'form-control'}))
    first_name = forms.CharField(max_length=30, required=True, widget=forms.TextInput(attrs={'class': 'form-control'}))
    last_name = forms.CharField(max_length=30, required=True, widget=forms.TextInput(attrs={'class': 'form-control'}))
    
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'first_name', 'last_name', 'password1', 'password2')
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Add Bootstrap classes to form fields
        for fieldname in ['username', 'password1', 'password2']:
            self.fields[fieldname].widget.attrs.update({'class': 'form-control'})

# Custom Login Form
class CustomAuthenticationForm(AuthenticationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].widget.attrs.update({'class': 'form-control'})
        self.fields['password'].widget.attrs.update({'class': 'form-control'})

# Donation Form
class DonationForm(forms.ModelForm):
    class Meta:
        model = Donation
        fields = ['book_title', 'author', 'category', 'condition', 'description']
        widgets = {
            'book_title': forms.TextInput(attrs={'class': 'form-control'}),
            'author': forms.TextInput(attrs={'class': 'form-control'}),
            'category': forms.Select(attrs={'class': 'form-control'}),
            'condition': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }


from django import forms
from .models import Donation, Book, Category

class HybridDonationForm(forms.ModelForm):
    borrowed_book = forms.ModelChoiceField(
        queryset=Book.objects.none(),
        required=False,
        empty_label="Select a borrowed book (optional)",
        widget=forms.Select(attrs={'class': 'form-control'})
    )

    book_title = forms.CharField(
        max_length=255,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    author = forms.CharField(
        max_length=255,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    category = forms.ModelChoiceField(
        queryset=Category.objects.all(),
        required=False,
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    condition = forms.ChoiceField(
        choices=[('Excellent','Excellent'),('Good','Good'),('Fair','Fair'),('Poor','Poor')],
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    description = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 3})
    )

    class Meta:
        model = Donation
        fields = ['borrowed_book', 'book_title', 'author', 'category', 'condition', 'description']

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)

        # Filter borrowed books if user is provided
        if user:
            self.fields['borrowed_book'].queryset = Book.objects.filter(
                transaction__user=user,
                transaction__transaction_type='borrow',
                transaction__returned=False
            ).distinct()

        # Pre-populate fields if editing
        if self.instance and self.instance.pk:
            self.fields['book_title'].initial = self.instance.book_title
            self.fields['author'].initial = self.instance.author
            if self.instance.category:
                self.fields['category'].initial = self.instance.category.pk
            self.fields['condition'].initial = self.instance.condition
            self.fields['description'].initial = self.instance.description

    def clean(self):
        cleaned_data = super().clean()
        borrowed = cleaned_data.get('borrowed_book')

        # Auto-fill fields if borrowed book selected
        if borrowed:
            cleaned_data['book_title'] = borrowed.title
            cleaned_data['author'] = borrowed.author

        return cleaned_data

    def save(self, commit=True):
        donation = super().save(commit=False)
        borrowed = self.cleaned_data.get('borrowed_book')
        category = self.cleaned_data.get('category')

        if borrowed:
            donation.book_title = borrowed.title
            donation.author = borrowed.author
        
        if isinstance(category, Category):
            donation.category = category
        else:
            donation.category = None

        if commit:
            donation.save()
        return donation

# Sale Form
class SaleForm(forms.ModelForm):
    class Meta:
        model = Sale
        fields = ['book_title', 'author', 'category', 'condition', 'price', 'description']
        widgets = {
            'book_title': forms.TextInput(attrs={'class': 'form-control'}),
            'author': forms.TextInput(attrs={'class': 'form-control'}),
            'category': forms.Select(attrs={'class': 'form-control'}),
            'condition': forms.TextInput(attrs={'class': 'form-control'}),
            'price': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }

# Book Form (for admin)
class BookForm(forms.ModelForm):
    class Meta:
        model = Book
        fields = ['title', 'author', 'isbn', 'category', 'description', 'publication_date', 
                  'pages', 'language', 'total_copies', 'available_copies', 'price', 'image']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'author': forms.TextInput(attrs={'class': 'form-control'}),
            'isbn': forms.TextInput(attrs={'class': 'form-control'}),
            'category': forms.Select(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'publication_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'pages': forms.NumberInput(attrs={'class': 'form-control'}),
            'language': forms.Select(attrs={'class': 'form-control'}),
            'total_copies': forms.NumberInput(attrs={'class': 'form-control'}),
            'available_copies': forms.NumberInput(attrs={'class': 'form-control'}),
            'price': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'image': forms.FileInput(attrs={'class': 'form-control'}),
        }