// rootQuery.js
// import { GQC } from 'graphql-compose';
import { ViewerLoader } from './query/viewer';
// import { AdminTC } from './admin';

import { composeWithMongoose } from 'graphql-compose-mongoose'

function setupRoot(GQC, db){

	// modifies GQC in place 

	const { ViewerTC, models, tcs } = ViewerLoader(GQC, db);

	// console.log('GQC.rootQuery');
	GQC.rootQuery().addFields({
	  viewer: ViewerTC.get('$load'),
	  // admin: AdminTC.get('$onlyForAdmins'),
	});

	// expose `context` into schema
	[ViewerTC].forEach((TC) => {
	  TC.addFields({
	    contextData: {
	      type: 'JSON',
	      description: 'Context data of current client',
	      resolve: (source, args, context) => context,
	    },
	  });
	});

	return {
		models,
		tcs
	}

}

export {
	setupRoot
}