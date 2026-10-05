from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.views import LoginView


urlpatterns = [
    path('', include('courses.storefront_urls')),
    path('admin/', admin.site.urls),
    path('api/v1/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/v1/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/v1/auth/', include('accounts.api_urls')),
    path('api/v1/courses/', include('courses.api_urls')),
    path('api/v1/payments/', include('payments.api_urls')),
    path('api/v1/ai-path/', include('ai_path.api_urls')),
    path('api/v1/', include('site_content.api_urls')),
    path('api/courses/', include('courses.urls')),
    path('api/accounts/', include('accounts.urls')),
    path('api/token/', LoginView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

