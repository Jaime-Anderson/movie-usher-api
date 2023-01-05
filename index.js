// require express and set express function to a variable
const express = require('express'),
    morgan = require('morgan');

const app = express();

//set topMovies to include top 10 movies
let topMovies = [
    {
        title: 'Lord of the Rings',
        actors: ['Elijah Wood', 'Ian McKellan'] 
    }, 
    {
        title: 'Harry Potter and the Sorcerer\'s Stone',
        actors: ['Daniel Radcliffe', 'Emma Watson', 'Rupert Grint']
    },
    {
        title: 'Big Fish',
        actors: ['Ewan McGregor', 'Helena Bonham Carter', 'Billy Crudup']
    },
    {
        title: 'Edward Scissorhands',
        actors: ['Johnny Depp', 'Winona Rider']
    },
    {
        title: 'Dune',
        actors: ['Timothee Chalamet', 'Zendaya']
    },
    {
        title: 'The Chronicles of Narnia: The Lion, the Witch, and the Wardrobe',
        actors: ['Skandar Keynes', 'Anna Popplewell', 'Georgie Henley', 'William Moseley']
    },
    {
        title: 'Bridge to Terabithia',
        actors: ['Josh Hutcherson', 'AnnaSophia Robb']
    },
    {
        title: 'The Princess Bride',
        actors: ['Cary Elwes', 'Robin Wright', 'Mandy Patinkin']
    },
    {
        title: 'The Age of Adaline',
        actors: ['Blake Lively', 'Harrison Ford', 'Michiel Huisman']
    },
    {
        title: 'Pirates of the Caribbean: The Curse of the Black Pearl',
        actors: ['Johnny Depp', 'Orlando Bloom', 'Keira Knightley'] 
    },
];

//use Morgan to log all requests
app.use(morgan('common'));

//use express.static to serve documentation.html file from public folder
app.use('/documentation.html', express.static('public'));

//create an Express GET route at endpoint "/" with textual response
app.get('/', (req, res) => {
    res.send('Welcome to Movie Usher!')
});

//create an Express GET route at endpoint "/movies" containing data about top 10 movies
app.get('/movies', (req, res) => {
    res.json(topMovies);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('There is a problem.');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.')
});


