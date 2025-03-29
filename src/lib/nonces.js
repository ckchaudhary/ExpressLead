'use strict';

const crypto = require('crypto');
const options = {
	// It is safer to set this in an environment variable 'nonce_secret' 
	secret: process.env.nonce_secret || 'eiwiu9wqmiorl2342i712i4e',// Change it from time to time
	nonce_hash_max_length: 20,
	hashing_algo: 'sha256',
};

function nonce_tick() {
	let now = Math.floor(Date.now() / 1000);// current timestamp in seconds.
	let nonce_life = 1 * 24 * 60 * 60;// 1 day in seconds
	return Math.ceil( now / ( nonce_life / 2 ) );
}

function createHash( action ) {
	return crypto.createHmac(options.hashing_algo, options.secret)
           .update( action + options.secret)
           .digest('hex');
};

module.exports = {
    create: function( action, tick = false ) {
		if ( ! tick ) {
			tick = nonce_tick();
		}
        let hash = createHash( tick + '|' + action );
        hash = parseInt( options.nonce_hash_max_length ) > 0 ? hash.substr( 0, parseInt( options.nonce_hash_max_length ) ) : hash;
        return hash;
    },

	createExpired: function( action ) {
		let tick = nonce_tick();
		return this.create(action, tick - 2);
	},

	verify: function( hash, action){
		let tick = nonce_tick();

		// Nonce generated 0-12 hours ago.
        let expected = this.create(action, tick);
		if ( expected === hash ) {
			return 1;
		}

		// Nonce generated 12-24 hours ago.
		expected = this.create(action, tick - 1);
		if ( expected === hash ) {
			return 2;
		}

		// Expired|invalid nonce.
        return false;
    },
};
