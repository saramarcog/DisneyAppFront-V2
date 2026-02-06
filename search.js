
const buscadorPelicula = document.getElementById('buscador-pelicula');


async function buscarPeliculas(query) {
    if (!query || query.length < 1) {
        const grid = document.getElementById('search-results');
        if (grid) {
            grid.innerHTML = '';
        }
        const sectionTitle = document.querySelector('.section-title');
        if (sectionTitle) {
            sectionTitle.textContent = 'Resultado de búsqueda';
        }
        return;
    }

    try {
        const res = await fetch(`http://localhost:3000/api/v1/movie/search/${encodeURIComponent(query)}`);

        let data = [];
        if (res.status === 404) {
            data = [];
        } else if (!res.ok) {
            throw new Error('Error en búsqueda');
        } else {
            data = await res.json();
        }
        console.log('Resultados de búsqueda:', data);
        const grid = document.getElementById('search-results');
        if (grid) {
            grid.innerHTML = '';
            if (data.length === 0) {
                grid.innerHTML = '<p class="no-results">No se encontraron resultados para tu búsqueda.</p>';
            } else {
                const sectionTitle = document.querySelector('.section-title');
                if (sectionTitle) {
                    sectionTitle.textContent = `(${data.length}) Resultados para "${query}"`;
                }
                data.forEach(movie => {
                    const card = createMovieCard(movie);
                    grid.appendChild(card);
                });
            }
        }
    } catch (error) {
        console.error('Error al buscar:', error);
    }
}

buscadorPelicula.addEventListener('input', (e) => {
    console.log('Buscando:', e.target.value);
    buscarPeliculas(e.target.value);
})

const categorias = document.querySelectorAll('.category-grid a span');
categorias.forEach(cat => {
    cat.addEventListener('click', (e) => {
        const genre = e.target.textContent;
        console.log('Filtrando por género:', genre);
        buscarPeliculasPorCategoria(genre);
    });
});

async function buscarPeliculasPorCategoria(genre) {
    // Mostrar Skeletons
    const grid = document.getElementById('search-results');
    if (grid) {
        grid.innerHTML = '';
        for (let i = 0; i < 10; i++) {
            grid.innerHTML += createSkeletonCard();
        }
    }

    try {
        // Encode the genre to handle spaces/special chars safely
        const res = await fetch(`http://localhost:3000/api/v1/movie/category/${encodeURIComponent(genre)}`);
        if (!res.ok) {
            // Try to parse server error message
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Error ${res.status}: Error en búsqueda`);
        }
        const data = await res.json()
        console.log('Resultados de búsqueda:', data);
        const grid = document.getElementById('search-results');
        if (grid) {
            grid.innerHTML = '';
            if (data.length === 0) {
                grid.innerHTML = '<p class="no-results">No se encontraron resultados para tu búsqueda.</p>';
            } else {
                const sectionTitle = document.querySelector('.section-title');
                if (sectionTitle) {
                    sectionTitle.textContent = `Resultados para categoría: "${genre}"`;
                }

                data.forEach(movie => {
                    const card = createMovieCard(movie);
                    grid.appendChild(card);
                });
            }
        }
    } catch (error) {
        console.error('Error al buscar:', error);
    }
}

function createSkeletonCard() {
    return `
                <article class="movie-card">
                    <div class="skeleton"></div>
                </article>
                `;
}

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('search-results');
    if (grid && grid.children.length === 0) {
        loadAllMovies();
    }
});