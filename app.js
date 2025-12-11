(() => {
  const cartBtn = document.getElementById('cartBtn');
  const cartCount = document.getElementById('cartCount');
  const cartFab = document.getElementById('cartFab');
  const cartFabCount = document.getElementById('cartFabCount');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartPanel = document.getElementById('cartPanel');
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartClear = document.getElementById('cartClear');
  const cartSelectAll = document.getElementById('cartSelectAll');
  const backToTop = document.getElementById('backToTop');
  const addToast = document.getElementById('addToast');
  let toastTimer;

  let items = [];

  function loadCartFromStorage() {
    try {
      const raw = localStorage.getItem('cartItems');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        items = parsed
          .filter((it) => it && typeof it.name === 'string' && typeof it.price === 'number')
          .map((it) => ({
            name: it.name,
            price: it.price,
            qty: Math.max(1, Number(it.qty) || 1),
            checked: it.checked !== false,
          }));
      }
    } catch (err) {
      console.error('Failed to load cart from storage', err);
    }
  }

  function parsePrice(text) {
    const num = parseFloat(text.replace(/[^\d.]/g, '')) || 0;
    return num;
  }

  function formatPrice(num) {
    return `₱${num.toFixed(2).replace(/\.00$/, '')}`;
  }

  function renderCart() {
    cartItemsEl.innerHTML = '';
    let total = 0;
    let checkedCount = 0;
    items.forEach((item, idx) => {
      if (item.checked) {
        total += item.price * item.qty;
        checkedCount += 1;
      }
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <input type="checkbox" class="cart-checkbox" data-idx="${idx}" ${item.checked ? 'checked' : ''} aria-label="Select ${item.name}">
        <div class="cart-item-main">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">${formatPrice(item.price)} each</div>
        </div>
        <div class="cart-item-actions">
          <div class="qty-control" data-idx="${idx}">
            <button class="qty-btn qty-minus" type="button">-</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn qty-plus" type="button">+</button>
          </div>
          <button class="cart-item-remove" aria-label="Remove ${item.name}" data-idx="${idx}">×</button>
        </div>
      `;
      cartItemsEl.appendChild(row);
    });
    cartTotalEl.textContent = formatPrice(total);
    const totalQty = items.reduce((sum, it) => sum + it.qty, 0);
    if (cartCount) cartCount.textContent = totalQty;
    if (cartFabCount) cartFabCount.textContent = totalQty;
    cartSelectAll.checked = items.length > 0 && checkedCount === items.length;
    try {
      localStorage.setItem('cartItems', JSON.stringify(items));
    } catch (err) {
      console.error('Failed to save cart', err);
    }
  }

  function openCart() {
    cartOverlay.hidden = false;
    cartPanel.hidden = false;
    requestAnimationFrame(() => {
      cartPanel.classList.add('open');
    });
  }

  function closeCart() {
    cartPanel.classList.remove('open');
    cartOverlay.hidden = true;
    cartPanel.hidden = true;
  }

  function attachAddButtons() {
    const addButtons = document.querySelectorAll('.store-add');
    addButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.store-card');
        const nameEl = card.querySelector('.store-name');
        const priceEl = card.querySelector('.store-price');
        if (!nameEl || !priceEl) return;
        const name = nameEl.textContent.trim();
        const price = parsePrice(priceEl.textContent);
        const existing = items.find((i) => i.name === name && i.price === price);
        if (existing) {
          existing.qty += 1;
        } else {
          items.push({
            name,
            price,
            qty: 1,
            checked: true,
          });
        }
        renderCart();
        showToast(`${name} added to cart`);
      });
    });
  }

  function attachStoreCardNavigation() {
    const cards = document.querySelectorAll('.store-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const target = new URL(card.dataset.link || 'product.html', window.location.href);
        const img = card.dataset.image;
        const priceText = card.dataset.price || card.querySelector('.store-price')?.textContent || '';
        const priceValue = parsePrice(priceText);
        if (img) {
          target.searchParams.set('img', img);
        }
        if (!Number.isNaN(priceValue) && priceValue > 0) {
          target.searchParams.set('price', priceValue.toString());
        }
        window.location.href = target.toString();
      });
    });
  }

  function attachPickButtons() {
    const pickButtons = document.querySelectorAll('.picks-list .add-btn');
    pickButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pick = btn.closest('.pick');
        const nameEl = pick.querySelector('.pick-name');
        const priceEl = pick.querySelector('.pick-price');
        if (!nameEl || !priceEl) return;
        const name = nameEl.textContent.trim();
        const price = parsePrice(priceEl.textContent);
        const existing = items.find((i) => i.name === name && i.price === price);
        if (existing) {
          existing.qty += 1;
        } else {
          items.push({
            name,
            price,
            qty: 1,
            checked: true,
          });
        }
        renderCart();
        showToast(`${name} added to cart`);
      });
    });
  }

  function showToast(message) {
    if (!addToast) return;
    addToast.textContent = message || 'Food added to cart';
    addToast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      addToast.classList.remove('visible');
    }, 1800);
  }

  cartBtn?.addEventListener('click', () => {
    openCart();
  });
  cartFab?.addEventListener('click', () => {
    openCart();
  });

  cartOverlay?.addEventListener('click', closeCart);
  document.querySelector('.cart-close')?.addEventListener('click', closeCart);

  cartItemsEl?.addEventListener('click', (e) => {
    const target = e.target;
    if (target.classList.contains('cart-item-remove')) {
      const idx = Number(target.getAttribute('data-idx'));
      if (!Number.isNaN(idx)) {
        items.splice(idx, 1);
        renderCart();
      }
    }
    if (target.classList.contains('qty-minus')) {
      const idx = Number(target.closest('.qty-control')?.getAttribute('data-idx'));
      if (!Number.isNaN(idx) && items[idx]) {
        items[idx].qty = Math.max(1, items[idx].qty - 1);
        renderCart();
      }
    }
    if (target.classList.contains('qty-plus')) {
      const idx = Number(target.closest('.qty-control')?.getAttribute('data-idx'));
      if (!Number.isNaN(idx) && items[idx]) {
        items[idx].qty += 1;
        renderCart();
      }
    }
  });

  cartItemsEl?.addEventListener('change', (e) => {
    const target = e.target;
    if (target.classList.contains('cart-checkbox')) {
      const idx = Number(target.getAttribute('data-idx'));
      if (!Number.isNaN(idx) && items[idx]) {
        items[idx].checked = target.checked;
        renderCart();
      }
    }
  });

  cartClear?.addEventListener('click', () => {
    items.length = 0;
    renderCart();
  });

  cartSelectAll?.addEventListener('change', (e) => {
    const checked = e.target.checked;
    items.forEach((it) => (it.checked = checked));
    renderCart();
  });

  function handleCheckout() {
    console.log('Checkout button clicked');
    console.log('Current items:', items);
    
    try {
      const checkedItems = items.filter((item) => item.checked);
      console.log('Checked items:', checkedItems);
      
      if (checkedItems.length === 0) {
        alert('Please select at least one item to checkout');
        return false;
      }
      
      // Save to localStorage with error handling
      try {
        const itemsJson = JSON.stringify(checkedItems);
        localStorage.setItem('checkoutItems', itemsJson);
        console.log('Items saved to localStorage:', itemsJson);
      } catch (storageError) {
        console.error('Failed to save to localStorage:', storageError);
        alert('Error saving cart data. Please try again.');
        return false;
      }
      
      // Redirect to checkout page
      console.log('Redirecting to checkout.html');
      window.location.href = 'checkout.html';
      return true;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred during checkout. Please try again.');
      return false;
    }
  }

  // Handle checkout button click using event delegation on cart panel
  cartPanel?.addEventListener('click', (e) => {
    // Check if the clicked element is the checkout button or inside it
    const clickedElement = e.target;
    const isCheckoutBtn = clickedElement.id === 'checkoutBtn' || 
                          clickedElement.closest('#checkoutBtn') !== null ||
                          clickedElement.classList.contains('primary-btn') && clickedElement.textContent.trim() === 'Checkout';
    
    if (isCheckoutBtn) {
      e.stopPropagation();
      e.preventDefault();
      handleCheckout();
    }
  });
  
  // Also attach direct listener to the button when it exists
  function attachCheckoutListener() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
      checkoutBtn.onclick = function(e) {
        e.stopPropagation();
        e.preventDefault();
        handleCheckout();
      };
    }
  }
  
  // Attach listener immediately and after a short delay to ensure DOM is ready
  attachCheckoutListener();
  setTimeout(attachCheckoutListener, 100);

  function addItemToCart(name, price) {
    const numericPrice = Number(price);
    if (!name || Number.isNaN(numericPrice)) return;
    const existing = items.find((i) => i.name === name && i.price === numericPrice);
    if (existing) {
      existing.qty += 1;
    } else {
      items.push({
        name,
        price: numericPrice,
        qty: 1,
        checked: true,
      });
    }
    renderCart();
  }

  function processQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const addItem = params.get('addItem');
    const addPrice = parseFloat(params.get('addPrice')) || NaN;
    const shouldOpen = params.get('openCart') === '1';
    const hadParams = params.toString().length > 0;

    if (addItem && !Number.isNaN(addPrice)) {
      addItemToCart(decodeURIComponent(addItem), addPrice);
    }
    if (shouldOpen) {
      openCart();
    }

    // Clean up URL so refresh won't re-open cart or re-add items
    if (hadParams) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState(null, '', cleanUrl);
    }
  }

  window.addItemToCartFromProduct = addItemToCart;

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', () => {
      if (window.scrollY > 240) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });
  }

  attachAddButtons();
  attachStoreCardNavigation();
  attachPickButtons();
  loadCartFromStorage();
  processQueryParams();
  renderCart();
})();

