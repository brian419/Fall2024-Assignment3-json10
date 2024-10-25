console.log("script.js loaded");

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

function renderActors() {
    actorTable.innerHTML = '';

    actors.forEach((actor, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${actor.name}</td>
            <td>${actor.gender}</td>
            <td>${actor.age}</td>
            <td><a href="${actor.imdb}" target="_blank">IMDB</a></td>
            <td><img src="${actor.photo}" alt="${actor.name}" style="width:50px;"/></td>
            <td>
                <button onclick="editActor(${index})">Edit</button>
                <button onclick="deleteActor(${index})">Delete</button>
                <button onclick="showActorDetails(${index})">Details</button>
            </td>
        `;
        actorTable.appendChild(row);
    });
}

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
renderActors();

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

    localStorage.setItem('movies', JSON.stringify(movies));

    renderMovies();

    movieForm.reset();
});

actorForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const newActor = {
        name: document.getElementById('name').value,
        gender: document.getElementById('gender').value,
        age: document.getElementById('age').value,
        imdb: document.getElementById('imdb').value,
        photo: document.getElementById('photo').value
    };

    actors.push(newActor);

    localStorage.setItem('actors', JSON.stringify(actors));

    renderActors();

    actorForm.reset();
});

function editMovie(index) {
    const movie = movies[index];

    document.getElementById('title').value = movie.title;
    document.getElementById('imdb').value = movie.imdb;
    document.getElementById('genre').value = movie.genre;
    document.getElementById('year').value = movie.year;
    document.getElementById('poster').value = movie.poster;
    document.getElementById('actors').value = movie.actors.join(", ");

    // movies.splice(index, 1);

    // localStorage.setItem('movies', JSON.stringify(movies));

    // renderMovies();
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

function deleteMovie(index) {
    movies.splice(index, 1);

    localStorage.setItem('movies', JSON.stringify(movies));

    renderMovies();
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

    // when calling a request, console log the response to see if it's working
    console.log(reviewsArray);

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

// async function showReviews(index) {
//     const movie = movies[index];

//     const reviews = await callOpenAIForReviews(movie.title) || [];

//     let actorsHTML = '<h4 style="text-align: center;">Actors in this movie:</h4>';
//     actorsHTML += movie.actors.join(', ');
//     actorsList.innerHTML = actorsHTML;


//     let reviewsHTML = `<h3>AI-Generated Reviews for ${movie.title}</h3><table><tr><th>Review</th><th>Sentiment</th></tr>`;

//     let totalSentimentScore = 0;

//     reviews.forEach(review => {
//         const sentiment = analyzeSentiment(review);
//         reviewsHTML += `<tr><td>${review}</td><td>${sentiment}</td></tr>`;

//         if (sentiment === "Positive") {
//             totalSentimentScore += 1;
//         } else if (sentiment === "Negative") {
//             totalSentimentScore -= 1;
//         }
//     });

//     let overallSentiment = totalSentimentScore > 0 ? "Overall Sentiment: Positive" :
//         totalSentimentScore < 0 ? "Overall Sentiment: Negative" :
//             "Overall Sentiment: Neutral";

//     reviewsHTML += `</table><h4>${overallSentiment}</h4>`;
//     reviewsList.innerHTML = reviewsHTML;

//     moviesSection.style.display = 'none';
//     reviewsSection.style.display = 'block';
// }


// async function showReviews(movieTitle) {
//     const movie = movies.find(m => m.title === movieTitle);


//     if (!movie) {
//         console.error(`Movie with title "${movieTitle}" not found.`);
//         return;
//     }

//     const reviews = await callOpenAIForReviews(movie.title) || [];

//     let actorsHTML = '<h4 style="text-align: center;">Actors in this movie:</h4>';
//     actorsHTML += movie.actors.join(', ');
//     actorsList.innerHTML = actorsHTML;

//     let reviewsHTML = `<h3>AI-Generated Reviews for ${movie.title}</h3><table><tr><th>Review</th><th>Sentiment</th></tr>`;

//     let totalSentimentScore = 0;

//     reviews.forEach(review => {
//         const sentiment = analyzeSentiment(review);
//         reviewsHTML += `<tr><td>${review}</td><td>${sentiment}</td></tr>`;

//         if (sentiment === "Positive") {
//             totalSentimentScore += 1;
//         } else if (sentiment === "Negative") {
//             totalSentimentScore -= 1;
//         }
//     });

//     let overallSentiment = totalSentimentScore > 0 ? "Overall Sentiment: Positive" :
//         totalSentimentScore < 0 ? "Overall Sentiment: Negative" :
//             "Overall Sentiment: Neutral";

//     reviewsHTML += `</table><h4>${overallSentiment}</h4>`;
//     reviewsList.innerHTML = reviewsHTML;

//     moviesSection.style.display = 'none';
//     reviewsSection.style.display = 'block';
// }

async function showReviews(movieTitle) {
    const movie = movies.find(m => m.title === movieTitle);

    if (!movie) {
        console.error(`Movie with title "${movieTitle}" not found.`);
        return;
    } else {
        console.log(movie);
    }

    const reviews = await callOpenAIForReviews(movie.title) || [];


    const reviewsList = document.getElementById("reviews-list");

    if (!reviewsList) {
        console.error("missing.");
        return;
    }


    let reviewsHTML = `<h3>AI-Generated Reviews for ${movie.title}</h3><table><tr><th>Review</th><th>Sentiment</th></tr>`;
    let totalSentimentScore = 0;

    reviews.forEach(review => {
        const sentiment = analyzeSentiment(review);
        reviewsHTML += `<tr><td>${review}</td><td>${sentiment}</td></tr>`;
        totalSentimentScore += (sentiment === "Positive" ? 1 : sentiment === "Negative" ? -1 : 0);
    });

    const overallSentiment = totalSentimentScore > 0 ? "Overall Sentiment: Positive" :
        totalSentimentScore < 0 ? "Overall Sentiment: Negative" : "Overall Sentiment: Neutral";
    reviewsHTML += `</table><h4>${overallSentiment}</h4>`;

    reviewsList.innerHTML = reviewsHTML;
    moviesSection.style.display = 'none';
    reviewsSection.style.display = 'block';
}

function backToMoviesFunc() {
    reviewsSection.style.display = 'none';
    moviesSection.style.display = 'block';
}




async function showActorDetails(index) {
    const actor = actors[index];

    const actorInfoHTML = `
        <h3>${actor.name}</h3>
        <p><strong>Gender:</strong> ${actor.gender}</p>
        <p><strong>Age:</strong> ${actor.age}</p>
        <p><strong>IMDB:</strong> <a href="${actor.imdb}" target="_blank">Link</a></p>
        <img src="${actor.photo}" alt="${actor.name}" style="width:100px;"/>
    `;
    document.getElementById('actor-info').innerHTML = actorInfoHTML;

    let moviesAndShows = await callAIForMoviesAndShows(actor.name);

    if (moviesAndShows.length === 0) {
        actorMoviesList.innerHTML = `<li>Cannot find any Movies or TV shows ${actor.name} has played in.</li>`;
    } else {
        actorMoviesList.innerHTML = moviesAndShows.map(item => `<li>${item}</li>`).join("");
    }

    const tweets = await callAIForTweets(actor.name) || [];


    sentimentTable.innerHTML = '';

    let totalSentimentScore = 0;

    if (tweets.length > 0) {
        tweets.forEach(tweet => {
            const sentiment = analyzeSentiment(tweet);
            const row = `<tr><td>${tweet}</td><td>${sentiment}</td></tr>`;
            sentimentTable.innerHTML += row;

            if (sentiment === "Positive") {
                totalSentimentScore += 1;
            }
            else if (sentiment === "Negative") {
                totalSentimentScore -= 1;
            }
        });

        const overallSentiment = totalSentimentScore > 0 ? "Positive" : totalSentimentScore < 0 ? "Negative" : "Neutral";
        overallSentimentSpan.textContent = overallSentiment;
    } else {
        sentimentTable.innerHTML = "<tr><td colspan='2'>No tweets available.</td></tr>";
        overallSentimentSpan.textContent = "Neutral";
    }

    homeSection.style.display = 'none';
    actorsSection.style.display = 'none';
    actorDetailsSection.style.display = 'block';
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


backToMovies.addEventListener('click', function () {
    reviewsSection.style.display = 'none';
    moviesSection.style.display = 'block';
    document.getElementById('reviews-section').style.display = 'none'; // recently added, don't forget
    document.getElementById('movies-section').style.display = 'block';
});



backToActors.addEventListener('click', function () {
    actorDetailsSection.style.display = 'none';
    actorsSection.style.display = 'block';
});

moviesBtn.addEventListener('click', function () {
    homeSection.style.display = 'none';
    moviesSection.style.display = 'block';
    document.getElementById('link-actors-movies-btn').style.display = 'none';
});

actorsBtn.addEventListener('click', function () {
    homeSection.style.display = 'none';
    actorsSection.style.display = 'block';
    document.getElementById('link-actors-movies-btn').style.display = 'none';
});

backToHomeMovies.addEventListener('click', function () {
    moviesSection.style.display = 'none';
    homeSection.style.display = 'block';
    document.getElementById('link-actors-movies-btn').style.display = 'block';
});

backToHomeActors.addEventListener('click', function () {
    actorsSection.style.display = 'none';
    homeSection.style.display = 'block';
    document.getElementById('link-actors-movies-btn').style.display = 'block';
});

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

linkForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const newLink = {
        movieIndex: document.getElementById('movie-select').value,
        actorIndex: document.getElementById('actor-select').value
    };

    actorMovieLinks.push(newLink);

    localStorage.setItem('actorMovieLinks', JSON.stringify(actorMovieLinks));

    renderActorMovieLinks();
    linkForm.reset();
});

function deleteLink(index) {
    actorMovieLinks.splice(index, 1);
    localStorage.setItem('actorMovieLinks', JSON.stringify(actorMovieLinks));
    renderActorMovieLinks();
}



const backToHomeLinks = document.getElementById('back-to-home-links');

document.getElementById('link-actors-movies-btn').addEventListener('click', function () {
    homeSection.style.display = 'none';
    renderMovieSelect();
    renderActorSelect();
    renderActorMovieLinks();
    document.getElementById('link-actors-movies-btn').style.display = 'none';
    document.getElementById('actor-movie-link-section').style.display = 'block';
});

backToHomeLinks.addEventListener('click', function () {
    document.getElementById('actor-movie-link-section').style.display = 'none';
    homeSection.style.display = 'block';
    document.getElementById('link-actors-movies-btn').style.display = 'block';
});
