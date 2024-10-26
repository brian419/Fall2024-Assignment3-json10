// v2
const moviesBtn = document.getElementById('movies-btn');
const actorsBtn = document.getElementById('actors-btn');
const homeSection = document.getElementById('home-section');
const moviesSection = document.getElementById('movies-section');
const actorsSection = document.getElementById('actors-section');
const reviewsSection = document.getElementById('reviews-section');
const actorDetailsSection = document.getElementById('actor-details-section');
const backToHomeMovies = document.getElementById('back-to-home-movies');
const backToMovies = document.getElementById('back-to-movies');
const backToHomeActors = document.getElementById('back-to-home-actors');
const backToActors = document.getElementById('back-to-actors');
const movieForm = document.getElementById('movie-form');
const movieTable = document.querySelector('#movie-table tbody');
const actorsList = document.getElementById('actors-list');
const moviesList2 = document.getElementById('movies-list');

const reviewsList = document.getElementById('reviews-list');
const sentimentTable = document.querySelector('#sentiment-table tbody');
const actorMoviesList = document.getElementById('actor-movies');
const overallSentimentSpan = document.getElementById('overall-sentiment');

const actorForm = document.getElementById('actor-form');
const actorTable = document.querySelector('#actor-table tbody');
const linkForm = document.getElementById('link-form');
const actorMovieTable = document.querySelector('#actor-movie-table tbody');

let movies = JSON.parse(localStorage.getItem('movies')) || [];
let actors = JSON.parse(localStorage.getItem('actors')) || [];

function editMovie(movieTitle) {
    const movie = movies.find(m => m.title === movieTitle);
    if (!movie) {
        console.error(`Movie with title "${movieTitle}" not found.`);
        return;
    }
    document.getElementById('movieId').value = movie.id;
    document.getElementById('title').value = movie.title;
    document.getElementById('imdb').value = movie.imdb || '';
    document.getElementById('genre').value = movie.genre || '';
    document.getElementById('year').value = movie.year || '';
    document.getElementById('poster').value = movie.poster || '';
    document.getElementById('editMovieModal').style.display = 'block';
}

function closeEditMovieModal() {
    document.getElementById('editMovieModal').style.display = 'none';
}


async function deleteMovie(id) {
    const csrfToken = document.querySelector('#csrf-form input[name="__RequestVerificationToken"]').value;

    if (!csrfToken) {
        console.error("CSRF token not found.");
        return;
    }

    try {
        const response = await fetch(`/Movies/DeleteConfirmed?id=${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'RequestVerificationToken': csrfToken
            }
        });

        if (response.ok) {
            console.log("Movie deleted successfully.");
            location.reload();
        } else {
            console.error("Failed to delete movie.");
        }
    } catch (error) {
        console.error("Error deleting movie:", error);
    }
}

function editActor(index) {
    const actor = actors[index];

    document.getElementById('name').value = actor.name;
    document.getElementById('gender').value = actor.gender;
    document.getElementById('age').value = actor.age;
    document.getElementById('imdb').value = actor.imdb;
    document.getElementById('photo').value = actor.photo;

    actors.splice(index, 1);

    localStorage.setItem('actors', JSON.stringify(actors));

    renderActors();
}

function deleteActor(index) {
    actors.splice(index, 1);

    localStorage.setItem('actors', JSON.stringify(actors));

    renderActors();
}


async function callAIForTweets(actorName) {
    const apiUrl = 'https://fall2024-assignment3-json10-openai.openai.azure.com/openai/deployments/gpt-35-turbo/chat/completions?api-version=2024-08-01-preview';
    const apiKey = '01837e74cf2a4eb08a3291b1a3732c34';
    const maxRetries = 10;
    const retryDelay = 5000;
    const targetTweetCount = 20;
    const prompt = `Generate 20 short fictional tweets about the actor '${actorName}'.`;

    const requestBody = {
        messages: [
            {
                role: "system",
                content: "You are a social media expert."
            },
            {
                role: "user",
                content: prompt
            }
        ],
        max_tokens: 500
    };

    let tweetsArray = [];

    for (let attempt = 1; attempt <= maxRetries && tweetsArray.length < targetTweetCount; attempt++) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': apiKey
                },
                body: JSON.stringify(requestBody)
            });

            if (response.status === 429) {
                console.warn(`Rate limit exceeded, retrying in ${retryDelay / 1000} seconds... (Attempt ${attempt})`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                continue;
            }

            const data = await response.json();
            if (!data.choices || data.choices.length === 0) {
                throw new Error("No tweets returned by the API.");
            }

            const tweetsText = data.choices[0].message.content;
            const newTweets = tweetsText.split("\n").filter(tweet => tweet.trim() !== '');

            tweetsArray = [...tweetsArray, ...newTweets].slice(0, targetTweetCount);

        } catch (error) {
            console.error('Error calling OpenAI API:', error);
            if (attempt === maxRetries) {
                return tweetsArray;
            }
        }
    }

    return tweetsArray.slice(0, targetTweetCount);
}


async function callOpenAIForReviews(movieTitle) {
    const apiUrl = 'https://fall2024-assignment3-json10-openai.openai.azure.com/openai/deployments/gpt-35-turbo/chat/completions?api-version=2024-08-01-preview';
    const apiKey = '01837e74cf2a4eb08a3291b1a3732c34';
    const maxRetries = 20;
    const retryDelay = 4000;
    const targetReviewCount = 10;
    const prompt = `Write ten detailed reviews for the movie with '${movieTitle}'.`;

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

    let reviewsArray = [];

    for (let attempt = 1; attempt <= maxRetries && reviewsArray.length < targetReviewCount; attempt++) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': apiKey
                },
                body: JSON.stringify(requestBody)
            });

            if (response.status === 429) {
                console.warn(`Movie Review Rate limit exceeded, retrying in ${retryDelay / 1000} seconds... (Attempt ${attempt})`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                continue;
            }

            const data = await response.json();
            if (!data.choices || data.choices.length === 0) {
                throw new Error("No reviews returned by the API.");
            }

            const reviewsText = data.choices[0].message.content;
            const newReviews = reviewsText.split("\n").filter(review => review.trim() !== '');

            reviewsArray = [...reviewsArray, ...newReviews].slice(0, targetReviewCount);

        } catch (error) {
            console.error('Error calling OpenAI API:', error);
            if (attempt === maxRetries) {
                return reviewsArray;
            }
        }
    }


    return reviewsArray.slice(0, targetReviewCount);
}

function analyzeSentiment(tweet) {
    const positiveWords = ["good", "great", "amazing", "fantastic", "wonderful"];
    const negativeWords = ["bad", "terrible", "awful", "boring", "poor"];

    let sentimentScore = 0;

    positiveWords.forEach(word => {
        if (tweet.toLowerCase().includes(word)) {
            sentimentScore += 1;
        }
    });

    negativeWords.forEach(word => {
        if (tweet.toLowerCase().includes(word)) {
            sentimentScore -= 1;
        }
    });

    return sentimentScore > 0 ? "Positive" : sentimentScore < 0 ? "Negative" : "Neutral";
}


async function showReviews(movieTitle) {
    const reviewsSection = document.getElementById("reviews-section");
    const reviewsList = document.getElementById("reviews-list");

    try {
        const response = await fetch(`/Movies/Reviews?title=${encodeURIComponent(movieTitle)}`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });

        if (!response.ok) {
            throw new Error(`Movie with title "${movieTitle}" not found on the server.`);
        }

        const movie = await response.json();

        const reviews = await callOpenAIForReviews(movie.title) || [];

        let totalSentimentScore = 0;

        const reviewRows = reviews.map(review => {
            const sentiment = analyzeSentiment(review);
            totalSentimentScore += (sentiment === "Positive" ? 1 : sentiment === "Negative" ? -1 : 0);
            return `<tr><td>${review}</td><td>${sentiment}</td></tr>`;
        }).join("");

        const overallSentiment = totalSentimentScore > 0 ? "Positive" :
            totalSentimentScore < 0 ? "Negative" : "Neutral";
        const sentimentColor = overallSentiment === "Positive" ? "#007BFF" : overallSentiment === "Negative" ? "#d9534f" : "#555"; 
        
        let reviewsHTML = `<h4>Overall Sentiment: <span style="color: ${sentimentColor};">${overallSentiment}</span></h4>`;
        reviewsHTML += `<h3>AI-Generated Reviews for ${movie.title}</h3>`;
        reviewsHTML += `<table><tr><th>Review</th><th>Sentiment</th></tr>${reviewRows}</table>`;

        reviewsList.innerHTML = reviewsHTML;
        reviewsSection.style.display = 'block';

        const actorsList = document.getElementById('actors-list');
        if (movie.actors && movie.actors.length > 0) {
            actorsList.innerHTML = movie.actors.map(actor => `<li>${actor.name}</li>`).join("");
        } else {
            actorsList.innerHTML = '<li>No actors linked to this movie in the database. Add actors from Actors page and link them to this movie in Link Actors to Movies Page!</li>';
        }

    } catch (error) {
        console.error("Error displaying reviews:", error.message);
    }
}


function backToMoviesFunc() {
    document.getElementById("reviews-section").style.display = 'none';
    document.getElementById("movies-section").style.display = 'block';
}


async function showActorDetails(actorId) {
    try {
        const response = await fetch(`/Actors/Details?id=${actorId}`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });

        if (!response.ok) {
            throw new Error(`Actor withs ID "${actorId}" not found on the server.`);
        }

        const actor = await response.json();

        const actorInfoHTML = `
            <h3>${actor.Name}</h3>
            <p><strong>Gender:</strong> ${actor.Gender}</p>
            <p><strong>Age:</strong> ${actor.Age}</p>
            <p><strong>IMDB:</strong> <a href="${actor.IMDBLink}" target="_blank">Link</a></p>
            <img src="${actor.Photo}" alt="${actor.Name}" style="width:100px;"/>
        `;

    } catch (error) {
        console.error("Error fetching actor details:", error);
    }
}


async function callAIForMoviesAndShows(actorName) {
    const apiUrl = 'https://fall2024-assignment3-json10-openai.openai.azure.com/openai/deployments/gpt-35-turbo/chat/completions?api-version=2024-08-01-preview';
    const apiKey = '01837e74cf2a4eb08a3291b1a3732c34';
    const maxRetries = 10;
    const retryDelay = 4000;
    const targetMoviesCount = 10;
    const prompt = `List some of the movies and TV shows that the actor '${actorName}' has appeared in.`;

    const requestBody = {
        messages: [
            { role: "system", content: "You are a movie database expert." },
            { role: "user", content: prompt }
        ],
        max_tokens: 500
    };

    let moviesAndShowsArray = [];

    for (let attempt = 1; attempt <= maxRetries && moviesAndShowsArray.length < targetMoviesCount; attempt++) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
                body: JSON.stringify(requestBody)
            });

            if (response.status === 429) {
                console.warn(`Rate limit exceeded, retrying in ${retryDelay / 1000} seconds... (Attempt ${attempt})`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                continue;
            }

            const data = await response.json();
            if (!data.choices || data.choices.length === 0) {
                throw new Error("No movies or shows returned by the API.");
            }

            const moviesAndShowsText = data.choices[0].message.content;
            const newMovies = moviesAndShowsText.split("\n").filter(item => item.trim() !== '');

            moviesAndShowsArray = [...moviesAndShowsArray, ...newMovies].slice(0, targetMoviesCount);

        } catch (error) {
            console.error('Error calling OpenAI API:', error);
            if (attempt === maxRetries) {
                return moviesAndShowsArray;
            }
        }
    }

    return moviesAndShowsArray.slice(0, targetMoviesCount);
}

let actorMovieLinks = JSON.parse(localStorage.getItem('actorMovieLinks')) || [];

function renderMovieSelect() {
    const movieSelect = document.getElementById('movie-select');
    movieSelect.innerHTML = '';
    movies.forEach((movie, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = movie.title;
        movieSelect.appendChild(option);
    });
}

function renderActorSelect() {
    const actorSelect = document.getElementById('actor-select');
    actorSelect.innerHTML = '';
    actors.forEach((actor, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = actor.name;
        actorSelect.appendChild(option);
    });
}

function renderActorMovieLinks() {
    actorMovieTable.innerHTML = '';

    actorMovieLinks.forEach((link, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${movies[link.movieIndex].title}</td>
            <td>${actors[link.actorIndex].name}</td>
            <td>
                <button onclick="deleteLink(${index})">Delete</button>
            </td>
        `;
        actorMovieTable.appendChild(row);
    });
}

function deleteLink(index) {
    actorMovieLinks.splice(index, 1);
    localStorage.setItem('actorMovieLinks', JSON.stringify(actorMovieLinks));
    renderActorMovieLinks();
}



const backToHomeLinks = document.getElementById('back-to-home-links');


// adding these down here to move the hardcoded script i had in Details.cshtml for Actors
async function displayTweets(actorName) {
    const tweetsTable = document.getElementById("tweets-table").querySelector("tbody");
    const tweets = await callAIForTweets(actorName);
    tweets.forEach(tweet => {
        const row = document.createElement("tr");
        const sentiment = analyzeSentiment(tweet);
        row.innerHTML = `<td>${tweet}</td><td>${sentiment}</td>`;
        tweetsTable.appendChild(row);
    });
}

async function displayMoviesAndShows(actorName) {
    const moviesList = document.getElementById("movies-and-shows");
    const moviesAndShows = await callAIForMoviesAndShows(actorName);
    if (moviesAndShows.length > 0) {
        moviesAndShows.forEach(show => {
            const listItem = document.createElement("li");
            listItem.textContent = show;
            moviesList.appendChild(listItem);
        });
    } else {
        moviesList.innerHTML = "<li>No movies or TV shows found.</li>";
    }
}

async function displayOverallSentiment(actorName) {
    const overallSentimentSpan = document.getElementById("overall-sentiment");
    const tweets = await callAIForTweets(actorName);
    let totalSentimentScore = 0;
    tweets.forEach(tweet => {
        const sentiment = analyzeSentiment(tweet);
        totalSentimentScore += (sentiment === "Positive" ? 1 : sentiment === "Negative" ? -1 : 0);
    });
    const overallSentiment = totalSentimentScore > 0 ? "Positive" :
        totalSentimentScore < 0 ? "Negative" : "Neutral";
    const sentimentColor = overallSentiment === "Positive" ? "#007BFF" : overallSentiment === "Negative" ? "#d9534f" : "#555";
    overallSentimentSpan.innerHTML = overallSentiment;
    overallSentimentSpan.style.color = sentimentColor;

}


/* fetches and displays associated mosvies for the specified actor by id */
async function displayAssociatedMovies(actorId) {
    const response = await fetch(`/Actors/AssociatedMovies?id=${actorId}`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });

    if (!response.ok) {
        console.error(`Actor with ID "${actorId}" not found on the server.`);
        return;
    }

    const movies = await response.json();
    console.log("Movies data:", movies); 

    const actorMoviesList = document.getElementById('movies-list');

    if (movies && movies.length > 0) {
        actorMoviesList.innerHTML = movies.map(movie => `<li>${movie.title}</li>`).join("");
    } else {
        actorMoviesList.innerHTML = '<li>No movies linked to this actor in the database. Link movies from Movies page and link them to this actor in Link Actors to Movies Page!</li>';
    }
}


async function initializeActorPage() {
    const actorName = document.body.getAttribute("data-actor-name");
    const actorId = document.body.getAttribute("data-actor-id");
    await displayAssociatedMovies(actorId);
    await displayTweets(actorName);
    await displayMoviesAndShows(actorName);
    await displayOverallSentiment(actorName);

}



window.onscroll = function () {
    const scrollUpBtn = document.getElementById("scrollUpBtn");
    const halfwayPoint = document.body.scrollHeight / 2;

    if (window.scrollY >= halfwayPoint) {
        scrollUpBtn.style.display = "block";
    } else {
        scrollUpBtn.style.display = "none";
    }
};

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


function openDeleteModal(actorId) {
    document.getElementById('deleteActorId').value = actorId;
    document.getElementById('deleteModal').style.display = 'flex';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
}


function initializeDataTable(tableId) {
    $(`#${tableId}`).DataTable({
        "paging": true,
        "searching": true,
        "ordering": true
    });
}