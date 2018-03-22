import mongoose from 'mongoose';
import composeWithDataLoader from 'graphql-compose-dataloader';
import { composeWithMongoose, mongooseTypeStorage } from 'graphql-compose-mongoose';
// import { GQC } from 'graphql-compose';

const buildAll = (db) => {

  const NodeSchema = new mongoose.Schema({

    // _id: {
    //   type: String,
    //   // unique: true,
    //   // index: true
    // },

    ready: Boolean, // only used after saved 2nd time (counter/id is used in signature) 

    // counter: {
    //   type: Number,
    //   index: true
    // },

    // package: mongoose.Schema.Types.Mixed, // uploaded package, with signature, ipfs hash, nonce, etc. 
    package: String, // JSON.stringified, uploaded package, with signature, ipfs hash, nonce, etc. 
    signature: String,
    nonce: String,

    author: String, // public Key (eventually just an address?) 

    ref: String, // never empty; random value, or should point at a previous _id to reference a "common" node 
    version: String, // integer > 0

    // author+ref+version should be unique! 

    ipfsHash: String, // or "compromised" as a String to indicate the author has lost control of their private key 

    // extracted information from IPFS node
    type: String, // points to another IPFS node (stored in DB too) that MUST be a "language" node (name, schema). Or this must be a language node. 
    nodeId: String, // might be pointing at another node on this chain
    data: mongoose.Schema.Types.Mixed, // this is JSON parsed!


    ipfsHashForThisNode: String, // the ipfsHash for this block....for hosting a partial node instead of a full node (storage difference) 

    createdAt: {
      type: Number,
      index: true
    },
    
  },{
    minimize: false
  });

  NodeSchema.plugin(app.graphql.autoIncrement, {
    model: 'Nodes',
    // field: 'counter',
    startAt: 1,
    // incrementBy
  });

  const NodeModel = db.model('Nodes', NodeSchema);
  mongooseTypeStorage.clear();
  const NodeTC = composeWithDataLoader(composeWithMongoose(NodeModel));

  return {
    NodeSchema,
    NodeModel,
    NodeTC
  }

}

export {
  buildAll
}
