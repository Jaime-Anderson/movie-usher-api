// require express, bodyParser, uuid,
const express = require('express'),
    bodyParser = require('body-parser'),
    uuid = require('uuid');

const morgan = require('morgan');
const app = express();    
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/cfdb', { useNewUrlParser:
true, userUnifiedTopology: true });
mongoose.set('strictQuery', true);

//apply bodyParser as middleware function
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//use Morgan to log all requests
app.use(morgan('common'));

//use express.static to serve documentation.html file from public folder
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('Welcome to Movie Usher!');
});

//CREATE
//add a user
/*JSON expected in following format
{
    ID: Integer,
    Username: String,
    Password: String,
    Email: String,
    Birthday: Date
} */
app.post('/users', (req, res) => {
    Users.findOne({ Username: req.body.Username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Username + 'already exists');
            } else {
                Users
                    .create({
                        Username: req.body.Username,
                        Password: req.body.Password,
                        Email: req.body.Email,
                        Birthday: req.body.Birthday
                    })
                    .then((user) => {res.status(201).json(user)})
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Error:' + error);
                    })
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error:' + error);
        });
});

//UPDATE
/*Update a user's info by username
JSON expected in following format:
{
    Username: String,
    (required)
    Password: String, 
    (required)
    Email: String,
    (required)
    Birthday: Date
} */
app.put('/users/:Username', (req, res) => {
   Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
        {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    },
    { new: true }, //ensures updated document is returned
    (err, updatedUser) => {
        if(err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
});

//CREATE
//add a movie to a user's list of favorites
app.post('/users/:Username/movies/:movieID', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $push: { FavoriteMovies: req.params.MovieID }
    },
    { new: true }, //ensures updated document is returned
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
});

//DELETE
//delete a movie from a user's list of favorites
app.delete('/users/:Username/movies/:movieID', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $pull: { FavoriteMovies: req.params.MovieID }
    },
    { new: true }, //ensures updated document is returned
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
});

//DELETE
//delete a user by username
app.delete('/users/:Username', (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Username + ' was not found.');
            } else {
                res.status(200).send(req.params.Username + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
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


