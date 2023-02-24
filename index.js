// require express & morgan
const express = require("express");
const morgan = require("morgan");

const app = express();  

const { check, validationResult } = require('express-validator');

//use CORS within application
const cors = require('cors');

let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

app.use(cors({
    origin: (origin, callback) => {
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1) {
            let message = 'The CORS policy for this application doesn not allow access from origin ' + origin;
            return callback(new Error(message ), false);
        }
        return callback(null, true);
    }
}));

//apply bodyParser as middleware function
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

/* the following code connects to the local database and can be used for testing purposes.
mongoose.connect('mongodb://0.0.0.0:27017/cfdb', { useNewUrlParser:
true, useUnifiedTopology: true });*/

//the code below connects to the online database
mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser:
true, useUnifiedTopology: true });

mongoose.set('strictQuery', true);

//use express.static to serve documentation.html file from public folder
app.use(express.static('public'));

//use Morgan to log all requests
app.use(morgan('common'));

//Welcome response
app.get('/', (req, res) => {
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
      .populate("Favorites")
      .then((users) => {
        res.json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
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
//add a new user
/*JSON expected in following format
{
    ID: Integer,
    Username: String,
    Password: String,
    Email: String,
    Birthday: Date
} */
app.post('/users', [
    check('Username', 'Username is required.').isLength({min: 5}), 
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid.').isEmail()
], (req, res) => {
    //check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Username + 'already exists');
            } else {
                Users
                    .create({
                        Username: req.body.Username,
                        Password: hashedPassword,
                        Email: req.body.Email,
                        Birthday: req.body.Birthday
                    })
                    .then((user) => {res.status(201).json(user) })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Error: ' + error);
                    });
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
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
app.put('/users/:Username', [
    check('Username', 'Username is required.').isLength({min: 5}), 
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid.').isEmail()
], passport.authenticate('jwt', {session: false }), (req, res) => {
    //check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

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
        $push: { Favorites: req.params.movieID }
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
        $pull: { Favorites: req.params.movieID }
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
    Movies.findOne({ 
        'Genre.Name': {
            $regex: '^@{req.params.Name}$',
            $options: 'i',
        },
        })
        .then((movies) => {
            console.log(movies);
            res.send(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//READ
//return data about a director
app.get('/movies/director/:Name', passport.authenticate('jwt', {session: false }), (req, res) => {
  Movies.findOne({ 'Director.Name': {
        $regex: '^${req.params.Name}$',
        $options: 'i',
        },
    })
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

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});



