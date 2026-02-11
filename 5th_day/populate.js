let productsData = [];

function populateProducts(sortType = null) {
    fetch('logs.json')
        .then(response => response.json())
        .then(data => {
            productsData = data;
            displayProducts(sortType);
        })
        .catch(error => console.error('Error fetching data:', error));
}

function displayProducts(sortType = null) {
    const productsContainer = document.querySelector('.products');
    productsContainer.innerHTML = '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let sortedData = [...productsData];
    
    // Filter based on expiry status
    if (sortType === 'expired') {
        sortedData = sortedData.filter(p => new Date(p.expiry_date) < today);
    } else if (sortType === 'expiry') {
        sortedData = sortedData.filter(p => new Date(p.expiry_date) >= today);
    }
    
    // Sort data
    sortedData.sort((a, b) => {
        switch(sortType) {
            case 'alphabetically':
                return a.name.localeCompare(b.name);
            case 'newest':
                // Parse full datetime for accurate comparison
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            case 'expiry':
            case 'expired':
                return (sortType === 'expired' ? -1 : 1) * (new Date(a.expiry_date) - new Date(b.expiry_date));
            default:
                return 0;
        }
    });
    
    // Display products or empty message
    if (sortedData.length === 0) {
        productsContainer.innerHTML = `<p>No ${sortType === 'expired' ? 'expired' : ''} products found.</p>`;
        return;
    }
    
    sortedData.forEach(product => {
        const isExpired = new Date(product.expiry_date) < today;
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        if (isExpired) productCard.classList.add('expired');
        
        productCard.innerHTML = `
            <h2>${product.name}</h2>
            <p>Expiry Date: ${product.expiry_date}</p>
            <p>Created At: ${product.created_at}</p>
        `;
        productsContainer.appendChild(productCard);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    populateProducts();
    
    document.querySelectorAll('.sorted button').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.sorted button').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            displayProducts(this.id);
        });
    });
});