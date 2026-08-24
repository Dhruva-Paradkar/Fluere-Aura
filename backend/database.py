import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

if not MONGO_URI:
    raise RuntimeError("MONGO_URI is not configured")

if not DATABASE_NAME:
    raise RuntimeError("DATABASE_NAME is not configured")


client = MongoClient(
    MONGO_URI,
    serverSelectionTimeoutMS=5000
)

db = client[DATABASE_NAME]


# Collections
products_collection = db["products"]
orders_collection = db["orders"]
newsletters_collection = db["newsletters"]
wishlists_collection = db["wishlists"]
quiz_results_collection = db["quiz_results"]


def test_connection():
    try:
        client.admin.command("ping")
        print("MongoDB connection successful!")
        return True

    except Exception as error:
        print("MongoDB connection failed!")
        print(error)
        return False