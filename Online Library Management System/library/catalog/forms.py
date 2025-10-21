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
        fields = ['title', 'author', 'category', 'condition']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'author': forms.TextInput(attrs={'class': 'form-control'}),
            'category': forms.Select(attrs={'class': 'form-control'}),
            'condition': forms.Select(attrs={'class': 'form-control'}),
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

    title = forms.CharField(
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

    class Meta:
        model = Donation
        fields = ['borrowed_book', 'title', 'author', 'category', 'condition']

    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)

        # Filter borrowed books if user is provided
        if user:
            self.fields['borrowed_book'].queryset = Book.objects.filter(
                transaction__user=user,
                transaction__transaction_type='borrow'
            ).distinct()

        # Pre-populate fields if editing
        if self.instance and self.instance.pk:
            self.fields['title'].initial = self.instance.title
            self.fields['author'].initial = self.instance.author
            if self.instance.category:
                self.fields['category'].initial = self.instance.category.pk
            self.fields['condition'].initial = self.instance.condition

    def clean(self):
        cleaned_data = super().clean()
        borrowed = cleaned_data.get('borrowed_book')

        # Auto-fill fields if borrowed book selected
        if borrowed:
            cleaned_data['title'] = borrowed.title
            cleaned_data['author'] = borrowed.author
            cleaned_data['category'] = borrowed.category  # must be Category instance

        return cleaned_data

    def save(self, commit=True):
        donation = super().save(commit=False)
        borrowed = self.cleaned_data.get('borrowed_book')
        category = self.cleaned_data.get('category')

        if borrowed:
            donation.title = borrowed.title
            donation.author = borrowed.author
            donation.category = borrowed.category
        elif isinstance(category, Category):
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
        fields = ['book', 'price','status']
        widgets = {
            'book': forms.Select(attrs={'class': 'form-control'}),
            'price': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
        }

# Book Form (for admin)
class BookForm(forms.ModelForm):
    class Meta:
        model = Book
        fields = ['title', 'author', 'isbn', 'category', 'stock', 'price']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'author': forms.TextInput(attrs={'class': 'form-control'}),
            'isbn': forms.TextInput(attrs={'class': 'form-control'}),
            'category': forms.Select(attrs={'class': 'form-control'}),
            'stock': forms.NumberInput(attrs={'class': 'form-control'}),
            'price': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
        }