(() => {
  const orderItemsEl = document.getElementById('orderItems');
  const subtotalEl = document.getElementById('subtotal');
  const deliveryFeeEl = document.getElementById('deliveryFee');
  const totalEl = document.getElementById('total');
  const placeOrderBtn = document.getElementById('placeOrderBtn');

  const DELIVERY_FEE = 50;

  function parsePrice(text) {
    const num = parseFloat(text.replace(/[^\d.]/g, '')) || 0;
    return num;
  }

  function formatPrice(num) {
    return `₱${num.toFixed(2).replace(/\.00$/, '')}`;
  }

  function loadCheckoutData() {
    try {
      const stored = localStorage.getItem('checkoutItems');
      if (!stored) {
        console.warn('No checkout items found in localStorage');
        window.location.href = 'index.html';
        return;
      }

      const items = JSON.parse(stored);
      if (!items || items.length === 0) {
        console.warn('Checkout items array is empty');
        window.location.href = 'index.html';
        return;
      }

      console.log('Loaded checkout items:', items);
      renderOrderItems(items);
      calculateTotals(items);
    } catch (error) {
      console.error('Error loading checkout data:', error);
      alert('Error loading checkout data. Redirecting to home page.');
      window.location.href = 'index.html';
    }
  }

  function renderOrderItems(items) {
    orderItemsEl.innerHTML = '';
    items.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'order-item';
      const itemTotal = item.price * item.qty;
      row.innerHTML = `
        <div class="order-item-info">
          <span class="order-item-name">${item.name}</span>
          <span class="order-item-qty">x${item.qty}</span>
        </div>
        <span class="order-item-price">${formatPrice(itemTotal)}</span>
      `;
      orderItemsEl.appendChild(row);
    });
  }

  function calculateTotals(items) {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const total = subtotal + DELIVERY_FEE;

    subtotalEl.textContent = formatPrice(subtotal);
    deliveryFeeEl.textContent = formatPrice(DELIVERY_FEE);
    totalEl.textContent = formatPrice(total);
  }

  placeOrderBtn?.addEventListener('click', () => {
    const form = document.getElementById('deliveryForm');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    const orderData = {
      items: JSON.parse(localStorage.getItem('checkoutItems') || '[]'),
      delivery: {
        name: formData.get('name'),
        phone: formData.get('phone'),
        address: formData.get('address'),
      },
      payment: paymentMethod,
      total: parseFloat(totalEl.textContent.replace(/[^\d.]/g, '')),
    };

    localStorage.setItem('orderData', JSON.stringify(orderData));
    alert('Order placed successfully!');
    
    // Clear cart and redirect
    localStorage.removeItem('checkoutItems');
    window.location.href = 'index.html';
  });

  loadCheckoutData();
})();

