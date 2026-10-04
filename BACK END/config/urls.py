from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.views import LoginView


def home_view(request):
    html = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CAITECH API</title>
        <style>
            body {
                margin: 0;
                font-family: Arial, sans-serif;
                background: linear-gradient(135deg, #0f172a, #111827, #1d4ed8);
                color: #e5e7eb;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
            }
            .container {
                width: min(900px, 90%);
                background: rgba(15, 23, 42, 0.7);
                border: 1px solid rgba(148, 163, 184, 0.25);
                border-radius: 18px;
                padding: 40px;
                box-shadow: 0 25px 50px rgba(0,0,0,0.35);
            }
            h1 {
                margin-top: 0;
                font-size: 2.5rem;
                color: #f8fafc;
            }
            p {
                color: #cbd5e1;
                font-size: 1.05rem;
                line-height: 1.7;
            }
            .cards {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                gap: 20px;
                margin-top: 30px;
            }
            .card {
                background: rgba(30, 41, 59, 0.95);
                border: 1px solid rgba(96, 165, 250, 0.35);
                border-radius: 12px;
                padding: 18px 20px;
            }
            .card a {
                color: #7dd3fc;
                text-decoration: none;
                font-weight: bold;
            }
            .card a:hover {
                text-decoration: underline;
            }
            .tag {
                display: inline-block;
                margin-bottom: 12px;
                padding: 6px 10px;
                border-radius: 999px;
                background: rgba(59, 130, 246, 0.15);
                color: #bfdbfe;
                font-size: 0.8rem;
                letter-spacing: 0.04em;
                text-transform: uppercase;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="tag">CAITECH API</div>
            <h1>Welcome to CAITECH</h1>
            <p>Your backend is running. Use the endpoints below to access courses, accounts, and authentication services.</p>

            <div class="cards">
                <div class="card">
                    <h3>Courses</h3>
                    <a href="/api/courses/">Open Courses API</a>
                </div>
                <div class="card">
                    <h3>Accounts</h3>
                    <a href="/api/accounts/">Open Accounts API</a>
                </div>
                <div class="card">
                    <h3>Token Auth</h3>
                    <a href="/api/token/">Get Access Token</a>
                </div>
                <div class="card">
                    <h3>Refresh Token</h3>
                    <a href="/api/token/refresh/">Refresh Token</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    return HttpResponse(html)


urlpatterns = [
    path('', home_view, name='home'),
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('accounts.api_urls')),
    path('api/v1/courses/', include('courses.api_urls')),
    path('api/v1/', include('site_content.api_urls')),
    path('api/courses/', include('courses.urls')),
    path('api/accounts/', include('accounts.urls')),
    path('api/token/', LoginView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

