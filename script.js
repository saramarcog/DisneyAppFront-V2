/* (sample data removed) */
let movies = []; // Will be fetched from the backend

// Backends to try (local first, then remote tunnel)
const BACKEND_URLS = [
    'http://localhost:3000/',
    'http://localhost:3000/api/v1/movie'

];

async function fetchMovies() {
    // Usamos localhost que es donde corre tu backend
    const url = 'http://localhost:3000/api/v1/movie';
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Error en la respuesta del servidor');

        const data = await res.json();

        // Si tu back devuelve { movies: [...] }
        if (data && data.movies) {
            movies = data.movies;
        }
        // Si tu back devuelve el array directo [...]
        else if (Array.isArray(data)) {
            movies = data;
        }

        console.log('Películas cargadas:', movies);
    } catch (e) {
        console.error('Error cargando pelis, mi amol:', e);
        movies = []; // Evita que la app se rompa si el back está apagado
    }
}
// Estado de los carruseles (posición actual de scroll)
const carouselState = {
    'recommended-track': 0,
    'new-track': 0
};

function createMovieCard(movie) {
    const article = document.createElement('article');
    article.className = 'movie-card';
    article.innerHTML = `
        <a href="details.html">
            <img class="movie-poster img-fade-in" src="${movie.imagen_url}" alt="${movie.titulo}" loading="lazy" onload="this.classList.add('img-loaded')" onerror="this.onerror=null; this.src='https://placehold.co/200x300/101820/D4AF37?text=Sin+Imagen'; this.classList.add('img-loaded')">
            <div class="movie-info">
                <h3 class="movie-title">${movie.titulo}</h3>
                <p class="movie-category">${movie.categoria}</p>
            </div>
        </a>
    `;
    return article;
}

function createMovieCardResult(movie) {
    const article = document.createElement('article');
    article.className = 'movie-card';
    article.innerHTML = `
        <a href="details.html">
            <img class="movie-poster img-fade-in" src="${movie.imagen_url}" alt="${movie.titulo}" loading="lazy" onload="this.classList.add('img-loaded')" onerror="this.onerror=null; this.src='https://placehold.co/200x300/101820/D4AF37?text=Sin+Imagen'; this.classList.add('img-loaded')">
            <div class="movie-info">
                <h3 class="movie-title">${movie.titulo}</h3>
                <p class="movie-category">${movie.categoria}</p>
            </div>
        </a>
    `;
    return article;
}

function loadCarousel(trackId, filteredMovies) {
    const track = document.getElementById(trackId);
    if (!track) return; // Salir si no existe el carrusel en esta página

    track.innerHTML = ''; // Limpiar

    // Resetear posición al filtrar
    carouselState[trackId] = 0;
    track.style.transform = `translateX(0)`;

    filteredMovies.forEach(movie => {
        track.appendChild(createMovieCard(movie));
    });
}

function loadAllMovies(genre = 'all') {
    // Filtrar por género si es necesario
    const filterFn = movie => {
        if (genre === 'all') return true;
        return movie.category.includes(genre);
    };

    // Separar en Recomendados (mix) y Novedades (mas recientes o marcados)
    const recommended = movies.filter(m => filterFn(m)); // Mostramos todos en recomendados para llenar
    const newReleases = movies.filter(m => m.año >= 2022 && filterFn(m));

    loadCarousel('recommended-track', recommended);
    loadCarousel('new-track', newReleases);
}

// Función de scroll horizontal
window.scrollCarousel = function (trackId, direction) {
    const track = document.getElementById(trackId);
    const containerWidth = track.parentElement.offsetWidth;
    const cardWidth = track.querySelector('.movie-card')?.offsetWidth || 200;
    const gap = 16;
    const itemWidth = cardWidth + gap;

    // Cuántas cartas caben en pantalla
    const itemsPerPage = Math.floor(containerWidth / itemWidth);
    const scrollAmount = itemsPerPage * itemWidth;

    // Total de scroll posible
    const maxScroll = track.scrollWidth - containerWidth;

    // Calcular nueva posición
    let currentScroll = carouselState[trackId];
    let newScroll = currentScroll - (scrollAmount * direction); // - porque translateX negativo mueve a izquierda

    // Límites
    if (newScroll > 0) newScroll = 0; // No pasar del inicio
    if (newScroll < -maxScroll) newScroll = -maxScroll; // No pasar del final

    carouselState[trackId] = newScroll;
    track.style.transform = `translateX(${newScroll}px)`;
};

// Event Listeners Filtros
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Actualizar UI botones
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        // Filtrar contenido
        const genre = e.target.dataset.genre;
        loadAllMovies(genre);
    });
});

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
    await fetchMovies();
    loadAllMovies();
    initHeroSlider();
    checkBackendConnection();
});

async function checkBackendConnection() {
    try {
        const response = await fetch('http://localhost:3000/api/v1/movie');
        const data = await response.json();
        console.log('Backend conectado:', data);
    } catch (error) {
        console.error('Error conectando al backend:', error);
    }
}

// Try to fetch /api/movies from backend(s) and populate the `movies` array
async function fetchMovies() {
    const url = "http://localhost:3000/api/v1/movie"
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('Network response not ok');
            const data = await res.json();
            if (data?.movies) {
                movies = data.movies;
                console.log('Movies loaded from', url);
                return;
            } else if (Array.isArray(data)) {
                movies = data;
                console.log('Movies loaded (array) from', url);
                return;
            }
        } catch (e) {
            console.warn('Failed to fetch movies from', url, e);
        }
    
    console.error('No backend reachable, leaving movies empty');
    movies = [];
}

/* --- Hero Slider Logic --- */
let currentHeroIndex = 0;
let heroInterval;

function initHeroSlider() {
    const sliderContainer = document.getElementById('hero-slider');
    if (!sliderContainer) return;

    // Generate slides (select top 5 new / recent movies)
    const heroMovies = movies.filter(m => m && (m.type === 'new' || (m.año && m.año >= 2022))).slice(0, 5);
    if (heroMovies.length === 0) {
        sliderContainer.innerHTML = '<p class="no-hero">No hay elementos para el slider</p>';
    } else {
        sliderContainer.innerHTML = heroMovies.map((movie, index) => {
            return `
                <div class="hero-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                    <!-- Blurred Background Layer -->
                    <div class="hero-bg-blur" style="background-image: url('${movie.imagen_url}')"></div>
                    
                    <div class="container hero-content-inner">
                        <div class="hero-text">
                            <h2 class="hero-title">${movie.titulo}</h2>
                            <span class="hero-subtitle mb-3 d-block">${movie.year} • ${movie.categoria}</span>
                            <div class="hero-buttons">
                                <a href="details.html" class="primary-button">VER AHORA</a>
                                <a href="#" class="secondary-button">TRÁILER</a>
                            </div>
                        </div>
                        <div class="hero-poster-container">
                            <img src="${movie.imagen_url}" alt="${movie.titulo}" class="hero-floating-poster">
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Controls
    document.getElementById('hero-prev')?.addEventListener('click', () => changeHeroSlide(-1));
    document.getElementById('hero-next')?.addEventListener('click', () => changeHeroSlide(1));

    // Auto play
    startHeroInterval();
}

function changeHeroSlide(direction) {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length === 0) return;

    // Remove active class from current
    slides[currentHeroIndex].classList.remove('active');

    // Calculate new index
    currentHeroIndex += direction;
    if (currentHeroIndex >= slides.length) currentHeroIndex = 0;
    if (currentHeroIndex < 0) currentHeroIndex = slides.length - 1;

    // Add active class to new
    slides[currentHeroIndex].classList.add('active');

    // Reset timer on manual interaction
    resetHeroInterval();
}

function startHeroInterval() {
    heroInterval = setInterval(() => {
        changeHeroSlide(1);
    }, 5000); // Change every 5 seconds
}

function resetHeroInterval() {
    clearInterval(heroInterval);
    startHeroInterval();
}
