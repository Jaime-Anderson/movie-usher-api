// require express, morrgan, bodyParser, and uuid
const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid');

// set express function to a variable
const app = express();

let users = [
    {
        id: 1,
        name: "Kim",
        favoriteMovies: []
    },
    {
        id: 2,
        name: "Joe",
        favoriteMovies: ["The Fountain"]
    },
];

let movies = [
    {
        "Title": "The Fountain", 
        "Description": "As a modern-day scientist, Timmy is struggling with mortality, desperately searching for the medical breakthrough that will save the live of his cancer-stricken wife, Izzi.", 
        "Genre": {
            "Name": "Drama",
            "Description": "In film and television, drama is a category of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone.",
        },
        "Director":{
            "Name": "Darren Aronofsky",
            "Bio": "Darren Aronofsky was born in February, 1969 in Brooklyn, New York.",
            "Birth": 1969.0
        }, 
        "ImageURL": "http://t3.gstatic.com/licensed-image?q=tbn:ANd9GcTEX_fO7h80DOg2o7DGkf0It68EY97I77vgsHrfhWfAgFAiOuYopBtiFpQLd44V3V3hxnKePnntnzvJ7wo",
        "Featured": false
    },
    {
        "Title": "The Princess Bride", 
        "Description": "While home sick in bed, a young boy\'s grandfather reads him the story of a farmboy-turned-pirate who encounters numerous obstacles, enemies, and allies in his quest to be reunited with his true love.",
        "Genre": {
            "Name": "Action",
            "Description": "Action film is a film genre in which the protagonists are thrust into a series of events that typically include violence, extended fighting, physical feats, rescues, and frantic chases.",
        },
        "Director":{
            "Name": "Rob Reiner",
            "Bio": "When Rob Reiner graduated high school, his parents sent him to participate in Summer Theatre.",
            "Birth": 1947.0
        }, 
        "ImageURL": "https://flxt.tmsimg.com/assets/1448_v9_bb.jpg",
        "Featured": false   
    }
];

//apply bodyParser as middleware function
app.use(bodyParser.json());

//use Morgan to log all requests
app.use(morgan('common'));

//use express.static to serve documentation.html file from public folder
app.use(express.static('public'));

//CREATE
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser)
    } else {
        res.status(400).send('Users need names.')
    }
});

//UPDATE
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    //2 equal signs because id is a number and id is a string (truthiness)
    let user = users.find( user => user.id == id);

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send('No such user.')
    }
});

//CREATE
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;
    
    //2 equal signs because id is a number and id is a string (truthiness)
    let user = users.find( user => user.id == id);

    if (user) {
        user.favoriteMovies.push(movieTitle)
        res.status(200).send('${movieTitle} has been added to user ${id}\'s array');
    } else {
        res.status(400).send('No such user.')
    }
});

//DELETE
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;
    
    //2 equal signs because id is a number and id is a string (truthiness)
    let user = users.find( user => user.id == id);

    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle);
        res.status(200).send('${movieTitle} has been removed from user ${id}\'s array');
    } else {
        res.status(400).send('No such user.')
    }
});

//DELETE
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    
    //2 equal signs because id is a number and id is a string (truthiness)
    let user = users.find( user => user.id == id);

    if (user) {
        users = users.filter(user => user.id != id);
        res.status(200).send('User ${id} has been deleted.');
    } else {
        res.status(400).send('No such user.')
    }
});

//READ
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

//READ
app.get('/movies/:title', (req, res) => {
    //object destructuring format
    const { title } = req.params;
    const movie = movies.find( movie => movie.Title === title);

    if (movie) {
        res.status(200).json(movie);
    }else {
        res.status(400).send('No such movie.')
    }
});

//READ
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find( movie => movie.Genre.Name === genreName ).Genre;

    if (genre) {
        res.status(200).json(genre);
    }else {
        res.status(400).send('No such genre.')
    }
});

//READ
app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find( movie => movie.Director.Name === directorName ).Director;

    if (director) {
        res.status(200).json(director);
    }else {
        res.status(400).send('No such genre.')
    }
});

//create error-handling middleware function to log all app-level errors to terminal
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('There is a problem.');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.')
});


