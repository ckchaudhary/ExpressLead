const APP_CONFIG = {
	/**
	 * Set the environment to 'production' with caution.
	 * If set to production,
	 *   - Google tag mangers and other tracking codes are printed.
	 */
	'IS_PRODUCTION' : process.env.NODE_ENV === 'production',

	// Is the application running in a subdirectory?
	// If the landing page is at domain.com or sub.domain.com then 'subdir' should be blank.
	// However, if the landing page is at domain.com/new-project/campaign then 'subdir' should be '/new-project/campaign' 
	// You can set that as an environment variable or just hardcode it below.
	'subdir' : process.env.APP_SUBDIR || '',

	// Port number.
	'port'   : process.env.PORT || 4467,

	// Do not change this, if you are not sure.
	'paths' : {
		'src' : __dirname + '/src/',
		'lib' : __dirname + '/src/lib/',
	},

	'lead_form' : {
		// A verified, whitelisted, sender. E.g: no-reply@yourdomain.com 
		'from' : process.env.EMAIL_SENDER,
		// List of email address which receive an email containing data of form submissions. Add multiple email addresses, separated by commas.
		'recipients' : process.env.LEAD_EMAIL_RECIPIENTS,
	},
};

const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(require('sanitize').middleware);// Middleware for sanitization.

app.use(express.static('public'));

// Manage http headers
app.disable('x-powered-by');
const headers_manager = require( APP_CONFIG.paths.lib + 'http-headers.js');
app.use(headers_manager.customHttpHeaders);

// Views and template engine.
app.set('view engine', 'ejs');
app.set('views', APP_CONFIG.paths.src + 'views');

const app_routes = require( APP_CONFIG.paths.src + 'routes.js' );
app_routes.routes.init( APP_CONFIG );
app.use('/', app_routes.routes.router);

app.listen( APP_CONFIG.port );
