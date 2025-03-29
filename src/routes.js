'use strict';

module.exports = {
	routes : {
		app_config :null,
		router: null,
		init: function( config ){
			this.app_config = config;
			const express = require('express');
			this.router = express.Router();
			this.router.get( this.app_config.subdir + '/', function(req, res){
				let nonces = require( this.app_config.paths.lib + 'nonces.js');
				const data = {
					config: this.app_config,
					nonces: {
						'form-lead' : nonces.create( 'form-lead' ),
					},
				};
				res.render('index', data);
			}.bind(this));
	
			this.router.post( this.app_config.subdir + '/capture-lead', function( req, res, next ){
				// verify nonce
				let nonces = require( this.app_config.paths.lib + 'nonces.js');
				if ( ! nonces.verify( req.body._nonce, 'form-lead' ) ) {
					res.status(403).json({
						'success' : false,
						'message' : 'Security token has expired. Please reload the page and try again.'
					});
					return next();
				}

				//#region Validate form fields.
				const { getCountriesList } = require( this.app_config.paths.lib + 'countries-list.js');
				let allCountriesList = getCountriesList();

				const validate = require('validate.js');
				const fieldConstraints = {
					'name' : {
						presence: {
							message: "is required",
						},
						length: {
							minimum: 3,
							maximum: 100,
							message: "^Please enter your real name"
						},
					},
					'companyName' : {
						presence: {
							message: "is required",
						},
						length: {
							minimum: 3,
							maximum: 100,
							message: "doesn't appear right"
						},
					},
					'companyCountry' : {
						presence: {
							message: "is required",
						},
						inclusion: {
							within: allCountriesList,
							message: "^Company country is invalid."
						}
					},
					'phone' : {
						presence: {
							message: "is required",
						},
						length: {
							minimum: 3,
							maximum: 15,
							message: "^Please enter a valid phone number"
						},
					},
					'email' : {
						presence: {
							message: "is required",
						},
						email: { message: "is not valid" }
					},
					'countryOrigin' : {
						presence: {
							message: "is required",
						},
						inclusion: {
							within: allCountriesList,
							message: "^Country of origin is invalid."
						}
					},
					'countryOfDestination' : {
						presence: {
							message: "is required",
						},
						inclusion: {
							within: allCountriesList,
							message: "^Country of destination is invalid."
						}
					},
				};

				const validationResult = validate( req.body, fieldConstraints, {format: "flat"} );
				if ( validationResult ) {
					res.status(400).json({
						success: false,
						message: validationResult.join('.<br>') + '.',
					});
					return next();
				}

				//#endregion

				//#region Generate email body.
				const mail_subject = "ECU FCL - Contact form submission";
				let mail_message = "Following is the data submitted:<br>";
				let sender_email = 'no-reply@ecuworldwide.com';
				let mail_headers = {};

				const fields_to_include = {
					"name" 					: "Name",
					"phone" 				: "Phone",
					"email" 				: "Email",
					
					"companyName" 			: "Company Name",
					"companyCountry" 		: "Company Country",

					"countryOrigin" 		: "Country of origin",
					"countryOfDestination" 	: "Country of destination",
					
					"message" 				: "Comment",
				};
				
				let country_name = '';
				let isd_code = '';
				if ( Object.hasOwn( req.body, 'companyCountry' ) && req.body.companyCountry != '' && Object.hasOwn( allCountriesList, req.body.companyCountry ) ) {
					country_name = allCountriesList[ req.body.companyCountry ].name;
					isd_code = allCountriesList[ req.body.companyCountry ].isd;
				}

				for ( let field_name in fields_to_include ) {
					let field_val = '';
					let exists = Object.hasOwn( req.body, field_name );
			
					switch( field_name ) {
						case 'email':
							if ( exists ) {
								field_val = req.bodyEmail( field_name ).trim();
								sender_email = field_val;
							}
							break;

						case 'phone':
							if ( exists ) {
								field_val = req.bodyString( field_name ).trim();
							}
							
							field_val = '+' + isd_code + ' ' + field_val;
							break;
			
						case 'companyCountry':
							field_val = country_name;
							break;
			
						case 'countryOrigin':
						case 'countryOfDestination':
							if ( exists ) {
								let ccode = req.body[field_name];
								field_val = Object.hasOwn( allCountriesList, ccode ) ? allCountriesList[ ccode ].name : '';
							}
							break;

						default:
							if ( exists ) {
								field_val = req.bodyString( field_name ).trim();
							}
							break;

					}
					
					mail_message += fields_to_include[ field_name ] + ": " + field_val + "<br>";
				}

				if ( sender_email ) {
					mail_headers[ 'From' ] = sender_email;
				}

				//#endregion

				// Pass data over to emailer.

				let mailer = require( this.app_config.paths.lib + 'mailer.js');
				mailer.use( 'smtp' );
				mailer.send( this.app_config.lead_form.from, this.app_config.lead_form.recipients, mail_subject, mail_message, mail_headers);

				res.status(200).json({
					'success' : true,
					'message' : 'Thanks. Your enquiry has been received. We\'ll get back to you soon.'
				});
				return next();
			}.bind(this));
		},
	}
};