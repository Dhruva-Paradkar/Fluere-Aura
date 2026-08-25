const API_BASE_URL = "https://fluere-aura.onrender.com";

let products = [];

let cart = [];

let wishlist = new Set();

let activeCategory = "all";

let searchTerm = "";


// =========================================================
// SAFE HTML
// =========================================================

function escapeHtml(value) {

    return String(value ?? "")

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");
}


// =========================================================
// HEADER
// =========================================================

const header =
    document.getElementById("header");

const menuToggle =
    document.getElementById("menuToggle");

const navLinks =
    document.getElementById("navLinks");


window.addEventListener(
    "scroll",
    () => {

        if (window.scrollY > 30) {

            header.classList.add("scrolled");

        } else {

            header.classList.remove("scrolled");

        }

    }
);


menuToggle.addEventListener(
    "click",
    () => {

        navLinks.classList.toggle("open");

        menuToggle.textContent =
            navLinks.classList.contains("open")
                ? "×"
                : "☰";

    }
);


document
    .querySelectorAll(".nav-links a")
    .forEach(link => {

        link.addEventListener(
            "click",
            () => {

                navLinks.classList.remove("open");

                menuToggle.textContent = "☰";

            }
        );

    });


// =========================================================
// TOAST
// =========================================================

const toast =
    document.getElementById("toast");

let toastTimer;


function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(
        () => {

            toast.classList.remove("show");

        },
        2500
    );

}


// =========================================================
// PRODUCTS
// =========================================================

const productGrid =
    document.getElementById("productGrid");

const filterButtons =
    document.querySelectorAll(".filter-btn");

const productSearch =
    document.getElementById("productSearch");


async function loadProducts() {

    productGrid.innerHTML = `

        <div class="product-loading">

            Loading your Fluere Aura collection...

        </div>

    `;


    try {

        const response = await fetch(

            `${API_BASE_URL}/api/products`

        );


        if (!response.ok) {

            throw new Error(
                `Products API returned ${response.status}`
            );

        }


        products =
            await response.json();


        renderProducts();


    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );
        
        
        productGrid.innerHTML = `
        <div class="product-loading">
        
            <strong>
              Unable to load products.
            </strong>
            <br>
            Please try again later.
         </div>


        `;

    }

}


// =========================================================
// FILTER PRODUCTS
// =========================================================

function getFilteredProducts() {

    return products.filter(product => {

        const matchesCategory =

            activeCategory === "all"

            ||

            product.category === activeCategory;


        const searchableText = [

            product.name,

            product.category,

            product.display_category,

            product.description

        ]

            .filter(Boolean)

            .join(" ")

            .toLowerCase();


        const matchesSearch =

            !searchTerm

            ||

            searchableText.includes(
                searchTerm
            );


        return (

            matchesCategory

            &&

            matchesSearch

        );

    });

}


// =========================================================
// RENDER PRODUCTS
// =========================================================

function renderProducts() {

    const visibleProducts =
        getFilteredProducts();


    if (visibleProducts.length === 0) {

        productGrid.innerHTML = `

            <div class="product-loading">

                No products found.

                <br>

                Try another category or search term.

            </div>

        `;

        return;

    }


    productGrid.innerHTML =

        visibleProducts.map(product => {

            const id =
                escapeHtml(product.id);

            const name =
                escapeHtml(product.name);

            const category =
                escapeHtml(product.category);

            const displayCategory =
                escapeHtml(
                    product.display_category ||
                    product.category
                );

            const description =
                escapeHtml(
                    product.description || ""
                );

            const image =
                escapeHtml(
                    product.image || ""
                );


            const badge = product.badge

                ?

                `<span class="product-badge">
                    ${escapeHtml(product.badge)}
                 </span>`

                :

                "";


            const wished =
                wishlist.has(
                    String(product.id)
                );


            return `

                <article
                    class="product-card"
                    data-category="${category}"
                    data-name="${name}"
                >

                    <div class="product-image">

                        <img
                            src="${image}"
                            alt="${name}"
                            loading="lazy"
                        >

                        ${badge}

                        <button
                            class="wishlist ${
                                wished ? "active" : ""
                            }"
                            aria-label="Add to wishlist"
                            data-wishlist-id="${id}"
                        >
                            ${
                                wished
                                    ? "♥"
                                    : "♡"
                            }
                        </button>

                    </div>


                    <div class="product-info">

                        <span class="product-category">

                            ${displayCategory}

                        </span>


                        <h3>

                            ${name}

                        </h3>


                        <p>

                            ${description}

                        </p>


                        <div class="product-bottom">

                            <span class="price">

                                ₹${Number(
                                    product.price || 0
                                ).toFixed(2)}

                            </span>


                            <button
                                class="add-cart"
                                data-id="${id}"
                            >
                                +
                            </button>

                        </div>

                    </div>

                </article>

            `;

        }).join("");


    attachProductEvents();

}


// =========================================================
// PRODUCT BUTTONS
// =========================================================

function attachProductEvents() {

    document
        .querySelectorAll(".add-cart")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    addToCart(
                        button.dataset.id
                    );

                }
            );

        });


    document
        .querySelectorAll(".wishlist")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    toggleWishlist(
                        button.dataset.wishlistId
                    );

                }
            );

        });

}


// =========================================================
// FILTER BUTTONS
// =========================================================

filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            filterButtons.forEach(btn => {

                btn.classList.remove(
                    "active"
                );

            });


            button.classList.add(
                "active"
            );


            activeCategory =
                button.dataset.filter;


            renderProducts();

        }
    );

});


// =========================================================
// SEARCH
// =========================================================

productSearch.addEventListener(
    "input",
    () => {

        searchTerm =
            productSearch.value
                .toLowerCase()
                .trim();


        renderProducts();

    }
);


// =========================================================
// WISHLIST
// =========================================================

function toggleWishlist(productId) {

    const id =
        String(productId);


    if (wishlist.has(id)) {

        wishlist.delete(id);

        showToast(
            "Removed from your wishlist"
        );

    } else {

        wishlist.add(id);

        showToast(
            "Added to your wishlist ♡"
        );

    }


    renderProducts();

}


// =========================================================
// CART
// =========================================================

const cartBtn =
    document.getElementById("cartBtn");

const cartDrawer =
    document.getElementById("cartDrawer");

const cartOverlay =
    document.getElementById("cartOverlay");

const closeCart =
    document.getElementById("closeCart");

const cartItems =
    document.getElementById("cartItems");

const cartCount =
    document.getElementById("cartCount");

const cartTotal =
    document.getElementById("cartTotal");


function openCart() {

    cartDrawer.classList.add("open");

    cartOverlay.classList.add("open");

    document.body.style.overflow =
        "hidden";

}


function closeCartDrawer() {

    cartDrawer.classList.remove("open");

    cartOverlay.classList.remove("open");

    document.body.style.overflow = "";

}


cartBtn.addEventListener(
    "click",
    openCart
);


closeCart.addEventListener(
    "click",
    closeCartDrawer
);


cartOverlay.addEventListener(
    "click",
    closeCartDrawer
);


// =========================================================
// ADD TO CART
// =========================================================

function addToCart(productId) {

    const product = products.find(

        item =>
            String(item.id) ===
            String(productId)

    );


    if (!product) {

        showToast(
            "Product could not be found."
        );

        return;

    }


    if (Number(product.stock) <= 0) {

        showToast(
            "This product is currently out of stock."
        );

        return;

    }


    const existing =
        cart.find(

            item =>
                String(item.id) ===
                String(product.id)

        );


    if (existing) {

        if (
            existing.quantity >=
            Number(product.stock)
        ) {

            showToast(
                "You've reached the available stock."
            );

            return;

        }


        existing.quantity++;

    } else {

        cart.push({

            id:
                String(product.id),

            name:
                product.name,

            price:
                Number(product.price || 0),

            image:
                product.image || "",

            quantity:
                1

        });

    }


    updateCart();


    showToast(
        `${product.name} added to your bag ✦`
    );

}


// =========================================================
// UPDATE CART
// =========================================================

function updateCart() {

    if (cart.length === 0) {

        cartItems.innerHTML = `

            <div class="empty-cart">

                Your bag is waiting
                for something beautiful.

            </div>

        `;

    } else {

        cartItems.innerHTML =

            cart.map(item => `

                <div class="cart-item">

                    <img
                        src="${escapeHtml(item.image)}"
                        alt="${escapeHtml(item.name)}"
                    >


                    <div class="cart-item-info">

                        <h4>

                            ${escapeHtml(item.name)}

                        </h4>


                        <p>

                            ₹${item.price.toFixed(2)}

                        </p>


                        <div
                            class="cart-item-actions"
                        >

                            <div class="quantity">

                                <button
                                    onclick="changeQuantity(
                                        '${escapeHtml(item.id)}',
                                        -1
                                    )"
                                >
                                    −
                                </button>


                                <span>

                                    ${item.quantity}

                                </span>


                                <button
                                    onclick="changeQuantity(
                                        '${escapeHtml(item.id)}',
                                        1
                                    )"
                                >
                                    +
                                </button>

                            </div>


                            <button
                                class="remove-item"
                                onclick="removeItem(
                                    '${escapeHtml(item.id)}'
                                )"
                            >

                                Remove

                            </button>

                        </div>

                    </div>

                </div>

            `).join("");

    }


    const totalItems =
        cart.reduce(

            (sum, item) =>
                sum + item.quantity,

            0

        );


    const totalPrice =
        cart.reduce(

            (sum, item) =>
                sum +
                item.price *
                item.quantity,

            0

        );


    cartCount.textContent =
        totalItems;


    cartTotal.textContent =
        `₹${totalPrice.toFixed(2)}`;

}


// =========================================================
// QUANTITY
// =========================================================

function changeQuantity(id, amount) {

    const item =
        cart.find(

            item =>
                String(item.id) ===
                String(id)

        );


    if (!item) {

        return;

    }


    const product =
        products.find(

            product =>
                String(product.id) ===
                String(id)

        );


    const maxStock =
        product
            ? Number(product.stock)
            : Infinity;


    item.quantity += amount;


    if (
        item.quantity >
        maxStock
    ) {

        item.quantity =
            maxStock;

        showToast(
            "You've reached the available stock."
        );

    }


    if (
        item.quantity <= 0
    ) {

        cart =
            cart.filter(

                item =>
                    String(item.id) !==
                    String(id)

            );

    }


    updateCart();

}


function removeItem(id) {

    cart =
        cart.filter(

            item =>
                String(item.id) !==
                String(id)

        );


    updateCart();


    showToast(
        "Item removed from your bag"
    );

}


window.changeQuantity =
    changeQuantity;

window.removeItem =
    removeItem;


// =========================================================
// HAIR QUIZ
// =========================================================

const quizSteps =
    document.querySelectorAll(
        ".quiz-step"
    );

const quizResult =
    document.getElementById(
        "quizResult"
    );

const resultTitle =
    document.getElementById(
        "resultTitle"
    );

const resultText =
    document.getElementById(
        "resultText"
    );


let quizAnswers = [];

let currentStep = 0;


document
    .querySelectorAll(".quiz-option")
    .forEach(option => {

        option.addEventListener(
            "click",
            () => {

                const step =
                    option.closest(
                        ".quiz-step"
                    );


                step
                    .querySelectorAll(
                        ".quiz-option"
                    )
                    .forEach(btn => {

                        btn.classList.remove(
                            "selected"
                        );

                    });


                option.classList.add(
                    "selected"
                );


                quizAnswers[
                    currentStep
                ] =
                    option.dataset.value;


                setTimeout(
                    () => {

                        currentStep++;


                        if (
                            currentStep <
                            quizSteps.length
                        ) {

                            quizSteps.forEach(
                                step => {

                                    step.classList.remove(
                                        "active"
                                    );

                                }
                            );


                            quizSteps[
                                currentStep
                            ].classList.add(
                                "active"
                            );

                        } else {

                            showQuizResult();

                        }

                    },
                    300
                );

            }
        );

    });


function showQuizResult() {

    quizSteps.forEach(
        step => {

            step.classList.remove(
                "active"
            );

        }
    );


    quizResult.classList.add(
        "show"
    );


    const hairType =
        quizAnswers[0];

    const goal =
        quizAnswers[1];


    if (
        hairType === "dry" ||
        goal === "moisture"
    ) {

        resultTitle.textContent =
            "Your hair is craving hydration.";


        resultText.textContent =
            "Start with a nourishing oil or deep-conditioning mask and keep your routine focused on moisture.";

    }

    else if (
        hairType === "damaged" ||
        goal === "strength"
    ) {

        resultTitle.textContent =
            "Your ritual should focus on repair.";


        resultText.textContent =
            "Try a nourishing mask and a gentle wash routine designed to give fragile strands extra care.";

    }

    else if (
        goal === "scalp" ||
        hairType === "oily"
    ) {

        resultTitle.textContent =
            "Let's give your scalp some love.";


        resultText.textContent =
            "A lightweight scalp serum and gentle cleansing ritual can be a beautiful starting point.";

    }

    else {

        resultTitle.textContent =
            "You're ready for your glow ritual.";


        resultText.textContent =
            "Keep things balanced with gentle cleansing, lightweight hydration and a touch of shine serum.";

    }


    saveQuizResult();

}


// =========================================================
// SAVE QUIZ
// =========================================================

async function saveQuizResult() {

    try {

        await fetch(

            `${API_BASE_URL}/api/quiz-results`,

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    hair_type:
                        quizAnswers[0] ||
                        null,

                    goal:
                        quizAnswers[1] ||
                        null

                })

            }

        );

    } catch (error) {

        console.warn(
            "Quiz result was not saved:",
            error
        );

    }

}


// =========================================================
// NEWSLETTER
// =========================================================

const newsletterForm =
    document.getElementById(
        "newsletterForm"
    );


newsletterForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const email =
            document
                .getElementById(
                    "emailInput"
                )
                .value
                .trim();


        if (!email) {

            return;

        }


        try {

            const response =
                await fetch(

                    `${API_BASE_URL}/api/newsletter`,

                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({
                                email
                            })

                    }

                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Subscription failed"
                );

            }


            showToast(

                data.message ||
                "Welcome to The Aura Letter ✦"

            );


            newsletterForm.reset();


        } catch (error) {

            console.error(
                "Newsletter error:",
                error
            );


            showToast(
                "Unable to subscribe right now."
            );

        }

    }
);


// =========================================================
// CHECKOUT
// =========================================================

const checkoutBtn =
    document.getElementById(
        "checkoutBtn"
    );


checkoutBtn.addEventListener(
    "click",
    async () => {

        if (cart.length === 0) {

            showToast(
                "Your ritual bag is empty."
            );

            return;

        }


        const customerName =
            prompt(
                "Enter your name:"
            );


        if (
            !customerName ||
            !customerName.trim()
        ) {

            return;

        }


        const customerEmail =
            prompt(
                "Enter your email:"
            );


        if (
            !customerEmail ||
            !customerEmail.trim()
        ) {

            return;

        }


        const customerPhone =
            prompt(
                "Enter your phone number:"
            );


        if (
            !customerPhone ||
            !customerPhone.trim()
        ) {

            return;

        }


        const shippingAddress =
            prompt(
                "Enter your delivery address:"
            );


        if (
            !shippingAddress ||
            !shippingAddress.trim()
        ) {

            return;

        }


        const orderItems =
            cart.map(item => ({

                product_id:
                    item.id,

                quantity:
                    item.quantity

            }));


        const payload = {

            customer_name:
                customerName.trim(),

            email:
                customerEmail.trim(),

            phone:
                customerPhone.trim(),

            address:
                shippingAddress.trim(),

            items:
                orderItems

        };


        try {

            checkoutBtn.disabled =
                true;


            const response =
                await fetch(

                    `${API_BASE_URL}/api/orders`,

                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                payload
                            )

                    }

                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Order creation failed"
                );

            }


            showToast(

                `Order ${data.order_id} created successfully ✦`

            );


            cart = [];


            updateCart();


            closeCartDrawer();


        } catch (error) {

            console.error(
                "Checkout error:",
                error
            );


            showToast(

                error.message ||
                "Unable to create the order."

            );


        } finally {

            checkoutBtn.disabled =
                false;

        }

    }
);


// =========================================================
// SEARCH BUTTON
// =========================================================

const searchBtn =
    document.getElementById(
        "searchBtn"
    );


searchBtn.addEventListener(
    "click",
    () => {

        document
            .getElementById(
                "products"
            )
            .scrollIntoView({

                behavior:
                    "smooth"

            });


        setTimeout(
            () => {

                productSearch.focus();

            },
            700
        );

    }
);


// =========================================================
// START APPLICATION
// =========================================================

updateCart();

loadProducts();