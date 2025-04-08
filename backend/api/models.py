from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class ProductReviews(models.Model):
    SENTIMENT_CHOICES = [
        ("Positive", "Positive"),
        ("Negative", "Negative"),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)  
    product_id = models.CharField(max_length=5)
    review = models.TextField()
    sentiment = models.CharField(max_length=8, choices=SENTIMENT_CHOICES)
    date = models.DateTimeField(default=timezone.now)
    like = models.IntegerField(default=0)
    dislike = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} reviewed Product {self.product_id}: {self.sentiment}"

class CartProduct(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product_id = models.CharField(max_length=5)
    quantity = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.user.username} added Product {self.product_id} to cart"
    
    
class UserInterest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    interest_data = models.JSONField(default=dict)
    
    def __str__(self):
        return f"{self.user.username} interest data"