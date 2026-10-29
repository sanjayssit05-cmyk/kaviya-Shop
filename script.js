const products = [
  { id: 1, name: "Alphonso mangoes", category: "Fruits", detail: "Sweet, sunny & totally worth it · 2 pcs", price: 149, badge: "IN SEASON", bg: "#fff0d4", accent: "#df9a31", image: "photo-1553279768-865429fa0078" },
  { id: 2, name: "Avocado", category: "Fruits", detail: "Creamy Hass · 1 pc", price: 89, badge: "FARM PICK", bg: "#e7efd9", accent: "#5c8a47", image: "photo-1523049673857-eb18f1d7b578" },
  { id: 3, name: "Baby spinach", category: "Vegetables", detail: "Tender local leaves · 200 g", price: 45, badge: "JUST PICKED", bg: "#e2efde", accent: "#43815a", image: "photo-1576045057995-568f588f82fb" },
  { id: 4, name: "Heirloom tomatoes", category: "Vegetables", detail: "Juicy & sun-ripened · 500 g", price: 65, badge: "LOCAL LOVE", bg: "#f8e5da", accent: "#d6614e", image: "photo-1546094096-0df4bcaaa337" },
  { id: 5, name: "Farm fresh eggs", category: "Dairy", detail: "Free-range, happy hens · 6 pcs", price: 78, badge: "FREE RANGE", bg: "#f2ecd9", accent: "#b99b52", image: "photo-1518569656558-1f25e69d93d7" },
  { id: 6, name: "Sourdough loaf", category: "Bakery", detail: "Slow fermented & crusty · 400 g", price: 120, badge: "BAKED TODAY", bg: "#f1e4d5", accent: "#b47948", image: "photo-1509440159596-0249088772ff" },
  { id: 7, name: "Creamy peanut butter", category: "Pantry", detail: "Just peanuts, nothing else · 250 g", price: 165, badge: "NO NASTIES", bg: "#eee3d7", accent: "#9b6845", image: "photo-1587049352851-8d4e89133924" },
  { id: 8, name: "Sea salt popcorn", category: "Snacks", detail: "Light, crunchy & lovely · 100 g", price: 55, badge: "FEEL-GOOD", bg: "#f4eed2", accent: "#c5a73d", image: "photo-1578849278619-e73505e9610f" },
  { id: 9, name: "Sweet strawberries", category: "Fruits", detail: "Bright, juicy berries · 250 g", price: 110, badge: "BERRY GOOD", bg: "#f5e1df", accent: "#c75d69", image: "photo-1464965911861-746a04b4bca6" },
  { id: 10, name: "Green garden peas", category: "Vegetables", detail: "Freshly shelled · 250 g", price: 52, badge: "FRESH PICK", bg: "#e6eedb", accent: "#62874d", image: "photo-1587735243615-c03f25aaff15" },
  { id: 11, name: "Whole milk", category: "Dairy", detail: "Creamy goodness · 500 ml", price: 36, badge: "FARM FRESH", bg: "#e8eef0", accent: "#6794a2", image: "photo-1563636619-e9143da7973b" },
  { id: 12, name: "Butter croissant", category: "Bakery", detail: "Flaky, buttery layers · 2 pcs", price: 95, badge: "BAKED TODAY", bg: "#f4e9d8", accent: "#d39a45", image: "photo-1555507036-ab1f4038808a" },
];

const productGrid = document.querySelector("#productGrid");
const searchInput = document.querySelector("#searchInput");
const categoryList = document.querySelector("#categoryList");
const sortSelect = document.querySelector("#sortSelect");
const resultsCount = document.querySelector("#resultsCount");
const emptyState = document.querySelector("#emptyState");
const cartDrawer = document.querySelector("#cartDrawer");
const drawerBackdrop = document.querySelector("#drawerBackdrop");
const cartItems = document.querySelector("#cartItems");
const cartEmpty = document.querySelector("#cartEmpty");
const cartFooter = document.querySelector("#cartFooter");
const toast = document.querySelector("#toast");
const currency = new Intl.NumberFormat("en-IN");
const liveDateTime = document.querySelector("#liveDateTime");
const menuToggle = document.querySelector("#menuToggle");
const headerMenu = document.querySelector("#headerMenu");
const imageFallback = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=80";
const revealObserver = "IntersectionObserver" in window
  ? new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 })
  : null;

let activeCategory = "All";
let cart = new Map();
let toastTimer;
const indiaDateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});

function updateLiveDateTime() {
  const now = new Date();
  liveDateTime.dateTime = now.toISOString();
  liveDateTime.textContent = `${indiaDateTimeFormatter.format(now)} IST`;
}
const categoryTrack = document.querySelector("#categoryTrack");
const categoryCards = [...categoryTrack.children];

categoryCards.forEach((card) => {
  const clone = card.cloneNode(true);
  clone.dataset.clone = "true";
  clone.setAttribute("aria-hidden", "true");
  clone.tabIndex = -1;
  clone.querySelector("img").loading = "eager";
  categoryTrack.append(clone);
});

try {
  const savedCart = JSON.parse(localStorage.getItem("freshcart-basket") || "[]");
  if (Array.isArray(savedCart)) {
    cart = new Map(savedCart.filter(([id, quantity]) =>
      products.some((product) => product.id === id) &&
      Number.isInteger(quantity) &&
      quantity > 0
    ));
  }
} catch (error) {
  console.warn("Could not restore the saved basket.", error);
}

function formatPrice(price) {
  return `₹${currency.format(price)}`;
}

function renderProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const visibleProducts = products
    .filter((product) => activeCategory === "All" || product.category === activeCategory)
    .filter((product) => `${product.name} ${product.category} ${product.detail}`.toLocaleLowerCase().includes(query))
    .sort((a, b) => {
      if (sortSelect.value === "price-low") return a.price - b.price;
      if (sortSelect.value === "price-high") return b.price - a.price;
      return a.id - b.id;
    });

  resultsCount.textContent = `${visibleProducts.length} fresh ${visibleProducts.length === 1 ? "find" : "finds"}`;
  emptyState.hidden = visibleProducts.length > 0;
  productGrid.innerHTML = visibleProducts.map((product, index) => `
    <article class="product-card scroll-reveal" style="--product-bg: ${product.bg}; --card-tint: ${product.bg}; --card-accent: ${product.accent}; --reveal-delay: ${Math.min(index, 7) * 55}ms">
      <div class="product-visual">
        <span class="product-badge">${product.badge}</span>
        <img class="product-photo" src="https://images.unsplash.com/${product.image}?auto=format&amp;fit=crop&amp;w=700&amp;q=85" alt="${product.name}" loading="lazy" decoding="async">
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3>${product.name}</h3>
        <span class="product-detail">${product.detail}</span>
        <div class="product-bottom">
          <span class="product-price">${formatPrice(product.price)}<small>/ pack</small></span>
          <button class="add-button" type="button" data-add="${product.id}">Add to basket</button>
        </div>
      </div>
    </article>
  `).join("");
  if (revealObserver) {
    productGrid.querySelectorAll(".scroll-reveal").forEach((card) => revealObserver.observe(card));
  } else {
    productGrid.querySelectorAll(".scroll-reveal").forEach((card) => card.classList.add("is-visible"));
  }
}

function renderCart() {
  const entries = [...cart.entries()]
    .map(([id, quantity]) => ({ product: products.find((item) => item.id === id), quantity }))
    .filter((entry) => entry.product);
  const itemCount = entries.reduce((sum, entry) => sum + entry.quantity, 0);
  const subtotal = entries.reduce((sum, entry) => sum + entry.product.price * entry.quantity, 0);

  document.querySelector("#cartCount").textContent = itemCount;
  document.querySelector("#drawerItemCount").textContent = `(${itemCount})`;
  document.querySelector("#cartSubtotal").textContent = formatPrice(subtotal);
  cartItems.innerHTML = entries.map(({ product, quantity }) => `
    <article class="cart-row">
      <img class="cart-row-photo" src="https://images.unsplash.com/${product.image}?auto=format&amp;fit=crop&amp;w=140&amp;h=140&amp;q=75" alt="" loading="lazy">
      <div>
        <h3>${product.name}</h3>
        <small>${formatPrice(product.price)} / pack</small>
        <div class="quantity-control" aria-label="Quantity for ${product.name}">
          <button type="button" data-quantity="${product.id}" data-change="-1" aria-label="Remove one ${product.name}">Remove one</button>
          <span>${quantity}</span>
          <button type="button" data-quantity="${product.id}" data-change="1" aria-label="Add one ${product.name}">Add one</button>
        </div>
      </div>
      <span class="cart-row-total">${formatPrice(product.price * quantity)}</span>
    </article>
  `).join("");

  cartEmpty.classList.toggle("visible", itemCount === 0);
  cartFooter.hidden = itemCount === 0;
  const amountLeft = Math.max(499 - subtotal, 0);
  document.querySelector("#deliveryMessage").textContent = amountLeft
    ? `You're ${formatPrice(amountLeft)} away from free delivery`
    : "Lovely! Your delivery is on us.";
  document.querySelector("#deliveryProgress").style.width = `${Math.min(subtotal / 499 * 100, 100)}%`;

  try {
    localStorage.setItem("freshcart-basket", JSON.stringify([...cart]));
  } catch (error) {
    console.warn("Could not save the basket.", error);
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function setDrawerOpen(isOpen) {
  cartDrawer.classList.toggle("open", isOpen);
  drawerBackdrop.classList.toggle("open", isOpen);
  cartDrawer.setAttribute("aria-hidden", String(!isOpen));
  document.body.classList.toggle("drawer-open", isOpen);
  if (isOpen) document.querySelector("#closeDrawer").focus();
}

function setMenuOpen(isOpen) {
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  headerMenu.classList.toggle("open", isOpen);
}

menuToggle.addEventListener("click", () => {
  setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
});
headerMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuOpen(false));
});

categoryList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  categoryList.querySelectorAll(".category-card").forEach((category) => {
    const isActive = category.dataset.category === activeCategory;
    category.classList.toggle("active", isActive);
    category.setAttribute("aria-pressed", String(isActive));
  });
  renderProducts();
});

searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);

productGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  if (addButton) {
    const id = Number(addButton.dataset.add);
    cart.set(id, (cart.get(id) || 0) + 1);
    renderCart();
    showToast(`${products.find((product) => product.id === id).name} added to your basket`);
  }
});

productGrid.addEventListener("error", (event) => {
const image = event.target;
if (!image.matches(".product-photo") || image.dataset.fallbackApplied) return;
image.dataset.fallbackApplied = "true";
image.src = imageFallback;
}, true);

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-quantity]");
  if (!button) return;
  const id = Number(button.dataset.quantity);
  const quantity = (cart.get(id) || 0) + Number(button.dataset.change);
  if (quantity > 0) cart.set(id, quantity);
  else cart.delete(id);
  renderCart();
});

document.querySelector("#cartButton").addEventListener("click", () => setDrawerOpen(true));
document.querySelector("#closeDrawer").addEventListener("click", () => setDrawerOpen(false));
document.querySelector("#continueShopping").addEventListener("click", () => setDrawerOpen(false));
drawerBackdrop.addEventListener("click", () => setDrawerOpen(false));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setDrawerOpen(false);
    setMenuOpen(false);
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  }
});

document.querySelector("#allCategories").addEventListener("click", () => {
  categoryList.querySelector('.category-card[data-category="All"]:not([data-clone])').click();
  categoryList.scrollIntoView({ behavior: "smooth", block: "center" });
});

document.querySelector("#newsletterForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const emailInput = document.querySelector("#emailInput");
  if (!emailInput.reportValidity()) return;
  showToast("You're on the list! Fresh notes coming your way.");
  event.currentTarget.reset();
});

document.querySelector("#customerOrderForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;

  const customerName = document.querySelector("#customerName").value.trim();
  const customerPhone = document.querySelector("#customerPhone").value.trim();
  const customerAddress = document.querySelector("#customerAddress").value.trim();
  if (!customerName || !customerPhone || !customerAddress) return;

  const orderLines = [...cart.entries()]
    .map(([id, quantity]) => {
      const product = products.find((item) => item.id === id);
      return product ? `• ${product.name} × ${quantity} — ${formatPrice(product.price * quantity)}` : null;
    })
    .filter(Boolean);
  const subtotal = [...cart.entries()].reduce((sum, [id, quantity]) => {
    const product = products.find((item) => item.id === id);
    return sum + (product ? product.price * quantity : 0);
  }, 0);
  const message = [
    "Hi Kaviya Sri Mart! I'd like to place this order:",
    "",
    `Customer name: ${customerName}`,
    `Mobile number: ${customerPhone}`,
    `Delivery address: ${customerAddress}`,
    "",
    ...orderLines,
    "",
    `Subtotal: ${formatPrice(subtotal)}`,
    `Order placed: ${indiaDateTimeFormatter.format(new Date())} IST`,
    "Please confirm availability and delivery details.",
  ].join("\n");
  const whatsappUrl = `https://wa.me/919943376885?text=${encodeURIComponent(message)}`;
  const orderWindow = window.open(whatsappUrl, "_blank");
  if (!orderWindow) {
    window.location.assign(whatsappUrl);
  } else {
    orderWindow.opener = null;
  }
});

document.querySelectorAll(".category-card, .instagram-copy, .instagram-tile, .promise-banner, .business-card, .newsletter").forEach((element) => {
  element.classList.add("scroll-reveal");
  if (revealObserver) revealObserver.observe(element);
  else element.classList.add("is-visible");
});

renderProducts();
renderCart();
updateLiveDateTime();
window.setInterval(updateLiveDateTime, 1000);
