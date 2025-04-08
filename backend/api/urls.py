from django.urls import path,include
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)


urlpatterns = [
    path("/",views.home,name="home"),
    path("landing/",views.landing_page,name="landing_page"),
    path("landing_user_int/",views.landing_page_user_data,name="landing_page_user_data"),
    path("products/",views.get_products,name="get_products"),
    path('all_products_article/<str:articleType>/', views.get_products_articleType, name='get_products_articleType'),
    path('all_product/<str:subCategory>/', views.get_products_by_subcategory, name='get_products_by_subcategory'),
    path('product/<int:productid>/', views.get_product_by_id, name='get_product_by_id'),
    path('search/<str:search>',views.get_search_list,name="get_search_list"),
    path("review/",views.saveReviews,name="saveReviews"),
    path("register/",views.RegisterView.as_view()),
    path("login/",views.LoginView.as_view()),
    # path("logout/",views.LogoutView.as_view()),
    path("getreviews/<int:productid>/",views.getReviews,name="getReviews"),
    path("user/", views.UserDetailView.as_view(), name="user-detail"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),  # Login & Get Tokens
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),  # Refresh Token
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("setcart/", views.setCart, name="setcart"),
    path("getcart/", views.getCart, name="getcart"),
    path("getUserDetails/",views.getUserDetails,name="getUserDetails"),
    path("deleteCart/",views.deleteCartProduct, name="deleteCartProduct"),
    
]

