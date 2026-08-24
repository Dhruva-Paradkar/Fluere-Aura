import os

from dotenv import load_dotenv
from pymongo import MongoClient


# Load variables from .env
load_dotenv()


# Get MongoDB settings
MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "fluere_aura")


# Make sure MONGO_URI exists
if not MONGO_URI:
    raise RuntimeError("MONGO_URI is not configured")


# Connect to MongoDB Atlas
client = MongoClient(
    MONGO_URI,
    serverSelectionTimeoutMS=10000
)


# Select database
database = client[DATABASE_NAME]


# Collections
products_collection = database["products"]
orders_collection = database["orders"]
newsletters_collection = database["newsletters"]
wishlists_collection = database["wishlists"]
quiz_results_collection = database["quiz_results"]


def test_connection():

    try:
        client.admin.command("ping")

        print("MongoDB connection successful!")

        return True

    except Exception as e:

        print("MongoDB connection failed!")
        print(e)

        return False