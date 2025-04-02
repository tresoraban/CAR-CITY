// Database
let db = {
    users: [
        {
            id: 1,
            name: "John Seller",
            type: "seller",
            email: "john@seller.com",
            password: "password123"
        },
        {
            id: 2,
            name: "Alice Buyer",
            type: "buyer",
            email: "alice@buyer.com",
            password: "password123"
        }
    ],
    cars: [
        {
            id: 1,
            sellerId: 1,
            make: "Toyota",
            model: "Camry",
            year: 2018,
            price: 18500,
            mileage: 45000,
            condition: "Excellent",
            image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            description: "Like new Toyota Camry with low mileage. Always garaged and well maintained."
        },
        {
            id: 2,
            sellerId: 1,
            make: "Honda",
            model: "Civic",
            year: 2016,
            price: 14500,
            mileage: 68000,
            condition: "Good",
            image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            description: "Reliable Honda Civic in great condition. Recent oil change and new tires."
        },
        {
            id: 3,
            sellerId: 1,
            make: "Ford",
            model: "F-150",
            year: 2015,
            price: 22000,
            mileage: 89000,
            condition: "Good",
            image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            description: "Powerful Ford F-150 with towing package. Well-maintained work truck."
        }
    ],
    favorites: [
        { userId: 2, carId: 1 }
    ],
    messages: [
        {
            id: 1,
            carId: 1,
            buyerId: 2,
            sellerId: 1,
            messages: [
                {
                    sender: "buyer",
                    text: "Is this car still available?",
                    timestamp: "2023-05-10T10:30:00Z",
                    offer: null
                },
                {
                    sender: "seller",
                    text: "Yes, it's still available. Would you like to come see it?",
                    timestamp: "2023-05-10T11:15:00Z",
                    offer: null
                },
                {
                    sender: "buyer",
                    text: "Would you take $17,000 for it?",
                    timestamp: "2023-05-10T12:30:00Z",
                    offer: 17000
                }
            ]
        }
    ]
};

// Current user (simulating logged in user)
let currentUser = db.users[1]; // Default to buyer for demo
let currentCar = null;
let currentConversation = null;

// DOM Elements
const homeSection = document.getElementById('home-section');
const sellerSection = document.getElementById('seller-section');
const buyerSection = document.getElementById('buyer-section');
const carList = document.getElementById('car-list');
const sellerListings = document.getElementById('seller-listings');
const favoriteCars = document.getElementById('favorite-cars');
const conversationsList = document.getElementById('conversations-list');
const carDetailsModal = document.getElementById('car-details-modal');
const carDetailsContent = document.getElementById('car-details-content');
const messageModal = document.getElementById('message-modal');
const messageArea = document.getElementById('message-area');
const messageInput = document.getElementById('message-input');
const offerInput = document.getElementById('offer-input');
const addListingModal = document.getElementById('add-listing-modal');
const addListingForm = document.getElementById('add-listing-form');

// Navigation
document.getElementById('home-link').addEventListener('click', () => {
    showSection('home');
    loadCars();
});

document.getElementById('seller-link').addEventListener('click', () => {
    if (currentUser.type === 'seller') {
        showSection('seller');
        loadSellerListings();
    } else {
        alert('Only sellers can access this section');
    }
});

document.getElementById('buyer-link').addEventListener('click', () => {
    if (currentUser.type === 'buyer') {
        showSection('buyer');
        loadFavorites();
        loadConversations();
    } else {
        alert('Only buyers can access this section');
    }
});

// Tab functionality for buyer section
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
    });
});

// Filter functionality
document.getElementById('apply-filters').addEventListener('click', applyFilters);
document.getElementById('reset-filters').addEventListener('click', resetFilters);

// Modal close buttons
document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        carDetailsModal.style.display = 'none';
        messageModal.style.display = 'none';
        addListingModal.style.display = 'none';
    });
});

// Add listing button
document.getElementById('add-listing-btn').addEventListener('click', () => {
    addListingModal.style.display = 'flex';
});

// Add listing form
addListingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addNewListing();
});

// Send message button
document.getElementById('send-message-btn').addEventListener('click', sendMessage);

// Initialize the app
function init() {
    populateMakeFilter();
    loadCars();
}

// Show the appropriate section
function showSection(section) {
    homeSection.classList.remove('active');
    sellerSection.classList.remove('active');
    buyerSection.classList.remove('active');
    
    if (section === 'home') homeSection.classList.add('active');
    else if (section === 'seller') sellerSection.classList.add('active');
    else if (section === 'buyer') buyerSection.classList.add('active');
}

// Load cars to the home page
function loadCars() {
    carList.innerHTML = '';
    
    db.cars.forEach(car => {
        const isFavorite = db.favorites.some(fav => fav.userId === currentUser.id && fav.carId === car.id);
        
        const carCard = document.createElement('div');
        carCard.className = 'car-card';
        carCard.innerHTML = `
            <img src="${car.image}" alt="${car.make} ${car.model}" class="car-image">
            <div class="car-info">
                <h3 class="car-title">${car.year} ${car.make} ${car.model}</h3>
                <div class="car-price">$${car.price.toLocaleString()}</div>
                <div class="car-details">${car.mileage.toLocaleString()} miles • ${car.condition}</div>
                <button class="favorite-btn ${isFavorite ? 'favorited' : ''}" data-car-id="${car.id}">
                    ${isFavorite ? '❤️ Remove Favorite' : '♡ Add to Favorites'}
                </button>
                <button class="message-btn" data-car-id="${car.id}">Message Seller</button>
            </div>
        `;
        
        carList.appendChild(carCard);
    });
    
    // Add event listeners to favorite buttons
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const carId = parseInt(btn.dataset.carId);
            toggleFavorite(carId);
        });
    });
    
    // Add event listeners to message buttons
    document.querySelectorAll('.message-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const carId = parseInt(btn.dataset.carId);
            showMessageModal(carId);
        });
    });
    
    // Add click event to car cards to show details
    document.querySelectorAll('.car-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('favorite-btn') && !e.target.classList.contains('message-btn')) {
                const carId = parseInt(card.querySelector('.favorite-btn').dataset.carId);
                showCarDetails(carId);
            }
        });
    });
}

// Show car details modal
function showCarDetails(carId) {
    const car = db.cars.find(c => c.id === carId);
    if (!car) return;
    
    currentCar = car;
    
    const seller = db.users.find(u => u.id === car.sellerId);
    
    carDetailsContent.innerHTML = `
        <h2>${car.year} ${car.make} ${car.model}</h2>
        <img src="${car.image}" alt="${car.make} ${car.model}" style="width:100%; max-height:300px; object-fit:cover;">
        <div style="display:flex; justify-content:space-between; margin:1rem 0;">
            <div><strong>Price:</strong> $${car.price.toLocaleString()}</div>
            <div><strong>Mileage:</strong> ${car.mileage.toLocaleString()} miles</div>
            <div><strong>Condition:</strong> ${car.condition}</div>
        </div>
        <div><strong>Seller:</strong> ${seller.name}</div>
        <div style="margin:1rem 0;"><strong>Description:</strong><br>${car.description}</div>
        ${currentUser.type === 'buyer' ? `
            <button style="padding:0.5rem 1rem; background-color:#3498db; color:white; border:none; border-radius:4px; cursor:pointer;" id="details-message-btn">
                Message Seller
            </button>
        ` : ''}
    `;
    
    if (currentUser.type === 'buyer') {
        document.getElementById('details-message-btn').addEventListener('click', () => {
            showMessageModal(carId);
            carDetailsModal.style.display = 'none';
        });
    }
    
    carDetailsModal.style.display = 'flex';
}

// Toggle favorite status
function toggleFavorite(carId) {
    const favoriteIndex = db.favorites.findIndex(fav => fav.userId === currentUser.id && fav.carId === carId);
    
    if (favoriteIndex >= 0) {
        db.favorites.splice(favoriteIndex, 1);
    } else {
        db.favorites.push({
            userId: currentUser.id,
            carId: carId
        });
    }
    
    loadCars();
    if (buyerSection.classList.contains('active')) {
        loadFavorites();
    }
}

// Show message modal
function showMessageModal(carId) {
    const car = db.cars.find(c => c.id === carId);
    if (!car) return;
    
    currentCar = car;
    
    // Find or create conversation
    let conversation = db.messages.find(conv => conv.carId === carId && conv.buyerId === currentUser.id);
    
    if (!conversation) {
        conversation = {
            id: db.messages.length + 1,
            carId: carId,
            buyerId: currentUser.id,
            sellerId: car.sellerId,
            messages: []
        };
        db.messages.push(conversation);
    }
    
    currentConversation = conversation;
    renderMessages();
    messageModal.style.display = 'flex';
}

// Render messages in the message modal
function renderMessages() {
    if (!currentConversation) return;
    
    messageArea.innerHTML = '';
    
    currentConversation.messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.sender}-message`;
        
        let messageContent = `<div>${msg.text}</div>`;
        if (msg.offer) {
            messageContent += `<div><strong>Offer:</strong> $${msg.offer.toLocaleString()}</div>`;
        }
        messageContent += `<div style="font-size:0.8rem; color:#666;">${new Date(msg.timestamp).toLocaleString()}</div>`;
        
        messageDiv.innerHTML = messageContent;
        messageArea.appendChild(messageDiv);
    });
    
    // Scroll to bottom
    messageArea.scrollTop = messageArea.scrollHeight;
}

// Send a message
function sendMessage() {
    const text = messageInput.value.trim();
    const offer = offerInput.value ? parseInt(offerInput.value) : null;
    
    if (!text && !offer) return;
    
    currentConversation.messages.push({
        sender: 'buyer',
        text: text || (offer ? `I'm offering $${offer.toLocaleString()}` : ''),
        timestamp: new Date().toISOString(),
        offer: offer
    });
    
    messageInput.value = '';
    offerInput.value = '';
    
    renderMessages();
    
    // In a real app, you would send a notification to the seller here
}

// Load seller listings
function loadSellerListings() {
    sellerListings.innerHTML = '';
    
    const sellerCars = db.cars.filter(car => car.sellerId === currentUser.id);
    
    if (sellerCars.length === 0) {
        sellerListings.innerHTML = '<p>You have no listings yet. Add your first car!</p>';
        return;
    }
    
    sellerCars.forEach(car => {
        const carCard = document.createElement('div');
        carCard.className = 'car-card';
        carCard.innerHTML = `
            <img src="${car.image}" alt="${car.make} ${car.model}" class="car-image">
            <div class="car-info">
                <h3 class="car-title">${car.year} ${car.make} ${car.model}</h3>
                <div class="car-price">$${car.price.toLocaleString()}</div>
                <div class="car-details">${car.mileage.toLocaleString()} miles • ${car.condition}</div>
                <button class="message-btn" data-car-id="${car.id}">View Messages</button>
            </div>
        `;
        
        sellerListings.appendChild(carCard);
    });
    
    // Add event listeners to message buttons
    document.querySelectorAll('.message-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const carId = parseInt(btn.dataset.carId);
            viewSellerMessages(carId);
        });
    });
}

// View messages as seller
function viewSellerMessages(carId) {
    const conversation = db.messages.find(conv => conv.carId === carId);
    if (!conversation) {
        alert('No messages for this car yet');
        return;
    }
    
    currentConversation = conversation;
    currentCar = db.cars.find(c => c.id === carId);
    
    // For seller view, we need to modify the message modal
    const modalContent = messageModal.querySelector('.modal-content');
    modalContent.innerHTML = `
        <span class="close-btn">&times;</span>
        <h3>Messages about ${currentCar.year} ${currentCar.make} ${currentCar.model}</h3>
        <div class="message-area" id="message-area"></div>
        <input type="text" id="message-input" placeholder="Type your reply...">
        <input type="number" id="offer-input" placeholder="Counter offer (optional)">
        <button id="send-message-btn">Send</button>
    `;
    
    // Reattach event listeners
    messageModal.querySelector('.close-btn').addEventListener('click', () => {
        messageModal.style.display = 'none';
    });
    
    document.getElementById('send-message-btn').addEventListener('click', sendSellerMessage);
    
    // Render messages
    messageArea = document.getElementById('message-area');
    messageInput = document.getElementById('message-input');
    offerInput = document.getElementById('offer-input');
    
    renderMessages();
    messageModal.style.display = 'flex';
}

// Send message as seller
function sendSellerMessage() {
    const text = messageInput.value.trim();
    const offer = offerInput.value ? parseInt(offerInput.value) : null;
    
    if (!text && !offer) return;
    
    currentConversation.messages.push({
        sender: 'seller',
        text: text || (offer ? `I can do $${offer.toLocaleString()}` : ''),
        timestamp: new Date().toISOString(),
        offer: offer
    });
    
    messageInput.value = '';
    offerInput.value = '';
    
    renderMessages();
}

// Load favorite cars for buyer
function loadFavorites() {
    favoriteCars.innerHTML = '';
    
    const favoriteCarIds = db.favorites
        .filter(fav => fav.userId === currentUser.id)
        .map(fav => fav.carId);
    
    const favoriteCarsList = db.cars.filter(car => favoriteCarIds.includes(car.id));
    
    if (favoriteCarsList.length === 0) {
        favoriteCars.innerHTML = '<p>You have no favorite cars yet. Browse cars and add some!</p>';
        return;
    }
    
    favoriteCarsList.forEach(car => {
        const carCard = document.createElement('div');
        carCard.className = 'car-card';
        carCard.innerHTML = `
            <img src="${car.image}" alt="${car.make} ${car.model}" class="car-image">
            <div class="car-info">
                <h3 class="car-title">${car.year} ${car.make} ${car.model}</h3>
                <div class="car-price">$${car.price.toLocaleString()}</div>
                <div class="car-details">${car.mileage.toLocaleString()} miles • ${car.condition}</div>
                <button class="favorite-btn favorited" data-car-id="${car.id}">❤️ Remove Favorite</button>
                <button class="message-btn" data-car-id="${car.id}">Message Seller</button>
            </div>
        `;
        
        favoriteCars.appendChild(carCard);
    });
    
    // Add event listeners
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const carId = parseInt(btn.dataset.carId);
            toggleFavorite(carId);
        });
    });
    
    document.querySelectorAll('.message-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const carId = parseInt(btn.dataset.carId);
            showMessageModal(carId);
        });
    });
}

// Load conversations for buyer
function loadConversations() {
    conversationsList.innerHTML = '';
    
    const buyerConversations = db.messages.filter(conv => conv.buyerId === currentUser.id);
    
    if (buyerConversations.length === 0) {
        conversationsList.innerHTML = '<p>You have no messages yet.</p>';
        return;
    }
    
    buyerConversations.forEach(conv => {
        const car = db.cars.find(c => c.id === conv.carId);
        if (!car) return;
        
        const seller = db.users.find(u => u.id === conv.sellerId);
        const lastMessage = conv.messages[conv.messages.length - 1];
        
        const convElement = document.createElement('div');
        convElement.className = 'car-card';
        convElement.style.cursor = 'pointer';
        convElement.innerHTML = `
            <div style="display:flex; padding:1rem;">
                <img src="${car.image}" alt="${car.make} ${car.model}" style="width:100px; height:75px; object-fit:cover;">
                <div style="margin-left:1rem; flex-grow:1;">
                    <h4 style="margin:0 0 0.5rem;">${car.year} ${car.make} ${car.model}</h4>
                    <div style="font-size:0.9rem;">${lastMessage.text.substring(0, 50)}${lastMessage.text.length > 50 ? '...' : ''}</div>
                    <div style="font-size:0.8rem; color:#666;">${new Date(lastMessage.timestamp).toLocaleString()}</div>
                </div>
            </div>
        `;
        
        convElement.addEventListener('click', () => {
            showMessageModal(car.id);
        });
        
        conversationsList.appendChild(convElement);
    });
}

// Add new listing
function addNewListing() {
    const newCar = {
        id: db.cars.length + 1,
        sellerId: currentUser.id,
        make: document.getElementById('new-make').value,
        model: document.getElementById('new-model').value,
        year: parseInt(document.getElementById('new-year').value),
        price: parseInt(document.getElementById('new-price').value),
        mileage: parseInt(document.getElementById('new-mileage').value),
        condition: document.getElementById('new-condition').value,
        image: document.getElementById('new-image').value,
        description: document.getElementById('new-description').value
    };
    
    db.cars.push(newCar);
    addListingModal.style.display = 'none';
    addListingForm.reset();
    loadSellerListings();
}

// Populate make filter
function populateMakeFilter() {
    const makeFilter = document.getElementById('make-filter');
    const makes = [...new Set(db.cars.map(car => car.make))];
    
    makes.forEach(make => {
        const option = document.createElement('option');
        option.value = make;
        option.textContent = make;
        makeFilter.appendChild(option);
    });
    
    // Update model filter when make changes
    makeFilter.addEventListener('change', () => {
        const modelFilter = document.getElementById('model-filter');
        modelFilter.innerHTML = '<option value="">All Models</option>';
        
        if (makeFilter.value) {
            const models = [...new Set(db.cars
                .filter(car => car.make === makeFilter.value)
                .map(car => car.model))];
            
            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                modelFilter.appendChild(option);
            });
        }
    });
}

// Apply filters
function applyFilters() {
    const makeFilter = document.getElementById('make-filter').value;
    const modelFilter = document.getElementById('model-filter').value;
    const priceFilter = document.getElementById('price-filter').value;
    const mileageFilter = document.getElementById('mileage-filter').value;
    
    let filteredCars = [...db.cars];
    
    if (makeFilter) {
        filteredCars = filteredCars.filter(car => car.make === makeFilter);
    }
    
    if (modelFilter) {
        filteredCars = filteredCars.filter(car => car.model === modelFilter);
    }
    
    if (priceFilter) {
        const maxPrice = parseInt(priceFilter);
        filteredCars = filteredCars.filter(car => car.price <= maxPrice);
    }
    
    if (mileageFilter) {
        const maxMileage = parseInt(mileageFilter);
        filteredCars = filteredCars.filter(car => car.mileage <= maxMileage);
    }
    
    // Display filtered cars
    carList.innerHTML = '';
    
    if (filteredCars.length === 0) {
        carList.innerHTML = '<p>No cars match your filters. Try adjusting your criteria.</p>';
        return;
    }
    
    filteredCars.forEach(car => {
        const isFavorite = db.favorites.some(fav => fav.userId === currentUser.id && fav.carId === car.id);
        
        const carCard = document.createElement('div');
        carCard.className = 'car-card';
        carCard.innerHTML = `
            <img src="${car.image}" alt="${car.make} ${car.model}" class="car-image">
            <div class="car-info">
                <h3 class="car-title">${car.year} ${car.make} ${car.model}</h3>
                <div class="car-price">$${car.price.toLocaleString()}</div>
                <div class="car-details">${car.mileage.toLocaleString()} miles • ${car.condition}</div>
                <button class="favorite-btn ${isFavorite ? 'favorited' : ''}" data-car-id="${car.id}">
                    ${isFavorite ? '❤️ Remove Favorite' : '♡ Add to Favorites'}
                </button>
                <button class="message-btn" data-car-id="${car.id}">Message Seller</button>
            </div>
        `;
        
        carList.appendChild(carCard);
    });
    
    // Reattach event listeners
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const carId = parseInt(btn.dataset.carId);
            toggleFavorite(carId);
        });
    });
    
    document.querySelectorAll('.message-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const carId = parseInt(btn.dataset.carId);
            showMessageModal(carId);
        });
    });
}

// Reset filters
function resetFilters() {
    document.getElementById('make-filter').value = '';
    document.getElementById('model-filter').value = '';
    document.getElementById('price-filter').value = '';
    document.getElementById('mileage-filter').value = '';
    
    loadCars();
}

// Initialize the app
init();