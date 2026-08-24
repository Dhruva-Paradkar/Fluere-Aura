from datetime import datetime, timezone
from typing import List

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from bson import ObjectId

from database import (
    products_collection,
    orders_collection,
    newsletters_collection,
    wishlists_collection,
    quiz_results_collection
)


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="Fluere Aura API",
    description="Backend API for Fluere Aura haircare store",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# PYDANTIC MODELS
# =========================================================

class NewsletterRequest(BaseModel):

    email: str = Field(
        min_length=3,
        max_length=255
    )


class QuizResultRequest(BaseModel):

    hair_type: str | None = None

    goal: str | None = None


class OrderItem(BaseModel):

    product_id: str

    quantity: int = Field(
        gt=0
    )


class OrderRequest(BaseModel):

    customer_name: str = Field(
        min_length=2,
        max_length=120
    )

    email: str = Field(
        min_length=3,
        max_length=255
    )

    phone: str = Field(
        min_length=5,
        max_length=30
    )

    address: str = Field(
        min_length=5,
        max_length=500
    )

    items: List[OrderItem]


# =========================================================
# PRODUCT SERIALIZER
# =========================================================

def serialize_product(product):

    return {

        "id": product.get("product_id"),

        "name": product.get("name"),

        "category": product.get("category"),

        "display_category":
            product.get("display_category"),

        "description":
            product.get("description"),

        "price":
            product.get("price", 0),

        "image":
            product.get("image"),

        "badge":
            product.get("badge"),

        "stock":
            product.get("stock", 0)

    }


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {
        "message": "Fluere Aura API is running"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/api/health")
def health():

    try:

        from database import client

        client.admin.command("ping")

        return {

            "status": "ok",

            "database": "connected"

        }

    except Exception:

        return {

            "status": "error",

            "database": "disconnected"

        }


# =========================================================
# GET ALL PRODUCTS
# =========================================================

@app.get("/api/products")
def get_products(

    category: str | None = Query(
        default=None
    ),

    search: str | None = Query(
        default=None
    )

):

    query = {

        "active": True

    }


    # CATEGORY FILTER

    if category and category != "all":

        query["category"] = category


    # SEARCH

    if search:

        query["$or"] = [

            {
                "name": {
                    "$regex": search,
                    "$options": "i"
                }
            },

            {
                "description": {
                    "$regex": search,
                    "$options": "i"
                }
            },

            {
                "category": {
                    "$regex": search,
                    "$options": "i"
                }
            }

        ]


    products = products_collection.find(query)


    return [

        serialize_product(product)

        for product in products

    ]


# =========================================================
# GET ONE PRODUCT
# =========================================================

@app.get("/api/products/{product_id}")
def get_product(product_id: str):

    product = products_collection.find_one({

        "product_id": product_id,

        "active": True

    })


    if not product:

        raise HTTPException(

            status_code=404,

            detail="Product not found"

        )


    return serialize_product(product)


# =========================================================
# NEWSLETTER
# =========================================================

@app.post("/api/newsletter")
def subscribe_newsletter(
    data: NewsletterRequest
):

    email = data.email.strip().lower()


    existing = newsletters_collection.find_one({

        "email": email

    })


    if existing:

        return {

            "message":
                "You're already subscribed to The Aura Letter ✦"

        }


    newsletters_collection.insert_one({

        "email": email,

        "created_at":
            datetime.now(timezone.utc)

    })


    return {

        "message":
            "Welcome to The Aura Letter ✦"

    }


# =========================================================
# QUIZ RESULTS
# =========================================================

@app.post("/api/quiz-results")
def save_quiz_result(
    data: QuizResultRequest
):

    result = {

        "hair_type":
            data.hair_type,

        "goal":
            data.goal,

        "created_at":
            datetime.now(timezone.utc)

    }


    quiz_results_collection.insert_one(result)


    return {

        "message":
            "Quiz result saved"

    }


# =========================================================
# CREATE ORDER
# =========================================================

@app.post("/api/orders")
def create_order(
    data: OrderRequest
):

    if not data.items:

        raise HTTPException(

            status_code=400,

            detail="Your cart is empty."

        )


    order_lines = []

    total = 0.0


    # =====================================================
    # CHECK PRODUCTS AND STOCK
    # =====================================================

    for item in data.items:

        product = products_collection.find_one({

            "product_id":
                item.product_id,

            "active":
                True

        })


        if not product:

            raise HTTPException(

                status_code=404,

                detail=
                    f"Product {item.product_id} was not found."

            )


        stock = int(
            product.get(
                "stock",
                0
            )
        )


        if item.quantity > stock:

            raise HTTPException(

                status_code=400,

                detail=(
                    f"Not enough stock for "
                    f"{product.get('name', 'this product')}."
                )

            )


        price = float(
            product.get(
                "price",
                0
            )
        )


        line_total = (
            price *
            item.quantity
        )


        total += line_total


        order_lines.append({

            "product_id":
                product.get("product_id"),

            "name":
                product.get("name"),

            "price":
                price,

            "quantity":
                item.quantity,

            "line_total":
                line_total

        })


    # =====================================================
    # CREATE ORDER DOCUMENT
    # =====================================================

    order_document = {

        "customer": {

            "name":
                data.customer_name.strip(),

            "email":
                data.email.strip().lower(),

            "phone":
                data.phone.strip(),

            "address":
                data.address.strip()

        },

        "items":
            order_lines,

        "total":
            round(total, 2),

        "status":
            "pending",

        "created_at":
            datetime.now(timezone.utc)

    }


    result = orders_collection.insert_one(
        order_document
    )


    # =====================================================
    # REDUCE PRODUCT STOCK
    # =====================================================

    for item in data.items:

        products_collection.update_one(

            {
                "product_id":
                    item.product_id,

                "active":
                    True
            },

            {
                "$inc": {

                    "stock":
                        -item.quantity

                }

            }

        )


    return {

        "message":
            "Order created successfully",

        "order_id":
            str(result.inserted_id),

        "total":
            round(total, 2)

    }


# =========================================================
# GET ORDER
# =========================================================

@app.get("/api/orders/{order_id}")
def get_order(order_id: str):

    try:

        object_id = ObjectId(order_id)

    except Exception:

        raise HTTPException(

            status_code=400,

            detail="Invalid order ID"

        )


    order = orders_collection.find_one({

        "_id":
            object_id

    })


    if not order:

        raise HTTPException(

            status_code=404,

            detail="Order not found"

        )


    order["id"] = str(
        order.pop("_id")
    )


    return order