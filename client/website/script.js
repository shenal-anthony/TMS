// Example: Fetch tours from the backend
fetch('http://localhost:3000/api/tours')
    .then(response => response.json())
    .then(data => {
        const toursList = document.getElementById('tours-list');
        data.forEach(tour => {
            const listItem = document.createElement('li');
            listItem.textContent = `${tour.name} - $${tour.price}`;
            toursList.appendChild(listItem);
        });
    })
    .catch(error => console.error('Error fetching tours:', error));