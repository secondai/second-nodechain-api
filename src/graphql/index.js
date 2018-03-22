import mongoose from 'mongoose';
import getSchema from './schema'

import {graphql} from 'graphql'

import { autoIncrement } from 'mongoose-plugin-autoinc';

mongoose.Promise = global.Promise;

console.log('connecting to db:', process.env.MONGODB_URI, process.env.MONGODB_CONNECTION, process.env.MONGODB_DB);

// const connData = mongoose.createConnection(process.env.MONGODB_CONNECTION_CUSTOMER_DATA);
// const connAdmin = mongoose.createConnection(process.env.MONGODB_CONNECTION_ADMIN);
let connAdmin;
if(process.env.MONGODB_URI){
  connAdmin = mongoose.connect(process.env.MONGODB_URI);
} else {
  connAdmin = mongoose.createConnection(process.env.MONGODB_URI ? process.env.MONGODB_CONNECTION : process.env.MONGODB_CONNECTION);
}

// //Set up default mongoose connection
// var mongoDB = process.env.MONGODB_CONNECTION;
// mongoose.connect(mongoDB, {
//   useMongoClient: true
// });

// connection to admin db (for listing all tenants) 
// - should just grab tenant list periodically? 
let adminDb;
if(process.env.MONGODB_URI){
  adminDb = connAdmin;
} else {
  adminDb = connAdmin.useDb(process.env.MONGODB_DB); //'admindb');
}



// //Bind connection to error event (to get notification of connection errors)
// adminDb.on('error', console.error.bind(console, 'MongoDB adminDb connection error:'));

global.TENANT_SCHEMAS = {};


// setTimeout(async ()=>{
//   console.log('MONGOOSE');

//   const schema = await app.graphql.getAdminSchema();

//   let searches = [{
//     ref: '7f950e80-f17c-4268-a0f6-1ba949893077'
//   }];

//   let results = [];
//   for(let search of searches){
//     let node = await schema.__models.Node.findOne(search)
//     .sort({createdAt: -1})
//     .exec();
//     if(node){
//       results.push(node);
//     }
//   }

//   console.log('Returning SEARCH nodes');
//   console.log(results.map(r=>{
//     return {
//       _id: r._id,
//       ref: r.ref,
//       version: r.version,
//       dataV: r.data.version
//     }
//   }));



// },500);


// Get or Setup tenant schema for a request 
function getAdminSchema(){ // subdomain.corp
  return new Promise((resolve,reject)=>{

    console.log('Getting adminSchema');
    
    if(global.ADMIN_SCHEMA){
      // console.log('Schema cached for tenant:', tenant._id);
      return resolve(global.ADMIN_SCHEMA);
    }

    // setup schema and resolve
    global.ADMIN_SCHEMA = getSchema(adminDb);
    resolve(global.ADMIN_SCHEMA);

    // if(!tenant || !tenant._id){
    //   console.log('Invalid tenant:', tenant._id, tenant.db);
    //   return reject();
    // }

    // if(global.TENANT_SCHEMAS[tenant._id]){
    //   // console.log('Schema cached for tenant:', tenant._id);
    //   return resolve(global.TENANT_SCHEMAS[tenant._id]);
    // }

    // let tenantDb = connData.useDb(tenant.db);

    // // setup schema and resolve
    // let newSchema = getSchema(tenantDb);

    // // set global
    // global.TENANT_SCHEMAS[tenant._id] = newSchema;

    // resolve(newSchema);

  })
}

export default {
  graphql,
  getAdminSchema,
  autoIncrement
}