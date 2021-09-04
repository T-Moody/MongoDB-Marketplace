// Tyler Moody
// App.js manages the infinity-market MongoDB database.
// ----------------------------------------------------------------
require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');  // ODM for MongoDB
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Import user and item routers.
const userRouter = require('./routers/User');      
const productRouter = require('./routers/Product');

// Connect to the database.
const url = process.env.MONGO_URL;
mongoose.connect(url, 
{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

// Start server on port.
const app = express();
app.listen(process.env.PORT);

app.set('views', path.join(__dirname, 'views')); // set the path to the views folder
app.set('view engine', 'ejs');                   // set the view engine to engine
app.use(express.urlencoded({extended: true}));   // to parse requests using req.body
app.use(express.json());                         // For recognizing incoming objects as json.
app.use(session({                                // Session values.
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
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