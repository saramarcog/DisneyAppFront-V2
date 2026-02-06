document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get('id');
    const header = document.querySelector('.site-header');
    if (header) header.classList.add('transparent');

    if (!movieId) {
        return;
    }

    try {
        const res = await fetch(`http://localhost:3000/api/v1/movie/${movieId}`);
        if (!res.ok) throw new Error('Error fetching details');

        const movie = await res.json();

        if (movie) {
            // Title
            document.getElementById('detail-title').textContent = movie.titulo;

            // Description - Handle Truncation
            const descEl = document.getElementById('detail-description');
            const readMoreBtn = document.getElementById('read-more');
            const descText = movie.descripcion || 'Sin descripción disponible.';

            descEl.textContent = descText;

            // Check if text is long enough to warrant a button (approx check)
            if (descText.length > 150) {
                readMoreBtn.style.display = 'flex';
                readMoreBtn.onclick = () => {
                    descEl.classList.toggle('expanded');
                    readMoreBtn.textContent = descEl.classList.contains('expanded') ? 'MENOS INFORMACIÓN' : 'MÁS INFORMACIÓN';
                };
            }

            // Background Image (Backdrop)
            const hero = document.getElementById('details-hero');
            // Use poster if backdrop is missing, but prefer backdrop
            const bgImage = movie.backdrop_path || movie.imagen_url;
            hero.style.backgroundImage = `url('${bgImage}')`;

            const year = movie.anio_estreno;
            const duration = movie.duracion ? `${Math.floor(movie.duracion / 60)} h ${movie.duracion % 60} min` : 'N/A';

            const metaContainer = document.getElementById('detail-meta');
            metaContainer.innerHTML = `
                            <span class="badge badge-white">PELÍCULA</span>
                            <span class="badge badge-dark">HD</span>
                            <span class="badge badge-dark">UHD</span>
                            <span>${year}</span>
                            <span>${duration}</span>
                        `;

            const trailerBtn = document.getElementById('trailer-btn');
            if (movie.trailer) {
                trailerBtn.href = "#"; // Prevent navigation
                trailerBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    openTrailer(movie.trailer);
                });
            } else {
                trailerBtn.style.display = 'none';
            }

            // Genres
            const genresRes = await fetch('http://localhost:3000/api/v1/movie/' + movieId + '/genres');
            const categories = await genresRes.json();
            console.log(categories);

            if (Array.isArray(categories)) {
                document.getElementById('detail-genres').innerHTML = categories.map(c => `<span>${c.nombre}</span>`).join(' • ');
            }

            document.title = `${movie.titulo} - Valero Dreams`;

            // Load Cast
            loadCast(movieId);

            // Load Similar
            loadSimilar(movieId);
        }

    } catch (error) {
        console.error('Error loading movie details:', error);
        document.getElementById('detail-title').textContent = 'Error al cargar la película';
    }
});

// Open Trailer Modal
function openTrailer(url) {
    const modal = document.getElementById('trailer-modal');
    const videoFrame = document.getElementById('trailer-video');

    // Extract video ID and create clean Embed URL
    const videoId = getYouTubeVideoId(url);

    if (videoId) {
        // Construct embed URL with autoplay and modest branding
        // rel=0 ensures suggested videos are from the same channel (deprecated but still partly effective)
        // origin helps with some CORS/embedding restrictions
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&bg_color=000000`;
        videoFrame.src = embedUrl;
        modal.classList.add('active');
    } else {
        console.error("Invalid Trailer URL:", url);
        alert("Lo siento, el tráiler no está disponible o el enlace es inválido.");
    }
}

function closeTrailer() {
    const modal = document.getElementById('trailer-modal');
    const videoFrame = document.getElementById('trailer-video');

    modal.classList.remove('active');
    // Clear src to stop playback immediately
    videoFrame.src = "";
}

// Helper to extract ID from various YouTube URL formats
function getYouTubeVideoId(url) {
    if (!url) return null;

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return (match && match[2].length === 11) ? match[2] : null;
}

// Close modal if clicked outside content
document.getElementById('trailer-modal').addEventListener('click', (e) => {
    // Close if clicking the overlay (trailer-modal id) or the close button
    if (e.target.id === 'trailer-modal' || e.target.classList.contains('modal-close')) {
        closeTrailer();
    }
});

async function loadCast(movieId) {
    try {
        const res = await fetch(`http://localhost:3000/api/v1/movie/${movieId}/cast`);
        if (!res.ok) throw new Error('Failed to load cast');
        const cast = await res.json();

        const castContainer = document.getElementById('cast-list');
        castContainer.innerHTML = '';

        if (!cast || cast.length === 0) {
            document.querySelector('.cast-section').style.display = 'none';
            return;
        }

        cast.forEach(actor => {
            const card = document.createElement('div');
            card.className = 'cast-card';

            // Handle missing image
            const imgUrl = actor.foto_path ? actor.foto_path : 'https://via.placeholder.com/150x225?text=No+Img';

            card.innerHTML = `
                <img src="${imgUrl}" alt="${actor.nombre}" class="cast-img" loading="lazy">
                <div class="cast-info">
                    <div class="cast-name">${actor.nombre}</div>
                    <div class="cast-character">${actor.personaje || 'Desconocido'}</div>
                </div>
            `;
            castContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading cast:', error);
        const section = document.querySelector('.cast-section');
        if (section) section.style.display = 'none';
    }
}


async function loadSimilar(movieId) {
    try {
        const res = await fetch(`http://localhost:3000/api/v1/movie/${movieId}/similar`);
        if (!res.ok) throw new Error('Failed to load similar');
        const movies = await res.json();

        const track = document.getElementById('recommended-track');
        track.innerHTML = '';

        if (!movies || movies.length === 0) {
            document.getElementById('recommended-carousel').style.display = 'none';
            document.querySelector('.section-title').style.display = 'none'; // Basic approach, better to target specifically
            return;
        }

        movies.forEach(movie => {
            const card = document.createElement('article');
            card.className = 'movie-card';

            // Fix: Backdrop for poster if poster missing, or placeholder
            const posterSrc = movie.poster_path ? movie.poster_path : (movie.backdrop_path || 'https://via.placeholder.com/200x300?text=No+Img');

            card.innerHTML = `
                <a href="details.html?id=${movie.id_pelicula}">
                    <img class="movie-poster img-fade-in" src="${posterSrc}" alt="${movie.titulo}" loading="lazy" onload="this.classList.add('img-loaded')" onerror="this.onerror=null; this.src='https://via.placeholder.com/200x300?text=Sin+Imagen'; this.classList.add('img-loaded')">
                    <div class="movie-info">
                        <h3 class="movie-title">${movie.titulo}</h3>
                        <p class="movie-category">${movie.anio_estreno || ''}</p>
                    </div>
                </a>
            `;
            track.appendChild(card);
        });

    } catch (error) {
        console.error('Error loading similar:', error);
    }
}
