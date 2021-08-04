// Tyler Moody
// App.js manages the infinity-market MongoDB database
// ----------------------------------------------------------------
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');  // ODM for MongoDB
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Import user and item routers.
const userRouter = require('./routers/User');      
const productRouter = require('./routers/Product');

// Connect to the database.
const url = 'mongodb+srv://tpmoody:tbxNfEPjF5nCWbaI@cluster0.80n5j.mongodb.net/infinity-market?retryWrites=true&w=majority';
mongoose.connect(url, 
{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

// Start server on port.
const app = express();
const port = 3000;
app.listen(port);

app.set('views', path.join(__dirname, 'views')); // set the path to the views folder
app.set('view engine', 'ejs');                   // set the view engine to engine
app.use(express.urlencoded({extended: true}));   // to parse requests using req.body
app.use(express.json());                         // For recognizing incoming objects as json.
app.use(express.static(path.join(__dirname, 'public'))); // set the path to public assets
app.use(session({
    secret:'topsecretkey',
    resave:false,
    saveUninitialized:false,
    store: MongoStore.create({ mongoUrl: url })
}));

// Implement routers.
app.use(userRouter);  
app.use(productRouter);

// ----------------------------------------------------------------
// Path to home.
app.get('/', (req, res) => 
{
    res.send('This is the home page');
});