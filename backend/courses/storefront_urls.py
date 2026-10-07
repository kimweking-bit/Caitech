from django.urls import path

from . import storefront_views as views

urlpatterns = [
    path('', views.catalog, name='storefront-home'),
    path('courses/', views.catalog, name='storefront-catalog'),
    path('courses/<slug:slug>/', views.course_detail, name='storefront-course-detail'),
    path('cart/', views.cart, name='storefront-cart'),
    path('cart/add/<int:course_id>/', views.add_to_cart, name='storefront-add-to-cart'),
    path('cart/remove/<int:course_id>/', views.remove_from_cart, name='storefront-remove-from-cart'),
    path('cart/coupon/', views.apply_cart_coupon, name='storefront-apply-coupon'),
    path('cart/coupon/remove/', views.remove_cart_coupon, name='storefront-remove-coupon'),
    path('checkout/', views.checkout, name='storefront-checkout'),
    path('payment/return/<uuid:order_reference>/', views.payment_return, name='storefront-payment-return'),
    path('payment/status/<uuid:order_reference>/', views.payment_status, name='storefront-payment-status'),
    path('my-courses/', views.dashboard, name='storefront-dashboard'),
    path('my-courses/<slug:slug>/', views.course_room, name='storefront-course-room'),
    path('courses/<slug:slug>/enroll-free/', views.enroll_free, name='storefront-free-enroll'),
    path('account/login/', views.login_page, name='storefront-login'),
    path('account/register/', views.register_page, name='storefront-register'),
    path('account/logout/', views.logout_page, name='storefront-logout'),
]