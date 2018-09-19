const config = require('./config/config');
const express = require('express');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');


const app = express();
app.use(cors({ optionsSuccessStatus: 200 }));

const MongoStore = require('connect-mongo')(session);
app.use(session({
	secret: config.express.sessionSecret,
	store: new MongoStore({
		mongooseConnection: mongoose.connection,
		ttl: config.sessionTimeout || 3600 // = 1 hour
	}),
	collection: 'sessions',
	resave: false,
	saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, '/public')));
app.use('/scripts', express.static(__dirname + '/node_modules'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

// setup routes
require('./routes').http(app);

module.exports = app;
