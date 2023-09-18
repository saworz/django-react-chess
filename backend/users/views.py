from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from .serializers import UserRegisterFormSerializer, UserSuccessResponseSerializer, UserErrorResponseSerializer

from drf_spectacular.utils import extend_schema, OpenApiResponse
from django.utils.decorators import method_decorator


@extend_schema(
    responses={
        201: OpenApiResponse(response=UserSuccessResponseSerializer, description='User created'),
        400: OpenApiResponse(response=UserErrorResponseSerializer, description='Bad request'),
    },
)
@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    serializer_class = UserRegisterFormSerializer

    @staticmethod
    def reformat_error(error: str) -> str:
        min_length = 8
        return error % {'min_length': min_length}

    def get_errors(self, form_errors: dict) -> dict:
        errors_dict = {}
        for field, errors in form_errors.items():
            for error in errors:
                if '%(min_length)d' in error:
                    errors_dict[str(field)] = self.reformat_error(error)
                else:
                    errors_dict[str(field)] = error
        return errors_dict

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            form = serializer.save()
            if form.is_valid():
                form.save()
                return JsonResponse({"message": "Registration successful."}, status=201)
            errors = self.get_errors(form.errors)
        else:
            errors = self.get_errors(serializer.errors)
        return JsonResponse({"message": "Registration failed.", "errors": errors},
                            status=400)
