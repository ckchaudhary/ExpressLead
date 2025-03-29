'use strict';

let nonces = require('./nonces.js');

module.exports = {
    customHttpHeaders : function( req, res, next ){

		let inline_script_nonce = "'nonce-" + nonces.create( 'inline_script_nonce' ) + "'";

		// Content security policy
		let content_origins = [
			"default-src 'self' www.google.com;", // for resources from google.com
			"img-src 'self' data: cdn.jsdelivr.net;",
			"font-src 'self' fonts.gstatic.com cdn.jsdelivr.net cdnjs.cloudflare.com;",
			"style-src 'self' fonts.googleapis.com cdn.jsdelivr.net cdnjs.cloudflare.com;",
			"script-src 'self' ajax.googleapis.com cdn.jsdelivr.net " + inline_script_nonce + ";",// cdn for third partly libraries
			"frame-src 'self' www.youtube.com;",//This site uses a youtube video embed
			"object-src 'none';",// avoid execution of unsafe scripts.
			"frame-ancestors 'none';",//avoid rendering of page in <frame>, <iframe>, <object>, <embed>, or <applet>
			"form-action 'self';",//restrict form submission to the origin which the protected page is being served.
			"upgrade-insecure-requests;",//'upgrade-insecure-requests' and 'block-all-mixed-content' should be set to avoid mixed content (URLs served over HTTP and HTTPS) on the page.
		].join( ' ' );

		// Cache control
		let date_format   = 'D, d M Y H:i:s';
		let date_expiry = new Date();
		date_expiry.setDate(date_expiry.getDate() + 1);// Add a day
		
		// Remove unwanted headers
		res.removeHeader("server");
		// res.removeHeader("X-Powered-By");? may be don't need this

		// Add desired headers
		let headers = {
			"Content-Type" 				: "text/html; charset=UTF-8",
			"Strict-Transport-Security" : "max-age=31536000",
			"X-Frame-Options" 			: "DENY",
			"X-XSS-Protection" 			: 0,
			"X-Content-Type-Options" 	: "nosniff",
			"Referrer-Policy" 			: "strict-origin-when-cross-origin",
			"Content-Security-Policy" 	: content_origins,
			"Expires" 					: date_expiry.toUTCString(),
			"Cache-Control"				: "max-age="+ ( 24 * 60 * 60 ) +", must-revalidate",
		};
		res.set( headers );

		next();
	},
};
