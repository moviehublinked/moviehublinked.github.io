// Configuration - Your GitHub raw URL
const MOVIES_DATA_URL = 'https://raw.githubusercontent.com/Tartilpz/Tartilpz.github.io/main/movies.json';

// Global variables
let allMovies = [];
let sortedMovies = [];
let currentPage = 1;
const moviesPerPage = 8;
let currentMovies = [];
let onlyNewActive = false;
let currentCategory = "HOME";
let isSearching = false;
let searchTerm = "";
let searchTimeout;

// DOM Elements
const movieGrid = document.getElementById('movieGrid');
const movieModal = document.getElementById('movieModal');
const closeModal = document.getElementById('closeModal');
const modalMovieTitle = document.getElementById('modalMovieTitle');
const modalMoviePoster = document.getElementById('modalMoviePoster');
const modalMovieInfo = document.getElementById('modalMovieInfo');
const downloadOptions = document.getElementById('downloadOptions');
const modalHallPrintBadge = document.getElementById('modalHallPrintBadge');
const onlyNewBtn = document.getElementById('onlyNewBtn');
const requestMovieBtn = document.getElementById('requestMovieBtn');
const requestModal = document.getElementById('requestModal');
const closeRequestModal = document.getElementById('closeRequestModal');
const requestMovieForm = document.getElementById('requestMovieForm');
const navItems = document.querySelectorAll('.nav-item');
const scrollTopBtn = document.getElementById('scrollTopBtn');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const moviesTitle = document.getElementById('moviesTitle');
const noResults = document.getElementById('noResults');
const movieLoadingSpinner = document.getElementById('movieLoadingSpinner');

// Pagination elements
const daPagination = document.getElementById('daPagination');
const paginationItems = document.querySelectorAll('#daPagination li:not(.arrow)');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const activePill = document.getElementById('activePill');

// Form validation elements
const titleError = document.getElementById('titleError');
const yearError = document.getElementById('yearError');

// Function to fetch movies from GitHub
async function fetchMovies() {
    const loadingElement = document.createElement('div');
    loadingElement.className = 'global-loading';
    loadingElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading movies...';
    loadingElement.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px 40px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 9999;
        font-size: 18px;
        color: var(--primary);
    `;
    document.body.appendChild(loadingElement);
    
    try {
        const response = await fetch(MOVIES_DATA_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        allMovies = data.movies;
        sortedMovies = [...allMovies].sort((a, b) => b.id - a.id);
        currentMovies = [...sortedMovies];
        
        filterByCategory("HOME");
        toggleScrollTopButton();
        
        setTimeout(() => {
            updatePaginationUI();
        }, 500);
        
    } catch (error) {
        console.error('Error fetching movies:', error);
        showErrorMessage('Failed to load movies. Please refresh the page.');
        allMovies = [];
        sortedMovies = [];
        currentMovies = [];
        displayMovies();
    } finally {
        document.body.removeChild(loadingElement);
    }
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #dc3545;
        color: white;
        padding: 15px 30px;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(220, 53, 69, 0.3);
        z-index: 10000;
        font-weight: 500;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function handleImageError(img) {
    img.src = 'https://via.placeholder.com/300x450?text=Poster+Not+Available';
    img.onerror = null;
}
window.handleImageError = handleImageError;

function sanitizeUrl(url) {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'https:' ? url : '#';
    } catch {
        return '#';
    }
}

function createMovieCard(movie) {
    const hallPrintBadge = movie.isHallPrint ? '<div class="hall-print-badge">Hall Print</div>' : '';
    const contentTypeBadge = movie.contentType === 'movie' 
        ? '<div class="content-type-badge movie-badge">Movie</div>' 
        : '<div class="content-type-badge series-badge">Series</div>';
    const sanitizedPoster = sanitizeUrl(movie.poster);
    
    return `
        <div class="movie-card" data-id="${movie.id}">
            <div class="movie-poster-container">
                <img src="${sanitizedPoster}" alt="${movie.title.replace(/"/g, '&quot;')}" class="movie-poster" loading="lazy" onerror="handleImageError(this)">
                <div class="movie-overlay">
                    <div class="overlay-content">
                        <i class="fas fa-play-circle"></i>
                        <span>View Details</span>
                    </div>
                </div>
                ${hallPrintBadge}
                ${contentTypeBadge}
            </div>
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-year">Year: ${movie.year}</div>
                <div class="movie-category">${movie.category}</div>
            </div>
        </div>
    `;
}

function showMovieLoading() {
    movieGrid.style.display = 'none';
    movieLoadingSpinner.style.display = 'block';
    noResults.style.display = 'none';
}

function hideMovieLoading() {
    movieLoadingSpinner.style.display = 'none';
    movieGrid.style.display = 'grid';
}

function updatePaginationUI() {
    const totalPages = Math.ceil(currentMovies.length / moviesPerPage);
    
    if (totalPages <= 1) {
        daPagination.style.display = 'none';
        return;
    } else {
        daPagination.style.display = 'block';
    }
    
    const pageItems = Array.from(paginationItems);
    pageItems.forEach((item, index) => {
        const pageNum = index + 1;
        if (pageNum <= totalPages) {
            item.style.display = 'inline-block';
            item.textContent = pageNum;
            item.setAttribute('data-page', pageNum);
            
            if (pageNum === currentPage) {
                item.classList.add('current');
            } else {
                item.classList.remove('current');
            }
        } else {
            item.style.display = 'none';
        }
    });
    
    const currentPageElement = Array.from(paginationItems).find(
        item => parseInt(item.getAttribute('data-page')) === currentPage
    );
    
    if (currentPageElement) {
        activePill.style.left = currentPageElement.offsetLeft + 'px';
    }
    
    if (currentPage === 1) {
        prevPageBtn.style.opacity = '0.5';
        prevPageBtn.style.pointerEvents = 'none';
    } else {
        prevPageBtn.style.opacity = '1';
        prevPageBtn.style.pointerEvents = 'auto';
    }
    
    if (currentPage === totalPages) {
        nextPageBtn.style.opacity = '0.5';
        nextPageBtn.style.pointerEvents = 'none';
    } else {
        nextPageBtn.style.opacity = '1';
        nextPageBtn.style.pointerEvents = 'auto';
    }
}

function displayMovies() {
    showMovieLoading();
    
    setTimeout(() => {
        const startIndex = (currentPage - 1) * moviesPerPage;
        const endIndex = startIndex + moviesPerPage;
        const moviesToShow = currentMovies.slice(startIndex, endIndex);
        
        movieGrid.innerHTML = '';
        
        if (moviesToShow.length === 0) {
            movieGrid.style.display = 'none';
            noResults.style.display = 'block';
            daPagination.style.display = 'none';
        } else {
            movieGrid.style.display = 'grid';
            noResults.style.display = 'none';
            
            moviesToShow.forEach(movie => {
                movieGrid.innerHTML += createMovieCard(movie);
            });
            
            const movieCards = movieGrid.querySelectorAll('.movie-card');
            movieCards.forEach(card => {
                card.addEventListener('click', function() {
                    const movieId = parseInt(this.getAttribute('data-id'));
                    const movie = allMovies.find(m => m.id === movieId);
                    if (movie) {
                        openMovieModal(movie);
                    }
                });
            });
            
            updatePaginationUI();
        }
        
        hideMovieLoading();
    }, 300);
}

function goToPage(page) {
    const totalPages = Math.ceil(currentMovies.length / moviesPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        displayMovies();
        document.querySelector('.movie-grid').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function filterByCategory(category) {
    currentCategory = category;
    currentPage = 1;
    isSearching = false;
    searchTerm = "";
    searchInput.value = "";
    
    moviesTitle.innerHTML = '<i class="fas fa-film"></i> RECENTLY RELEASED MOVIES';
    
    if (category === "HOME") {
        currentMovies = [...sortedMovies];
    } else {
        currentMovies = sortedMovies.filter(movie => 
            movie.category.toUpperCase().includes(category)
        );
    }
    
    if (onlyNewActive) {
        currentMovies = currentMovies.filter(movie => movie.isNew);
    }
    
    displayMovies();
}

function performSearch(searchValue) {
    currentPage = 1;
    isSearching = true;
    const searchQuery = searchValue.toLowerCase().trim();
    
    moviesTitle.innerHTML = `<i class="fas fa-search"></i> SEARCH RESULTS FOR: "${searchQuery}"`;
    
    if (!searchQuery) {
        filterByCategory(currentCategory);
        return;
    }
    
    currentMovies = sortedMovies.filter(movie => 
        movie.title.toLowerCase().includes(searchQuery) ||
        movie.category.toLowerCase().includes(searchQuery) ||
        movie.year.toString().includes(searchQuery)
    );
    
    if (onlyNewActive) {
        currentMovies = currentMovies.filter(movie => movie.isNew);
    }
    
    displayMovies();
}

function toggleOnlyNew() {
    onlyNewActive = !onlyNewActive;
    
    if (onlyNewActive) {
        onlyNewBtn.innerHTML = '<i class="fas fa-star"></i> Showing New Only';
        onlyNewBtn.style.backgroundColor = "var(--primary)";
        onlyNewBtn.style.borderColor = "var(--primary)";
        onlyNewBtn.style.color = "white";
        currentMovies = sortedMovies.filter(movie => movie.isNew);
    } else {
        onlyNewBtn.innerHTML = '<i class="fas fa-star"></i> Only New';
        onlyNewBtn.style.backgroundColor = "white";
        onlyNewBtn.style.borderColor = "var(--border-light)";
        onlyNewBtn.style.color = "var(--text-dark)";
        
        if (isSearching && searchTerm) {
            performSearch(searchTerm);
        } else {
            filterByCategory(currentCategory);
        }
        return;
    }
    
    if (isSearching && searchTerm) {
        currentMovies = currentMovies.filter(movie => 
            movie.title.toLowerCase().includes(searchTerm) ||
            movie.category.toLowerCase().includes(searchTerm) ||
            movie.year.toString().includes(searchTerm)
        );
    } else if (currentCategory !== "HOME") {
        currentMovies = currentMovies.filter(movie => 
            movie.category.toUpperCase().includes(currentCategory)
        );
    }
    
    currentPage = 1;
    displayMovies();
}

function openMovieModal(movie) {
    modalMovieTitle.textContent = movie.title;
    modalMoviePoster.src = sanitizeUrl(movie.poster);
    modalMoviePoster.alt = movie.title;
    
    modalHallPrintBadge.style.display = movie.isHallPrint ? 'block' : 'none';
    
    let infoHTML = `
        <p><strong>Title:</strong> ${movie.title}</p>
        <p><strong>Year:</strong> ${movie.year}</p>
        <p><strong>Category:</strong> ${movie.category}</p>
        <p><strong>Type:</strong> ${movie.contentType === 'movie' ? 'Movie' : 'TV Series'}</p>
    `;
    
    if (movie.contentType === 'series' && movie.totalEpisodes) {
        infoHTML += `<p><strong>Total Episodes:</strong> ${movie.totalEpisodes}</p>`;
    }
    
    if (movie.isNew) {
        infoHTML += `<p><strong>Release:</strong> <span style="color: #28a745;">New Release</span></p>`;
    }
    if (movie.isHallPrint) {
        infoHTML += `<p><strong>Print Type:</strong> <span style="color: #ffd700;">Hall Print</span></p>`;
    }
    
    modalMovieInfo.innerHTML = infoHTML;
    downloadOptions.innerHTML = '';
    
    if (movie.downloads && movie.downloads.length > 0) {
        if (movie.contentType === 'series') {
            movie.downloads.forEach((download, index) => {
                const sanitizedUrl = sanitizeUrl(download.url);
                const downloadOption = document.createElement('div');
                downloadOption.className = 'download-option';
                
                let episodeText = download.episode || `Episode ${index + 1}`;
                let buttonText = download.episode === "Complete Season" 
                    ? `📦 Download Complete Season (${download.quality})`
                    : `📥 Download ${episodeText} (${download.quality})`;
                
                downloadOption.innerHTML = `
                    <h4>${episodeText}</h4>
                    <p>Quality: ${download.quality}</p>
                    <a href="${sanitizedUrl}" class="download-btn" target="_blank" rel="noopener noreferrer">
                        <i class="fas fa-download"></i> ${buttonText}
                    </a>
                `;
                downloadOptions.appendChild(downloadOption);
            });
        } else {
            const downloadQuality = movie.downloads[0];
            const sanitizedUrl = sanitizeUrl(downloadQuality.url);
            
            downloadOptions.innerHTML = `
                <div class="download-option">
                    <h4>${downloadQuality.quality} Quality</h4>
                    <p>High quality download with excellent audio and video</p>
                    <a href="${sanitizedUrl}" class="download-btn" target="_blank" rel="noopener noreferrer">
                        <i class="fas fa-download"></i> Download ${downloadQuality.quality}
                    </a>
                </div>
            `;
        }
    } else {
        downloadOptions.innerHTML = '<p style="text-align: center; color: var(--gray);">No download links available</p>';
    }
    
    movieModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}
window.openMovieModal = openMovieModal;

function validateRequestForm() {
    let isValid = true;
    
    titleError.style.display = 'none';
    yearError.style.display = 'none';
    
    const title = document.getElementById('requestTitle').value.trim();
    const year = document.getElementById('requestYear').value;
    
    if (!title) {
        titleError.style.display = 'block';
        isValid = false;
    }
    
    const yearNum = parseInt(year);
    if (!year || yearNum < 1900 || yearNum > 2026) {
        yearError.style.display = 'block';
        isValid = false;
    }
    
    return isValid;
}

function handleMovieRequest(formData) {
    alert(`Thank you for your request!\n\nMovie/Series: ${formData.title}\nYear: ${formData.year}\n\nWe'll try to add this to our collection soon.`);
    
    requestMovieForm.reset();
    requestModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function toggleScrollTopButton() {
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
}

// Event Listeners
closeModal.addEventListener('click', () => {
    movieModal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

closeRequestModal.addEventListener('click', () => {
    requestModal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

window.addEventListener('click', (event) => {
    if (event.target === movieModal) {
        movieModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    if (event.target === requestModal) {
        requestModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

onlyNewBtn.addEventListener('click', toggleOnlyNew);

requestMovieBtn.addEventListener('click', () => {
    requestModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
});

requestMovieForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!validateRequestForm()) return;
    
    handleMovieRequest({
        title: document.getElementById('requestTitle').value,
        year: document.getElementById('requestYear').value,
        details: document.getElementById('requestDetails').value
    });
});

navItems.forEach(item => {
    item.addEventListener('click', function() {
        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        filterByCategory(this.textContent.toUpperCase());
    });
});

paginationItems.forEach(item => {
    item.addEventListener('click', function(e) {
        if (!this.classList.contains('arrow')) {
            const page = parseInt(this.getAttribute('data-page'));
            if (!isNaN(page) && page !== currentPage) {
                goToPage(page);
            }
        }
    });
});

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) goToPage(currentPage - 1);
});

nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(currentMovies.length / moviesPerPage);
    if (currentPage < totalPages) goToPage(currentPage + 1);
});

searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const searchValue = e.target.value.trim();
    
    if (searchValue.length >= 2 || searchValue.length === 0) {
        searchTimeout = setTimeout(() => {
            if (searchValue.length >= 2) {
                navItems.forEach(nav => nav.classList.remove('active'));
                performSearch(searchValue);
            } else if (searchValue.length === 0) {
                navItems.forEach(nav => nav.classList.remove('active'));
                document.querySelector('.nav-item.home').classList.add('active');
                filterByCategory("HOME");
            }
        }, 300);
    }
});

searchBtn.addEventListener('click', () => {
    const searchValue = searchInput.value.trim();
    if (searchValue.length >= 2) {
        navItems.forEach(nav => nav.classList.remove('active'));
        performSearch(searchValue);
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('scroll', toggleScrollTopButton);

// Start the app
fetchMovies();
