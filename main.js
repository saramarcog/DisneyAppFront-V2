const API_BASE = 'http://localhost:3000/api/v1/movie';

// Estado de los carruseles (posición actual de scroll)
const carouselState = {
    'popular-track': 0,
    'now-playing-track': 0,
    'top-rated-track': 0,
    'upcoming-track': 0
};

// Main Helper to fetch list
async function fetchList(endpoint) {
    try {
        const res = await fetch(`${API_BASE}/list/${endpoint}`);
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error(`Error fetching ${endpoint}`, e);
        return [];
    }
}

function createMovieCard(movie) {
    const article = document.createElement('article');
    article.className = 'movie-card';
    article.innerHTML = `
        <a href="details.html?id=${movie.id_pelicula}">
            <img class="movie-poster img-fade-in" src="${movie.poster_path}" alt="${movie.titulo}" loading="lazy" onload="this.classList.add('img-loaded')" onerror="this.onerror=null; this.src='https://via.placeholder.com/200x300?text=Sin+Imagen'; this.classList.add('img-loaded')">
            <div class="movie-info">
                <h3 class="movie-title">${movie.titulo}</h3>
                <p class="movie-category">${movie.anio_estreno || ''}</p>
            </div>
        </a>
    `;
    return article;
}

function renderCarousel(trackId, movies) {
    const track = document.getElementById(trackId);
    if (!track) return;

    track.innerHTML = '';
    carouselState[trackId] = 0;

    movies.forEach(movie => {
        track.appendChild(createMovieCard(movie));
    });
}

// Global Horizontal Scroll Function
window.scrollCarousel = function (trackId, direction) {
    const track = document.getElementById(trackId);
    if (!track) return;

    const containerWidth = track.parentElement.offsetWidth;
    const cardWidth = 140; // Approx card width + gap
    const gap = 16;
    const itemWidth = cardWidth + gap;

    // Items to scroll = visual container width / items per row
    const scrollAmount = containerWidth * 0.8;

    const maxScroll = track.scrollWidth - containerWidth;
    let currentScroll = carouselState[trackId] || 0; // Negative value

    // direction 1 = next (go left, more negative), -1 = prev (go right, less negative)
    // BUT usually 'transform X negative' moves content left.
    // Next Button -> Move content Left -> Subtract from X

    let newScroll = currentScroll - (scrollAmount * direction);

    if (newScroll > 0) newScroll = 0;
    if (newScroll < -maxScroll) newScroll = -maxScroll;
    if (Math.abs(newScroll) < 5) newScroll = 0; // Snap to start

    carouselState[trackId] = newScroll;
    track.style.transform = `translateX(${newScroll}px)`;
};

// Hero Slider Logic
let currentHeroIndex = 0;
let heroInterval;

function initHeroSlider(heroMovies) {
    const sliderContainer = document.getElementById('hero-slider');
    if (!sliderContainer || !heroMovies.length) return;

    sliderContainer.innerHTML = heroMovies.map((movie, index) => {
        // Fallback for images
        const backdrop = movie.backdrop_path || movie.poster_path;
        const poster = movie.poster_path;

        return `
            <div class="hero-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                <div class="hero-bg-blur" style="background-image: url('${backdrop}')"></div>
                <div class="container hero-content-inner">
                    <div class="hero-text">
                        <h2 class="hero-title">${movie.titulo}</h2>
                        <span class="hero-subtitle mb-3 d-block">${movie.anio_estreno} • ${movie.duracion ? movie.duracion + ' min' : ''}</span>
                        <p class="hero-desc">${movie.descripcion ? movie.descripcion.substring(0, 150) + '...' : ''}</p>
                        <div class="hero-buttons">
                            <!-- Button style matching 'Más información' from user image -->
                             <a href="details.html?id=${movie.id_pelicula}" class="hero-btn-more">
                                <span style="margin-right: 8px;">ⓘ</span> MÁS INFORMACIÓN
                            </a>
                            <!-- Optional 'Add to List' or Primary Action if needed, for extensive UI -->
                        </div>
                    </div>
                    <div class="hero-poster-container">
                        <img src="${poster}" alt="${movie.titulo}" class="hero-floating-poster">
                    </div>
                </div>
            </div>
        `;
    }).join('') + `
        <!-- Pagination Dots -->
        <div class="hero-dots">
            ${heroMovies.map((_, i) => `<div class="hero-dot ${i === 0 ? 'active' : ''}" data-index="${i}" onclick="goToHeroSlide(${i})"></div>`).join('')}
        </div>
    `;


    // Controls
    document.getElementById('hero-prev')?.addEventListener('click', () => changeHeroSlide(-1));
    document.getElementById('hero-next')?.addEventListener('click', () => changeHeroSlide(1));

    startHeroInterval();
}

function changeHeroSlide(direction) {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length === 0) return;

    slides[currentHeroIndex].classList.remove('active');
    currentHeroIndex += direction;

    if (currentHeroIndex >= slides.length) currentHeroIndex = 0;
    if (currentHeroIndex < 0) currentHeroIndex = slides.length - 1;

    slides[currentHeroIndex].classList.add('active');
    resetHeroInterval();
}

function startHeroInterval() {
    heroInterval = setInterval(() => changeHeroSlide(1), 6000);
}

function resetHeroInterval() {
    clearInterval(heroInterval);
    startHeroInterval();
}

// Manual Navigation to specific slide (for dots)
window.goToHeroSlide = function (index) {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length === 0 || index < 0 || index >= slides.length) return;

    slides[currentHeroIndex].classList.remove('active');
    currentHeroIndex = index;
    slides[currentHeroIndex].classList.add('active');

    // Update dots
    updateDots();

    resetHeroInterval();
}

function updateDots() {
    document.querySelectorAll('.hero-dot').forEach((dot, idx) => {
        if (idx === currentHeroIndex) dot.classList.add('active');
        else dot.classList.remove('active');
    });
}

// Override changeHeroSlide to update dots too
const originalChangeSlide = changeHeroSlide;
changeHeroSlide = function (direction) {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length === 0) return;

    slides[currentHeroIndex].classList.remove('active');
    currentHeroIndex += direction;

    if (currentHeroIndex >= slides.length) currentHeroIndex = 0;
    if (currentHeroIndex < 0) currentHeroIndex = slides.length - 1;

    slides[currentHeroIndex].classList.add('active');
    updateDots(); // Add this
    resetHeroInterval();
}



// INIT
document.addEventListener('DOMContentLoaded', async () => {
    // Parallel fetch for speed
    const [popular, nowPlaying, topRated, upcoming] = await Promise.all([
        fetchList('popular'),
        fetchList('now_playing'),
        fetchList('top_rated'),
        fetchList('upcoming')
    ]);

    // Populate Carousels
    renderCarousel('popular-track', popular);
    renderCarousel('now-playing-track', nowPlaying);
    renderCarousel('top-rated-track', topRated);
    renderCarousel('upcoming-track', upcoming);

    // Build Header Slider: 1 from each category
    const heroSelection = [];
    if (popular[0]) heroSelection.push(popular[0]);
    if (nowPlaying[0]) heroSelection.push(nowPlaying[0]);
    if (topRated[0]) heroSelection.push(topRated[0]);
    if (upcoming[0]) heroSelection.push(upcoming[0]);

    // Fallback if empty
    if (heroSelection.length === 0 && popular.length > 0) {
        heroSelection.push(...popular.slice(0, 3));
    }

    initHeroSlider(heroSelection);
});
