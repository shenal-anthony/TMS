// Function to load a component
async function loadComponent(componentPath, placeholderId) {
    try {
        const response = await fetch(componentPath);
        const html = await response.text();
        document.getElementById(placeholderId).innerHTML = html;
    } catch (error) {
        console.error(`Error loading ${componentPath}:`, error);
    }
}

// Load navbar and footer
document.addEventListener('DOMContentLoaded', () => {
    loadComponent('components/navbar.html', 'navbar');
    loadComponent('components/footer.html', 'footer');
});


// Toggle menu on mobile
// const menuIcon = document.getElementById('menu-icon');
// const menu = document.querySelector('.menu');

// menuIcon.addEventListener('click', () => {
//     menu.classList.toggle('active');
// });