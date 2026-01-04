// Crear más estrellas dinámicamente
function createStars() {
    const starsContainer = document.querySelector('.stars');
    const numberOfStars = 50;

    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.top = Math.random() * 100 + '%';
        star.style.left = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 4 + 's';
        star.style.animationDuration = (Math.random() * 3 + 3) + 's';
        starsContainer.appendChild(star);
    }
}

// Inicializar estrellas al cargar la página
window.addEventListener('load', createStars);
