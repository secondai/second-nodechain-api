import { Router } from 'express';

import request from 'request-promise-native'

const path = require('path');

const bodyParser = require('body-parser');

const {graphqlExpress, graphiqlExpress} = require('apollo-server-express');

var NodeRSA = require('node-rsa');

// const schema = app.graphql.schema;

const routes = Router();


const middlewareGetAdminSchema = (req, res, next)=>{
	console.log('middlewareGetAdminSchema');
	app.graphql.getAdminSchema(req.tenant)
	.then((schema)=>{
		req.schema = schema;
		next();
	})
	.catch(err=>{
		console.error('--Failed getAdminSchema--');
		console.error(err);
	})
}



// simple replacement for generating a fucking hash. should be a library to make this easier to avoid installing all of js-ipfs everywhere 
routes.use('/ipfs/gethash', async (req,res,next)=>{
  // console.log('ipfs gethash');

  try {
    let body = req.body;

    console.log('BODY', typeof body, body);

    let entries = await app.ipfs.files.add(new Buffer(body.string,'utf8'));

    res.send(entries[0].hash);

  }catch(err){
    console.error('Failed ipfs gethash:',err);
    res.status(400).send('Failed ipfs gethash');
  }

});


// routes.get('/', (req, res) => {
//   res.render('index', { title: 'Second' });
// });

// // Auth here, includes passport.initialize
// routes.use('/auth', bodyParser.json(), middlewareGetAdminSchema, require('./auth').default);

// default api entrypoint for adding nodes 
routes.post('/nodes/add', middlewareGetAdminSchema, async (req,res,next)=>{
  let body = req.body;

  let addedNode = await createNode(body);

  res.send(addedNode);
});

routes.post('/nodes/find', middlewareGetAdminSchema, async (req,res,next)=>{
  let body = req.body;

  // Finding latest/recent for a ref/author 
  // - running in here, to make a single query (temporary) 

  console.log('nodes/find', body);

  const schema = await app.graphql.getAdminSchema();

  let searches = body.searches || [];

  let results = [];
  for(let search of searches){
    let node = await schema.__models.Node.findOne(search)
    .sort({createdAt: -1})
    .exec();
    if(node){
      results.push(node);
    }
  }

  console.log('Returning nodes');
  res.send(results);
});

routes.post('/nodes/types', middlewareGetAdminSchema, async (req,res,next)=>{
  let body = req.body;

  // Returns distinct types 
  // - TODO: integrate into normal search 

  console.log('nodes/find', body);

  const schema = await app.graphql.getAdminSchema();

  let searches = body.searches || [];

  let results = [];
  let nodes = await schema.__models.Node.find({type: 'language'}).distinct('data.name').exec();

  console.log('Returning distinct types');
  res.send(nodes);
});



routes.use('/graphql', bodyParser.json(), middlewareGetAdminSchema, graphqlExpress(req => {

	console.log('graphql request');

	// // console.debug('USER:', req.user, req.session);
	// console.log('SESSION:', req.session.what);
	console.log('Session user:', req.session ? req.session.user:null);

	// Should have already authenticated the incoming request (JWT) 
	// - might be coming from a subdomain/customer (addUser aka inviteUser) 

	return {
		schema: req.schema,
		context: {
			schema: req.schema,
			user: req.session ? req.session.user : null  //req.session ? req.session.user:null
			// organizations...
			// oauth applications...
		}
}}));

routes.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
}));



// Return public key for verification 
routes.get('/chainkey',async(req,res)=>{
	res.send({
		key: app.publicKeyLocal,
		orbitAddress: null // TODO
	});
});


// cat'ing ipfs file (cuz browser doesnt work) 
routes.post('/node/:hash',async(req,res)=>{

	console.log('Fetching ipfs file from hash');

	let ipfsHash = req.params.hash;


  let response = await request({
    url: process.env.IPFS_REMOTE_URL + '/hash/' + ipfsHash,
    method: 'POST',
    body: {},
    json: true
  });

  let ipfsRawResult;
  // let iNode; // ipfsNode, object in Node format 
  try {
    // ipfsRawResult = await global.app.ipfs.files.cat(ipfsHash);
    ipfsRawResult = response.data;

    // console.log('ipfs result str:', ipfsHash, ipfsRawResult);

    // console.log('toString:', ipfsRawResult.toString('utf8'));

    // ipfsRawResult = ipfsRawResult.toString('utf8'); // not 

    // iNode = JSON.parse(ipfsRawResult);

  }catch(err){
  	console.error(err);
    return res.send({
      error: true,
      message: 'Failed parsing ipfs node data 1',
      err: err
    })
  }

  res.send({
  	data: ipfsRawResult
  });

});



// Fallback to displaying web_app
// - TODO: in api-only mode, redirect to homepage (or show an error) 
routes.use((req, res, next) => {
  
  var options = {
    root: app.publicDir
    // dotfiles: 'deny',
    // headers: {
    //     'x-timestamp': Date.now(),
    //     'x-sent': true
    // }
  };

  var fileName = 'index.html'
  res.sendFile(fileName, options, function (err) {
    if (err) {
    	console.error(err);
      next(err);
    } else {
      console.log('Sent:', fileName);
    }
  });

});

// routes.use('/api/v1', middlewareGetAdminSchema, require('./api').default);

function createNode(record){
  return new Promise(async (resolve, reject)=>{

    const schema = await app.graphql.getAdminSchema();

    let mutate_Node = `
      mutation (
        $record: JSON!
      ) {
        node {
          add(record: $record) 
        }
      }
    `

    let result = await app.graphql.graphql({
      schema: schema,
      source: mutate_Node,
      context: {
        admin: true,
        schema: schema,
        user: null
      },
      variableValues: {
        record
      }
    })

    // console.log('CreateNode Result:', JSON.stringify(result,null,2));

    if(result.data && result.data.node && result.data.node.add){
      resolve(result.data.node.add);
    } else {
      console.error('Failed createNode', JSON.stringify(result,null,2));
      reject(result);
    }


  })
}




export default routes;
