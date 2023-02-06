// require express, bodyParser, uuid,
const express = require('express'),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    morgan = require('morgan');

const app = express();  
//apply bodyParser as middleware function
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

mongoose.connect('mongodb://0.0.0.0:27017/cfdb', { useNewUrlParser:
true, useUnifiedTopology: true });
mongoose.set('strictQuery', true);

//use express.static to serve documentation.html file from public folder
app.use(express.static('public'));

//use Morgan to log all requests
app.use(morgan('common'));

//Welcome response
app.get('/', passport.authenticate('jwt', {session: false }), (req, res) => {
    res.send('Welcome to Movie Usher!');
});

//Return a list of all movies
app.get('/movies', passport.authenticate('jwt', {session: false }), (req, res) => {
    Movies.find()
        .then((movies) => {
            res.json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

app.get('/users', passport.authenticate('jwt', {session: false }), (req, res) => {
    Users.find()
        .then((users) => {
            res.json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Return data about a single movie by title
app.get('/movies/:Title', passport.authenticate('jwt', {session: false }), (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .then((movie) => {
            res.status(201).json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
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
app.put('/users/:Username', passport.authenticate('jwt', {session: false }), (req, res) => {
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
app.post('/users/:Username/movies/:movieID', passport.authenticate('jwt', {session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $push: { Favorites: req.params.MovieID }
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
app.delete('/users/:Username/movies/:movieID', passport.authenticate('jwt', {session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $pull: { Favorites: req.params.MovieID }
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
app.delete('/users/:Username', passport.authenticate('jwt', {session: false }), (req, res) => {
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
//return data about a genre
app.get('/movies/genre/:Name', passport.authenticate('jwt', {session: false }), (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.Name})
        .then((movies) => {
            res.send(movies.Genre);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//READ
//return data about a director
app.get('/movies/director/:Name', passport.authenticate('jwt', {session: false }), (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.directorName })
    .then((movies) => {
        res.send(movies.Director);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//create error-handling middleware function to log all app-level errors to terminal
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('There is a problem.');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.')
});


