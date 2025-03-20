const destinationCards = document.querySelector('.destination-cards');

async function fetchDestinations() {
    try {
        const response = await fetch('http://localhost:3000/api/destinations');
        const destinations = await response.json();

        destinationCards.innerHTML = ''; // Clear existing cards
        destinations.forEach(destination => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${destination.image_url}" alt="${destination.name}">
                <h3>${destination.name}</h3>
                <p>${destination.description}</p>
                <p><strong>Price:</strong> $${destination.price}</p>
            `;
            destinationCards.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching destinations:', error);
    }
}

// Load destinations when the page loads
document.addEventListener('DOMContentLoaded', fetchDestinations);