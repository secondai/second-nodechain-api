import { Router } from 'express';

import request from 'request'

// API is at /api/v1 !!!

const routes = Router();


routes.get('/', (req, res) => {
  res.send({
    test: 'ok'
  })
});



// // Manage Identity? 
// routes.post('/subdomain/:subdomain', async (req, res) => {

// 	const filterObj = {
// 		subdomain: req.params.subdomain,
// 		active: true
// 	}

// 	try {
// 		let data = await fetchOrganization(filterObj);
// 		if(!data){
// 			throw 'No subdomain found'
// 		}
// 		// sending db back to requester
// 		console.log('Sending back', data);
// 		res.send({
// 			_id: data._id,
// 			name: data.name,
// 			dbName: data.dbName
// 		});
// 	}catch(err){
// 		console.error('Missing subdomain!', req.params.subdomain, err);
// 		res.send({
// 			err: 'Missing subdomain'
// 		});
// 	}


// });






// Setup first user 
routes.get('/createuser', async (req, res) => {

	let resp = await createUser();
	res.send(resp);
	
});



function createUser(){
	return new Promise(async (resolve, reject)=>{

		const schema = await app.graphql.getAdminSchema();

	  let mutate_User = `
	    mutation (
	    	$record: CreateOneUsersInput!
	    ) {
        user {
          create(record: $record) {
            record {
            	_id
	            email
	            createdAt
	          }
          }
        }
	    }
	  `

	  let tmpRecord = {
	  	email: 'nicholas.a.reed@gmail.com',
	  	password: 'test',
	  	active: true,
	  	createdAt: (new Date()).getTime()
	  };

	  let result = await app.graphql.graphql({
	    schema: schema,
	    source: mutate_User,
	    context: {
	    	admin: true,
				schema: schema,
				user: null
			},
	    variableValues: {
	    	record: tmpRecord
	    }
	  })

	  console.log('CreateUser Result:', JSON.stringify(result,null,2));

	  if(result.data && result.data.user && result.data.user.create){
	  	resolve(result.data.user.create.record);
	  } else {
	  	console.error('Failed fetchUser in auth!', JSON.stringify(result,null,2));
	  	reject(result);
	  }


	})
}




export default routes;
