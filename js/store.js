// Script para a página MentorX Store
document.addEventListener('DOMContentLoaded', function() {
    const categoryCards = document.querySelectorAll('.category-card');
    const materialBtns = document.querySelectorAll('.material-btn');
    const cartBtn = document.getElementById('cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const closeCart = document.querySelector('.close-cart');
    const checkoutBtn = document.querySelector('.checkout-btn');
    const storeSearch = document.getElementById('store-search');
    const storeSearchBtn = document.getElementById('store-search-btn');
    const filterCategory = document.getElementById('filter-category');
    const filterType = document.getElementById('filter-type');
    const filterPrice = document.getElementById('filter-price');
    const materialsGrid = document.getElementById('materials-grid');

    let cart = [];
    let cartCount = 0;

    // Categorias
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            filterCategory.value = category;
            filterMaterials();
            showNotification(`Filtrando por ${category}`, 'info');
        });
    });

    // Filtros
    function filterMaterials() {
        const category = filterCategory.value;
        const type = filterType.value;
        const price = filterPrice.value;
        const searchTerm = storeSearch.value.toLowerCase();

        const materialCards = materialsGrid.querySelectorAll('.material-card');

        materialCards.forEach(card => {
            const cardCategory = card.dataset.category;
            const cardType = card.dataset.type;
            const cardPrice = card.dataset.price;
            const cardTitle = card.querySelector('h3').textContent.toLowerCase();
            const cardDesc = card.querySelector('p').textContent.toLowerCase();

            let show = true;

            if (category && cardCategory !== category) show = false;
            if (type && cardType !== type) show = false;
            if (price && cardPrice !== price) show = false;
            if (searchTerm && !cardTitle.includes(searchTerm) && !cardDesc.includes(searchTerm)) show = false;

            card.style.display = show ? 'block' : 'none';
        });
    }

    // Busca
    storeSearchBtn.addEventListener('click', filterMaterials);
    storeSearch.addEventListener('input', filterMaterials);
    filterCategory.addEventListener('change', filterMaterials);
    filterType.addEventListener('change', filterMaterials);
    filterPrice.addEventListener('change', filterMaterials);

    // Carrinho
    materialBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.material-card');
            const title = card.querySelector('h3').textContent;
            const price = card.querySelector('.material-price').textContent;

            if (price === 'Grátis') {
                showNotification('Download iniciado!', 'success');
            } else {
                addToCart(title, price);
                showNotification('Adicionado ao carrinho!', 'success');
            }
        });
    });

    function addToCart(title, price) {
        cart.push({ title, price });
        cartCount++;
        updateCartUI();
    }

    function updateCartUI() {
        document.getElementById('cart-count').textContent = cartCount;

        const cartItems = document.getElementById('cart-items');
        cartItems.innerHTML = '';

        let total = 0;
        cart.forEach((item, index) => {
            const priceValue = parseFloat(item.price.replace('€', ''));
            total += priceValue;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.innerHTML = `
                <span>${item.title}</span>
                <span>${item.price}</span>
                <button onclick="removeFromCart(${index})">×</button>
            `;
            cartItems.appendChild(itemDiv);
        });

        document.getElementById('cart-total').textContent = `€${total.toFixed(2)}`;
    }

    window.removeFromCart = function(index) {
        cart.splice(index, 1);
        cartCount--;
        updateCartUI();
    };

    // Modal do carrinho
    cartBtn.addEventListener('click', () => {
        cartModal.style.display = 'block';
    });

    closeCart.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            showNotification('Redirecionando para checkout...', 'info');
            setTimeout(() => {
                window.location.href = 'pagamento.html';
            }, 1000);
        } else {
            showNotification('Carrinho vazio!', 'error');
        }
    });
});