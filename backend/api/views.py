from django.shortcuts import get_object_or_404, render
from django.http import JsonResponse
import os
from django.conf import settings
import pandas as pd
import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import authentication, permissions
from django.contrib.auth.models import User
from scipy.sparse import load_npz
import pickle
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from PIL import Image
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
import tensorflow as tf
from sklearn.neighbors import NearestNeighbors
import os
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input
import joblib
import numpy as np
from gensim.models import Word2Vec
from sklearn.metrics.pairwise import cosine_similarity
import json
from tensorflow.keras.preprocessing.text import tokenizer_from_json
import re
import string
from .models import ProductReviews, CartProduct
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from tensorflow.keras.models import load_model
from .models import ProductReviews
from tensorflow.keras.preprocessing.sequence import pad_sequences
from django.views.decorators.csrf import ensure_csrf_cookie
from .serializers import RegisterSerializer
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

class RegisterView(APIView):
    def post(self, request):
        data=request.data
        serializer = RegisterSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            print("User:",user.username)
            register_user(user.username)
            return Response({
                "message": "User Created Sucessfully",
                "satus":True
            }, status= status.HTTP_201_CREATED)
            
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email
        })



class LoginView(APIView):
    def post(self, request):
        data = request.data 
        username = data.get('username')
        password = data.get('password')
        user = User.objects.filter(username=username).first()
        if user and user.check_password(password):
            refresh = RefreshToken.for_user(user)
            register_user(user.username)
            print("Login sucessfully!!")
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            })
        return Response({"message":"Invalid Ceditenial"},status=status.HTTP_400_BAD_REQUEST)


FILES_DIR = os.path.join(settings.BASE_DIR, "files","Test")
# D:\Complex Projects\E-Commerce Website\backend\files\Test\sentiment_analysis\tokenizer.json
tokenizer_path= os.path.join(FILES_DIR,"sentiment_analysis","tokenizer.json")
# Open and read the JSON file
with open(tokenizer_path, 'r') as file:
    tokenizer_json = json.load(file)

user_intrest_path = os.path.join(settings.MEDIA_ROOT, 'UserIntrest.csv')
# D:\Complex Projects\E-Commerce Website\backend\media\UserIntrest.csv
user_intrest = pd.read_csv(user_intrest_path)

# Reconstruct the tokenizer
tokenizer = tokenizer_from_json(tokenizer_json)

model_path= os.path.join(FILES_DIR,"sentiment_analysis","model1.h5")
# Load the model
model1 = load_model(model_path)


# Example: Reading a CSV file
image_csv_file_path = os.path.join(FILES_DIR, "images.csv")
style_csv_file_path = os.path.join(FILES_DIR, "E_commerce_adv.csv")
json_file_path = os.path.join(FILES_DIR, "categories.json")
tfidf_matrix_path=os.path.join(FILES_DIR,"tfidf_matrix.npz")
tfidf_vectorizer_path=os.path.join(FILES_DIR,"tfidf_vectorizer.pkl")
with open(tfidf_vectorizer_path, "rb") as file:
    loaded_tfidf = pickle.load(file)
    
vector = load_npz(tfidf_matrix_path)
images_df=pd.read_csv(image_csv_file_path)
styles_df=pd.read_csv(style_csv_file_path)
    
with open(json_file_path, "r") as json_file:
    loaded_data = json.load(json_file)


#CV files
with open(os.path.join(FILES_DIR,"models/model.pkl"), "rb") as f:
    model = pickle.load(f)
with open(os.path.join(FILES_DIR,"models/extracted_features.pkl"), "rb") as f:
    features = pickle.load(f)
with open(os.path.join(FILES_DIR,"models/filename.pkl"), "rb") as f:
    image_paths = pickle.load(f)

def add_new_user(new_user):
    # Read the CSV every time to ensure fresh data
    user_intrest = pd.read_csv(user_intrest_path)

    if new_user in user_intrest['user'].values:
        print(f"User '{new_user}' already exists.")
        return user_intrest

    new_row = {col: 0.0 for col in user_intrest.columns}
    new_row['user'] = new_user
    new_row_df = pd.DataFrame([new_row])

    return pd.concat([user_intrest, new_row_df], ignore_index=True)

def register_user(username):
    user_intrest_new = add_new_user( username)
    try:
        with open(user_intrest_path, 'w', newline='', encoding='utf-8') as f:
            user_intrest_new.to_csv(f, index=False)
        print("File saved successfully.")
    except PermissionError as e:
        print("PermissionError:", e)
    except Exception as e:
        print("Error while saving CSV:", e)

    

#NLP files
w2v_model = Word2Vec.load(os.path.join(FILES_DIR,"modelfile","word2vec_model.bin"))
tfidf = joblib.load(os.path.join(FILES_DIR,"modelfile","tfidf_vectorizer.pkl"))
product_vectors = joblib.load(os.path.join(FILES_DIR,"modelfile","product_vectors.pkl"))
product_ids = joblib.load(os.path.join(FILES_DIR,"modelfile","product_ids.pkl"))

# Load word importance
word_importance = dict(zip(tfidf.get_feature_names_out(), tfidf.idf_))

# Function to get weighted sentence vector (same as before)
def get_weighted_sentence_vector(sentence, model, word_importance):
    words = sentence.lower().split()
    vectors = []
    weights = []
    for word in words:
        if word in model.wv and word in word_importance:
            vectors.append(model.wv[word] * word_importance[word])  # Weighted vector
            weights.append(word_importance[word])
    
    return np.average(vectors, axis=0, weights=weights) if vectors else np.zeros(model.vector_size)


def get_products(request):
    other_products=get_landing_page_products()
    # print("Productssss:",other_products)
    return JsonResponse({"products":other_products,"status":200,"safe":True})



# Create your views here.
def home(request):
    return JsonResponse({"message":"Hello Horld!","status":200})
  

def get_user_intrest_product(username):
    user_intrest = pd.read_csv(user_intrest_path)
    print(user_intrest)
    user_json=user_intrest[user_intrest["user"] == username].to_json(orient="records")
    print(user_json) 
    user_data = json.loads(user_json)[0]  
    user_data.pop("user", None)
    non_zero_items = {k: v for k, v in user_data.items() if v > 0}
    top_3_non_zero = sorted(non_zero_items.items(), key=lambda x: x[1], reverse=True)[:3]
    product_list=pd.DataFrame()
    if len(top_3_non_zero) > 0:
        intrest_len = max(1, int(10 / len(top_3_non_zero)))

        for d in top_3_non_zero:
            article_type = d[0]
            filtered = styles_df[styles_df["articleType"] == article_type]
            available_len = min(len(filtered), intrest_len)
            new_filtered = filtered[:available_len]
            product_list=pd.concat([product_list,new_filtered],ignore_index=True)

    else:
        print("No non-zero interest article types found.")
    
    return product_list


@csrf_exempt
@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def getUserDetails(request):
    if request.user.is_authenticated:
        username = request.user.username
        user_intrest = pd.read_csv(user_intrest_path)
        user_json=user_intrest[user_intrest["user"] == username].to_json(orient="records")
        user_data = json.loads(user_json)[0]  
        user_data.pop("user", None)
        non_zero_items = [k for k, v in user_data.items() if v > 0]
        
        user = User.objects.get(username=username)
         
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "intrest": non_zero_items,
        }
        print(user_data)
        return JsonResponse({"user_data":user_data,"status":200,"safe":True})
    else:
        print("User not authenticated")
        return JsonResponse({"error": "User not authenticated", "status": 401, "safe": False})
    


@csrf_exempt
@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def landing_page_user_data(request):
    if request.user.is_authenticated:
        # ✅ Perform the restricted functionality here
        print("User is authenticated")
        username = request.user.username
        product_list = get_user_intrest_product(username)
        # print("Product List:",product_list)
        json_data = json.loads(product_list.to_json(orient="records"))

        return JsonResponse({"product_list":json_data,"status":200,"safe":True})
    else:
        print("User not authenticated")
        return JsonResponse({"error": "User not authenticated", "status": 401, "safe": False})
    

def get_landing_page_products():
    cat_list=styles_df["masterCategory"].unique()
    new_dict = {}
    for c in cat_list:
        new_dict[c]=styles_df[styles_df["masterCategory"]==c]["articleType"].unique()[:10]
    user_json={}
    for index,items in new_dict.items():
        new_df2=pd.DataFrame()
        for i in items:
            filtered_df=styles_df[styles_df["articleType"]==i].sample(1)
            new_df2=pd.concat([new_df2,filtered_df],ignore_index=False)
        user_json[index]=json.loads(new_df2.to_json(orient="records"))
    
    return user_json

def landing_page(request):
    return JsonResponse({"category_data":loaded_data,"status":200,"safe":True})


def get_products_by_subcategory(request, subCategory):
    try:
        filtered_data = styles_df[styles_df["subCategory"] == subCategory]
        filtered_data = filtered_data.sample(n=min(50, len(filtered_data)), random_state=42)
        json_data = json.loads(filtered_data.to_json(orient="records"))

        return JsonResponse({"safe": True,"products_data":json_data, "status":200})
    
    except Exception as e:
        return JsonResponse({"safe": False, "error": str(e)}, status=500)


def get_products_articleType(request, articleType):
    try:
        filtered_data = styles_df[styles_df["articleType"] == articleType]
        filtered_data = filtered_data.sample(n=min(50, len(filtered_data)), random_state=42)
        json_data = json.loads(filtered_data.to_json(orient="records"))
        # print("Dattttttttttttttttt",json_data)
        return JsonResponse({"safe": True,"products_data":json_data, "status":200})
    
    except Exception as e:
        return JsonResponse({"safe": False, "error": str(e)}, status=500)




def get_search_list(request, search):
    try:
        # Convert search query to TF-IDF vector
        query_vector = get_weighted_sentence_vector(search, w2v_model, word_importance)

        # Compute cosine similarity
        similarities = cosine_similarity([query_vector], product_vectors)[0]

        # Rank products based on similarity
        sorted_indices = np.argsort(similarities)[::-1]

        sorted_product_ids = [product_ids[i] for i in sorted_indices[:40]]

        # Get product details for the first 40 records in the same order
        top_matches = styles_df.set_index("id").loc[sorted_product_ids].reset_index()

        # Convert DataFrame to JSON format
        json_data = top_matches.to_json(orient="records")
        
        return JsonResponse({"safe": True, "products_data": json.loads(json_data), "status": 200})
    except Exception as e:
        return JsonResponse({"safe": False, "error": str(e)}, status=500)
    
    
    
    
    
def give_similar(value):
    try:
        isx = styles_df[styles_df['id'] == value].index
        if isx.empty:
            return []

        cosine_sim = cosine_similarity(vector, vector[[isx[0]]])
        new_cosine = list(enumerate(cosine_sim.flatten()))  # Flatten to avoid nested lists
        new_cosine = sorted(new_cosine, key=lambda x: x[1], reverse=True)

        # Get top 30 similar products
        top_matches = [styles_df.iloc[i[0]].replace({np.nan: None}).to_dict() for i in new_cosine[:20]]

        return top_matches
    except Exception as e:
        return {"error": str(e)}



def get_product_by_id(request, productid):
    try:
        # Ensure product exists
        filtered_data = styles_df[styles_df["id"] == productid]
        if filtered_data.empty:
            return JsonResponse({"safe": False, "error": "Product not found", "status": 404})

        # Convert DataFrame to JSON
        json_data = json.loads(filtered_data.to_json(orient="records"))
        
        reviews = list(ProductReviews.objects.filter(product_id=productid).values())  
        print(reviews)
        # Get similar products
        similar_products = give_similar(productid)
        similar_products_cv = get_similar_by_cv(productid)
        return JsonResponse({
            "safe": True,
            "product_data": json_data,
            "similar_products_by_cv":similar_products_cv,
            "similar_products": similar_products,
            "reviews":reviews,
            "status": 200
        })
    
    except Exception as e:
        return JsonResponse({"safe": False, "error": str(e)}, status=500)

def get_similar_by_cv(id):
    img_name = str(id) + ".jpg"
    print(img_name)
    # Retrieve stored features for the given image
    feature_image = get_features_from_saved(img_name)
    
    if feature_image is not None:
        # Get similar images based on features
        file_names = get_similar_images(feature_image)
        # Remove ".jpg" from filenames to match IDs
        clear_file_names = [file.replace(".jpg", "") for file in file_names]
        new_file_name = [int(file) for file in clear_file_names]
        # Filter DataFrame correctly using .isin()
        df = styles_df[styles_df["id"].isin(new_file_name)]
        
        return json.loads(df.to_json(orient="records"))
    else:
        print("No Details Found jj")
        return None


def get_similar_images(query_features):
    nbrs = NearestNeighbors(n_neighbors=20, algorithm='brute', metric='euclidean').fit(features)
    distances, indices = nbrs.kneighbors([query_features])
    similar_image_paths = [image_paths[i] for i in indices[0]]
    return similar_image_paths


def get_features_from_saved(image_name):
    if image_name in image_paths:
        index = image_paths.index(image_name)  # Find index of the image
        return features[index]  # Return the corresponding feature vector
    else:
        return None  # Image not found



@api_view(["POST"])
@authentication_classes([JWTAuthentication])  # Bind JWT authentication
@permission_classes([IsAuthenticated]) 
@csrf_exempt
def saveReviews(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode("utf-8"))  # Parse JSON request body
            review = data.get("review", "")
            productid = data.get("productid", "")

            print("Product ID:", productid)
            print("Review:", review)

            
            if not request.user.is_authenticated:
                print("User not found literally")
                return JsonResponse({"response": "User not authenticated", "status": 401}, safe=False)
            
            senti = getCommentSentiment(review)  # Call sentiment analysis function
            
            user = request.user  # Get the logged-in user
            print("User:", user.username)
            print("Sentiment:", senti)
            
            if senti == "Positive":
                set_user_intrest_inc(request.user.username, productid, points=0.4)
            else:
                set_user_intrest_inc(request.user.username, productid, points=-0.2)  
                
            # Create and save the product review
            review_data = ProductReviews.objects.create(
                user=user,
                product_id=productid,
                review=review,
                sentiment=senti
            )

            return JsonResponse({"response": "Successfully Stored", "status": 200}, safe=False)
        
        except Exception as e:
            return JsonResponse({"response": str(e), "status": 500}, safe=False)

    return JsonResponse({"response": "Invalid request method", "status": 400}, safe=False)


def getReviews(request,productid):
    if request.method == "GET":
        try:
            reviews_raw = ProductReviews.objects.filter(product_id=productid).select_related("user")

            reviews = [
                {
                    "username": review.user.username,
                    "review": review.review,
                    "sentiment": review.sentiment,
                    "date": review.date.strftime("%b. %d, %Y (%I:%M %p)"),  # 👈 formatted here
                    "like": review.like,
                    "dislike": review.dislike,
                }
                for review in reviews_raw
            ]
            print(reviews)
            if not reviews:
                print("No reviews found")
                return JsonResponse({"response": "No reviews found", "status": 404}, safe=False)
            
            print("Review of product",reviews)
            return JsonResponse({"response": reviews, "status": 200}, safe=False)
        
        except Exception as e:
            return JsonResponse({"response": str(e), "status": 500}, safe=False)

    return JsonResponse({"response": "Invalid request method", "status": 400}, safe=False)


def getCommentSentiment(text):
    cleantext=clean_text(text)
    sequences_test = tokenizer.texts_to_sequences([cleantext])
    padded_sequences_test = pad_sequences(sequences_test, maxlen=200, padding='post', truncating='post')

    pred = model1.predict(padded_sequences_test)
    if pred >= 0.5:
        return "Positive"
    else :
        return "Negative"
    


def clean_text(text):
    text = re.sub(r'[^A-Za-z ]+', '', text)
    text = text.lower()
    text = text.translate(str.maketrans('', '', string.punctuation))
    text = re.sub(r'\s+', ' ', text).strip()
    stop_words = set(stopwords.words('english'))
    stemmer = PorterStemmer()
    tokens = nltk.word_tokenize(text)
    processed_tokens = [stemmer.stem(token) for token in tokens if token not in stop_words]
    return " ".join(processed_tokens)



def set_user_intrest_inc(username, productid, points):
    filtered_data = styles_df[styles_df["id"] == int(productid)]
    user_intrest = pd.read_csv(user_intrest_path)
    if filtered_data.empty:
        print("Product not found.")
        return user_intrest

    article_type = filtered_data["articleType"].values[0]

    if username in user_intrest["user"].values:
        user_idx = user_intrest[user_intrest["user"] == username].index[0]
        if article_type in user_intrest.columns:
            user_intrest.at[user_idx, article_type] += points
        else:
            print(f"Article type '{article_type}' not tracked.")
    else:
        print(f"User '{username}' not found.")
        
    try:
        with open(user_intrest_path, 'w', newline='') as f:
            user_intrest.to_csv(f, index=False)
        print("File saved successfully.")
    except PermissionError as e:
        print("PermissionError:", e)
    except Exception as e:
        print("Error while saving CSV:", e)





@csrf_exempt
@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def setCart(request):
    try:
        data = json.loads(request.body.decode("utf-8"))
        productid = data.get("productid")
        new_quantity = data.get("quantity", 1)
        
        if not productid:
            return JsonResponse({"response": "Product ID not provided", "status": 400}, safe=False)

        user = request.user
        
        set_user_intrest_inc(user.username, productid, points=1)
        # Check if product is already in the user's cart
        existing_item = CartProduct.objects.filter(user=user, product_id=productid).first()

        if existing_item:
            existing_item.quantity += int(new_quantity)
            existing_item.save()
            return JsonResponse({"response": "Cart updated successfully", "status": 200}, safe=False)
        
        # Create new cart item
        CartProduct.objects.create(
            user=user,
            product_id=productid,
            quantity=new_quantity
        )
        return JsonResponse({"response": "Added to cart", "status": 200}, safe=False)

    except Exception as e:
        return JsonResponse({"response": str(e), "status": 500}, safe=False)


@csrf_exempt
@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def getCart(request):
    try:
        user = request.user
        cart_items = list(CartProduct.objects.filter(user=user).values("id", "product_id", "quantity"))
        if not cart_items:
            return JsonResponse({"response": "No items in cart", "status": 404}, safe=False)
        all_items = []
        new_dict=[]
        for item in cart_items:
            product_id = item["product_id"]
            if product_id in new_dict:
                continue
            print("Items:", product_id, item)
            print(type(product_id))
            filtered_data = styles_df[styles_df["id"] == int(product_id)]
            print("Filtered Info:", filtered_data)
            # Convert the filtered data to dict (should only be 1 row ideally)
            product_info = json.loads(filtered_data.to_json(orient="records"))
            print("Product Info:", product_info)
            # Merge cart item quantity with product info
            if product_info:
                product_info[0]["cart_quantity"] = item["quantity"]
                all_items.append(product_info[0])
            new_dict.append(product_id)
        print(all_items)

        return JsonResponse({"response": all_items, "status": 200}, safe=False)

    except Exception as e:
        return JsonResponse({"response": str(e), "status": 500}, safe=False)


@csrf_exempt
@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def deleteCartProduct(request):
    try:
        data = json.loads(request.body.decode("utf-8"))
        productid = data.get("productid")
        new_quantity = data.get("quantity", 1)

        if not productid:
            return JsonResponse({"response": "Product ID not provided", "status": 400}, safe=False)

        user = request.user
        set_user_intrest_inc(user.username, productid, points=-0.7)
        existing_item = CartProduct.objects.filter(user=user, product_id=productid).first()
        if not existing_item:
            return JsonResponse({"response": "Item not found in cart", "status": 404}, safe=False)

        if existing_item.quantity <= new_quantity:
            existing_item.delete()
            return JsonResponse({"response": "Item removed from cart", "status": 200}, safe=False)

        existing_item.quantity -= new_quantity
        existing_item.save()
        return JsonResponse({"response": "Cart quantity updated", "status": 200}, safe=False)

    except Exception as e:
        return JsonResponse({"response": str(e), "status": 500}, safe=False)



