from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from .forms import UserRegisterForm
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json


def get_errors(form_errors):
    errors_list = []
    for _, errors in form_errors.items():
        for error in errors:
            errors_list.append(error)
    return errors_list


@csrf_exempt
def register(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        form = UserRegisterForm(data)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Account created for {username}!')
            return JsonResponse({"message": "Registration successful"}, status=201)

        errors = get_errors(form.errors)
        return JsonResponse({"message": "Registration failed", "errors": errors}, status=400)
