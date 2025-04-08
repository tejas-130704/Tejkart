from django.contrib import admin
from .models import ProductReviews, CartProduct

@admin.register(ProductReviews)
class ProductReviewsAdmin(admin.ModelAdmin):
    list_display = ("user", "product_id", "sentiment", "review", "date", "like", "dislike")
    search_fields = ("user__username", "product_id", "sentiment")
    list_filter = ("sentiment",)
    
@admin.register(CartProduct)
class CartProductAdmin(admin.ModelAdmin):
    list_display = ("user", "product_id", "quantity")
    search_fields = ("user__username", "product_id")
    list_filter = ("user",)