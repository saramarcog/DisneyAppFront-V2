const movies = [
    {
        title: "Avatar: El Sentido del Agua",
        category: "Ciencia Ficción, Acción",
        image: "https://lumiere-a.akamaihd.net/v1/images/p_avatarthewayofwater_199_v2_1ac9b808.jpeg",
        year: 2022,
        type: "new"
    },
    {
        title: "Encanto",
        category: "Animación, Fantasía",
        image: "https://lumiere-a.akamaihd.net/v1/images/p_encanto_homeent_22359_4892ae1c.jpeg",
        year: 2021,
        type: "recommended"
    },
    {
        title: "Black Panther: Wakanda Forever",
        category: "Acción, Aventura",
        image: "https://lumiere-a.akamaihd.net/v1/images/p_blackpantherwakandaforever_media_2022_4e101349.jpeg",
        year: 2022,
        type: "new"
    },
    {
        title: "The Mandalorian",
        category: "Ciencia Ficción",
        image: "https://lumiere-a.akamaihd.net/v1/images/p_themandalorian_s3_25425_487e793a.jpeg",
        year: 2023,
        type: "recommended"
    },
    {
        title: "Turning Red",
        category: "Animación, Comedia",
        image: "https://lumiere-a.akamaihd.net/v1/images/p_turningred_22361_9766b158.jpeg",
        year: 2022,
        type: "recommended"
    },
    {
        title: "Doctor Strange: Multiverse of Madness",
        category: "Fantasía, Acción",
        image: "https://lumiere-a.akamaihd.net/v1/images/p_doctorstrangeinthemultiverseofmadness_245_476c24c2.jpeg",
        year: 2022,
        type: "new"
    },
    {
        title: "Lightyear",
        category: "Animación, Aventura",
        image: "https://lumiere-a.akamaihd.net/v1/images/p_lightyear_23293_14c3d25f.jpeg",
        year: 2022,
        type: "recommended"
    },
    {
        title: "Thor: Love and Thunder",
        category: "Acción, Comedia",
        image: "https://lumiere-a.akamaihd.net/v1/images/p_thorloveandthunder_245_1c1c9c4c.jpeg",
        year: 2022,
        type: "new"
    },
    {
        title: "Luca",
        category: "Animación, Comedia",
        image: "https://lumiere-a.akamaihd.net/v1/images/p_luca_21421_6424acab.jpeg",
        year: 2021,
        type: "recommended"
    },
    {
        title: "Cruella",
        category: "Comedia, Crimen",
        image: "https://lumiere-a.akamaihd.net/v1/images/p_cruella_21672_ba40c762.jpeg",
        year: 2021,
        type: "recommended"
    },
    {
        title: "Soul",
        category: "Animación, Fantasía",
        image: "https://lumiere-a.akamaihd.net/v1/images/p_soul_disneyplus_v2_20907_764da65d.jpeg",
        year: 2020,
        type: "recommended"
    },
    {
        title: "Raya y el Último Dragón",
        category: "Animación, Aventura",
        image: "https://lumiere-a.akamaihd.net/v1/images/p_rayaandthelastdragon_21294_83346778.jpeg",
        year: 2021,
        type: "recommended"
    }
];

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
            <img class="movie-poster" src="${movie.image}" alt="${movie.title}">
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-category">${movie.category}</p>
            </div>
        </a>
    `;
    return article;
}

function loadCarousel(trackId, filteredMovies) {
    const track = document.getElementById(trackId);
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
    const newReleases = movies.filter(m => m.type === 'new' && filterFn(m));

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
document.addEventListener('DOMContentLoaded', () => loadAllMovies());
