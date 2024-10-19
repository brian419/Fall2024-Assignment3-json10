const moviesBtn = document.getElementById('movies-btn');
const actorsBtn = document.getElementById('actors-btn');
const homeSection = document.getElementById('home-section');
const moviesSection = document.getElementById('movies-section');
const actorsSection = document.getElementById('actors-section');
const backToHomeMovies = document.getElementById('back-to-home-movies');
const backToHomeActors = document.getElementById('back-to-home-actors');

// shows movies section as a pge and hides the home section
moviesBtn.addEventListener('click', function () {
    homeSection.style.display = 'none';
    moviesSection.style.display = 'block';
});

// shows actors section as a pge and hides the home section
actorsBtn.addEventListener('click', function () {
    homeSection.style.display = 'none';
    actorsSection.style.display = 'block';
});

// shows home section as a pge and hides the movies section
backToHomeMovies.addEventListener('click', function () {
    moviesSection.style.display = 'none';
    homeSection.style.display = 'block';
});

// shows home section as a pge and hides the actors section
backToHomeActors.addEventListener('click', function () {
    actorsSection.style.display = 'none';
    homeSection.style.display = 'block';
});

