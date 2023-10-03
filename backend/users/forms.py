from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.core.exceptions import ValidationError
from .models import Profile


class UserRegisterForm(UserCreationForm):
    email = forms.EmailField()

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']

    def clean(self) -> dict:
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise ValidationError({"email": "That email is already registered."},
                                  code="email_used",
                                  )
        return self.cleaned_data


class ProfileUpdateForm(forms.ModelForm):
    username = forms.CharField(max_length=32)
    email = forms.EmailField()

    class Meta:
        model = Profile
        fields = ['image']
