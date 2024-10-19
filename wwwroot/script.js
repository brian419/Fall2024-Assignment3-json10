const moviesBtn = document.getElementById('movies-btn');
const actorsBtn = document.getElementById('actors-btn');
const homeSection = document.getElementById('home-section');
const moviesSection = document.getElementById('movies-section');
const reviewsSection = document.getElementById('reviews-section'); 
const actorsSection = document.getElementById('actors-section');
const backToHomeMovies = document.getElementById('back-to-home-movies');
const backToMovies = document.getElementById('back-to-movies'); 
const backToHomeActors = document.getElementById('back-to-home-actors');
const movieForm = document.getElementById('movie-form');
const movieTable = document.querySelector('#movie-table tbody');
const actorsList = document.getElementById('actors-list'); 
const reviewsList = document.getElementById('reviews-list'); 

let movies = JSON.parse(localStorage.getItem('movies')) || []; 

function renderMovies() {
    movieTable.innerHTML = ''; 

    movies.forEach((movie, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${movie.title}</td>
            <td><a href="${movie.imdb}" target="_blank">IMDB</a></td>
            <td>${movie.genre}</td>
            <td>${movie.year}</td>
            <td><img src="${movie.poster}" alt="${movie.title}" style="width:50px;"/></td>
            <td>
                <button onclick="editMovie(${index})">Edit</button>
                <button onclick="deleteMovie(${index})">Delete</button>
                <button onclick="showReviews(${index})">Reviews</button>
            </td>
        `;
        movieTable.appendChild(row);
    });
}

renderMovies();

movieForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const newMovie = {
        title: document.getElementById('title').value,
        imdb: document.getElementById('imdb').value,
        genre: document.getElementById('genre').value,
        year: document.getElementById('year').value,
        poster: document.getElementById('poster').value,
        actors: document.getElementById('actors').value.split(",").map(actor => actor.trim()) 
    };


    movies.push(newMovie);

    console.log(newMovie.poster);

    localStorage.setItem('movies', JSON.stringify(movies));

    renderMovies();

    movieForm.reset();
});

function editMovie(index) {
    const movie = movies[index];

    document.getElementById('title').value = movie.title;
    document.getElementById('imdb').value = movie.imdb;
    document.getElementById('genre').value = movie.genre;
    document.getElementById('year').value = movie.year;
    document.getElementById('poster').value = movie.poster;
    document.getElementById('actors').value = movie.actors.join(", "); 

    movies.splice(index, 1);

    localStorage.setItem('movies', JSON.stringify(movies));

    renderMovies();
}

function deleteMovie(index) {
    movies.splice(index, 1);

    localStorage.setItem('movies', JSON.stringify(movies));

    renderMovies();
}

async function callOpenAIForReviews(movieTitle) {
    const apiUrl = 'https://fall2024-assignment3-json10-openai.openai.azure.com/openai/deployments/gpt-35-turbo/chat/completions?api-version=2024-08-01-preview';
    const apiKey = '01837e74cf2a4eb08a3291b1a3732c34';

    const prompt = `Write ten detailed reviews for the movie titled '${movieTitle}'`;

    const requestBody = {
        messages: [
            {
                role: "system",
                content: "You are a movie reviewer."
            },
            {
                role: "user",
                content: prompt
            }
        ],
        max_tokens: 500
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        const reviewsText = data.choices[0].message.content;

        const reviewsArray = reviewsText.split("\n").filter(review => review.trim() !== '');

        return reviewsArray.slice(0, 10); 
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        return [];
    }
}

function analyzeSentiment(review) {
    const positiveWords = ["good", "great", "amazing", "fantastic", "wonderful"];
    const negativeWords = ["bad", "terrible", "awful", "boring", "poor"];

    let sentimentScore = 0;

    positiveWords.forEach(word => {
        if (review.toLowerCase().includes(word)) {
            sentimentScore += 1;
        }
    });

    negativeWords.forEach(word => {
        if (review.toLowerCase().includes(word)) {
            sentimentScore -= 1;
        }
    });

    if (sentimentScore > 0) {
        return "Positive";
    } else if (sentimentScore < 0) {
        return "Negative";
    } else {
        return "Neutral";
    }
}

async function showReviews(index) {
    const movie = movies[index];

    const reviews = await callOpenAIForReviews(movie.title);

    let actorsHTML = '<h4 style="text-align: center;">Actors in this movie:</h4><ul style="list-style: none; padding: 0; text-align: center;">';
    movie.actors.forEach(actor => {
        actorsHTML += `<li style="display: inline-block; margin: 0 10px;">${actor}</li>`;
    });
    actorsHTML += "</ul>";
    actorsList.innerHTML = actorsHTML;



    let reviewsHTML = `<h3>AI-Generated Reviews for ${movie.title}</h3><table><tr><th>Review</th><th>Sentiment</th></tr>`;

    let totalSentimentScore = 0;
    reviews.forEach(review => {
        const sentiment = analyzeSentiment(review);
        reviewsHTML += `<tr><td>${review}</td><td>${sentiment}</td></tr>`;

        if (sentiment === "Positive") {
            totalSentimentScore += 1;
        } else if (sentiment === "Negative") {
            totalSentimentScore -= 1;
        }
    });

    let overallSentiment = totalSentimentScore > 0 ? "Overall Sentiment: Positive" :
        totalSentimentScore < 0 ? "Overall Sentiment: Negative" :
            "Overall Sentiment: Neutral";

    reviewsHTML += `</table><h4>${overallSentiment}</h4>`;
    reviewsList.innerHTML = reviewsHTML;

    moviesSection.style.display = 'none';
    reviewsSection.style.display = 'block';
}

backToMovies.addEventListener('click', function () {
    reviewsSection.style.display = 'none';
    moviesSection.style.display = 'block';
});

moviesBtn.addEventListener('click', function () {
    homeSection.style.display = 'none';
    moviesSection.style.display = 'block';
});

actorsBtn.addEventListener('click', function () {
    homeSection.style.display = 'none';
    actorsSection.style.display = 'block';
});

backToHomeMovies.addEventListener('click', function () {
    moviesSection.style.display = 'none';
    homeSection.style.display = 'block';
});

backToHomeActors.addEventListener('click', function () {
    actorsSection.style.display = 'none';
    homeSection.style.display = 'block';
});
