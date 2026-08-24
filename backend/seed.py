from database import products_collection


print("SEED FILE STARTED")


products = [

    {
        "product_id": "1",
        "name": "Golden Growth Hair Oil",
        "category": "oil",
        "display_category": "Hair Oil",
        "description": "Rosemary, argan and jojoba oils for a nourishing scalp ritual.",
        "price": 280,
        "image": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=700&q=80",
        "badge": "Bestseller",
        "stock": 100,
        "active": True
    },

    {
        "product_id": "2",
        "name": "Botanical Balance Shampoo",
        "category": "shampoo",
        "display_category": "Shampoo",
        "description": "A gentle cleansing shampoo with aloe and green tea.",
        "price": 240,
        "image": "https://images.unsplash.com/photo-1556229010-aa3f7ff66b24?auto=format&fit=crop&w=700&q=80",
        "badge": "New",
        "stock": 100,
        "active": True
    },

    {
        "product_id": "3",
        "name": "Silk & Honey Hair Mask",
        "category": "mask",
        "display_category": "Hair Mask",
        "description": "Rich hydration for dry, dull and overworked strands.",
        "price": 310,
        "image": "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=700&q=80",
        "badge": "",
        "stock": 100,
        "active": True
    },

    {
        "product_id": "4",
        "name": "Aura Scalp Serum",
        "category": "serum",
        "display_category": "Scalp Serum",
        "description": "A lightweight botanical serum for a refreshed scalp.",
        "price": 320,
        "image": "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=700&q=80",
        "badge": "Favorite",
        "stock": 100,
        "active": True
    },

    {
        "product_id": "5",
        "name": "Coconut Cloud Hair Oil",
        "category": "oil",
        "display_category": "Hair Oil",
        "description": "Softening coconut and vitamin-rich oils for glossy hair.",
        "price": 260,
        "image": "https://images.unsplash.com/photo-1611073766325-7a5f7a0e4d0c?auto=format&fit=crop&w=700&q=80",
        "badge": "",
        "stock": 100,
        "active": True
    },

    {
        "product_id": "6",
        "name": "Rosemary Ritual Shampoo",
        "category": "shampoo",
        "display_category": "Shampoo",
        "description": "A refreshing everyday cleanse with rosemary botanical extracts.",
        "price": 250,
        "image": "https://images.unsplash.com/photo-1631390179406-2c99e7d8e9c1?auto=format&fit=crop&w=700&q=80",
        "badge": "",
        "stock": 100,
        "active": True
    },

    {
        "product_id": "7",
        "name": "Avocado Deep Repair Mask",
        "category": "mask",
        "display_category": "Hair Mask",
        "description": "A creamy treatment designed for thirsty, fragile strands.",
        "price": 290,
        "image": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=700&q=80",
        "badge": "",
        "stock": 100,
        "active": True
    },

    {
        "product_id": "8",
        "name": "Gloss Veil Serum",
        "category": "serum",
        "display_category": "Serum",
        "description": "Lightweight shine and smoothing without a heavy finish.",
        "price": 270,
        "image": "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=700&q=80",
        "badge": "New",
        "stock": 100,
        "active": True
    }

]


print("PRODUCT DATA CREATED")


# WARNING:
# This removes all existing documents from the products collection.
products_collection.delete_many({})

print("OLD PRODUCTS DELETED")


result = products_collection.insert_many(products)


print(
    f"{len(result.inserted_ids)} products inserted successfully."
)