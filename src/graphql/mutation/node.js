
import request from 'request-promise-native'

import { buildAll as Key_buildAll } from '../model/key'
import { buildAll as Node_buildAll } from '../model/node'


var Stringify = require('json-stable-stringify');

const uuidv4 = require('uuid/v4');
var SHA256 = require("crypto-js/sha256");
var NodeRSA = require('node-rsa');
var jsSchema = require('js-schema');

var AsyncLock = require('async-lock');
var lock = new AsyncLock({
  timeout: 5000
});

const buildMutationTC = (GQC, db, models, tcs) => {

  // const { NodeTC: NodeMutationTC } = Node_buildAll(db);
  // let NodeMutationTC = GQC.get('Node');
  const NodeMutationTC = tcs.Node;

  // console.log('NODE Model:',models.Node);

  NodeMutationTC.addResolver({
    name: 'load',
    type: NodeMutationTC,
    resolve: () => ({}),
  });

  NodeMutationTC.addResolver({
    name: 'add',
    args: {
      record: 'JSON'
    },
    type: 'JSON',
    resolve: async ({source, args, context, info}) => {
      
      // returns the new ID for the newly-created Node 
      console.log('Attempting to add Node');

      let {
        // ipfsHash,
        nodeInputStr, // aka "package" will be parsed, hash computed (should match signature, etc.) 
        pubKey, // author pubKey 
        chainPubKey,
        ref,
        version,
        nonce,
        signature
      } = args.record;

      ref = ref.toString();
      version = version.toString();
      nonce = nonce.toString();
      chainPubKey = chainPubKey.toString();


      // console.log('ARGS:', args);

      // console.log('nodeInputStr:', typeof nodeInputStr); //, nodeInputStr);

      let lockResult = await lock.acquire('default', async ()=>{
        // async work

        // validate chainPubKey 
        let Chain = await models.Chain.findOne({pubKey: chainPubKey}).exec();
        if(!Chain){
          console.log('Chain does not exist!');
          return {
            error: true,
            message: 'Chain does not exist'
          }
        }


        // TODO: permissions in "key" table 



        console.log('Verify content');

        // get hash from file contents 
        let ipfsHash;
        let ipfsRawResult;
        let ipfsBufferResult;
        let iNode;
        try {
          iNode = JSON.parse(nodeInputStr);
          // ipfsRawResult = Stringify(iNode);
          ipfsRawResult = JSON.stringify(iNode);
          ipfsBufferResult = new Buffer(ipfsRawResult,'utf8')
          // ipfsBufferResult = new Buffer(nodeInputStr,'utf8')
          let tmpVals = await app.ipfs.files.add(ipfsBufferResult);
          ipfsHash = tmpVals[0].hash;
        }catch(err){
          console.error(err);
          return {
            error: true,
            message: 'Unable to parse Node to create ipfs hash'
          }
        }

        // Length of node limited (100kb) 
        let sizeOfNode = ipfsBufferResult.length;
        if(sizeOfNode > 1024 * 100){
          return {
            error: true,
            message: 'Too large of a node'
          }
        }

        console.log('Size:', sizeOfNode);


        console.log('Checking PubKey');

        let key;
        try {
          key = new NodeRSA(pubKey);
        }catch(err){
          console.error(err);
          return {
            error: true,
            message: 'Invalid publicKey'
          }
        }

        // Check signature 
        console.log('Checking signature');

        // ipfsHash + sha256(pubKey) + version + nonce
        let arrToVerify = [
          ipfsHash, 
          // SHA256(pubKey).toString(),
          // (new Buffer(pubKey)).toString('base64'),
          pubKey,
          chainPubKey, //context.chainPubKey, // verifying intention was "this" chain 
          ref,
          version,
          nonce
        ];
        // console.log('strToVerify', JSON.stringify(arrToVerify,null,2));
        let strToVerify = arrToVerify.join('');
        let verified;
        try {
          verified = key.verify(strToVerify, signature, 'utf8', 'hex');
        }catch(err){
          console.error(err);
          return {
            error: true,
            message: 'Invalid publicKey',
            err
          }
        }

        if(!verified){
          console.log('Failed Signature!', arrToVerify);
          return {
            error: true,
            message: 'Verification of signature failed',
            arrToVerify
          }
        }

        // TODO: check publicKey authorship 
        // - every new Second creates a new Identity and needs to store it on here
        // - need some anti-spam measure for public keys (hashcash, payment verification via lightning?) 
        // console.log('Checking Key canCreate');

        // // Valid key for adding Nodes? (temporary?) 
        // let foundKey = await models.Key.findOne({
        //   pubKey,
        //   canCreate: true
        // });
        // if(!foundKey){
        //   console.log('PubKey not allowed to create new Nodes');
        //   return {
        //     error: true,
        //     message: 'PubKey not allowed to create new Nodes'
        //   }
        // }

        console.log('Checking nonce');

        // Verify input 
        // - valid nonce, version, etc. 
        let foundNonce = await models.Node.findOne({nonce}).exec();
        if(foundNonce){
          console.log('Failed Nonce!', nonce);
          return {
            error: true,
            message: 'Failed nonce'
          }
        }

        console.log('Found Nonce:', foundNonce, nonce);

        console.log('Checking Version/Ref match for author');

        // pubKey + ref + version must be unique! 

        let foundVersion = await models.Node.findOne({
          author: pubKey,
          ref,
          version
        }).exec();
        if(foundVersion){ // && foundVersion.author != pubKey){
          console.log('Failed author/pubKey+ref+version match for version', ref, version, foundVersion.author);
          return {
            error: true,
            message: 'Failed author/pubKey+ref+version match for version'
          }
        }


        // get package/Node stored in IPFS object 
        // - allows for "compromised" node to be added, which will prevent further nodes from being added? 
        //   - or leave "compromised" as a normal Node, and let the compromised key continue appending Nodes? 
        // let ipfsRawResult;
        // let iNode; // ipfsNode, object in Node format 
        // try {
        //   ipfsRawResult = await global.app.ipfs.files.cat(ipfsHash);

        //   // console.log('ipfs result str:', ipfsHash, ipfsRawResult);

        //   // console.log('toString:', ipfsRawResult.toString('utf8'));

        //   ipfsRawResult = ipfsRawResult.toString('utf8');

        //   iNode = JSON.parse(ipfsRawResult);

        // }catch(err){
        //   return {
        //     error: true,
        //     message: 'Failed parsing ipfs node data 1',
        //     err: err
        //   }
        // }

        console.log('Validating Node Schema');

        // Validate incoming Node 
        // - must be a valid Node 
        //   - only certain fields allowed on object 
        // - must have a valid "type" (or be a "schema") schema == "language"
        try {

          // TODO: check _.difference of Object.keys(iNode) 

          if(iNode.type == 'language'){
            // language node! 
            // - validate using the hardcoded language schema
            //   - TODO 

          } else {
            // type is an ipfs node! 
            // - get the node, which should have a jsSchema for it's data 
            // - type MUST exist in this chain (dont allow outside language?) 


            // let foundLanguage = await models.Node.findOne({ipfsHash: iNode.type}).exec();
            // if(!foundLanguage){
            //   return {
            //     error: true,
            //     message: 'Language not yet on this chain! add it first before adding new nodes of that type'
            //   }
            // }

            // // console.log('iNode type:', iNode.type);
            // // console.log('Found:', foundLanguage);

            // // return false;

            // // verify schema 
            // let validates = jsSchema.fromJSON(foundLanguage.data.schema);

            // if(!validates(iNode.data)){
            //   return {
            //     error: true,
            //     message: 'Node fails language schema validation'
            //   }
            // }


          }
        }catch(err){
          return {
            error: true,
            message: 'Failed parsing ipfs node data 2',
            err: err
          }
        }

        console.log('Pin remote');

        // // Pin remotely 
        // // - sends the data to pin, the hash, and signature of hash (signed by internal private key) 
        // let privateKeyRemote = (new Buffer(process.env.IPFS_REMOTE_PIN_PRIVATE_KEY,'base64')).toString('utf8')
        // let remoteKey = new NodeRSA(privateKeyRemote);
        // try {
        //   let remoteSig = remoteKey.sign(ipfsHash,'hex');
        //   // make remote request to Pin hash/file/node
        //   // - fails if this fails! 
        //   console.log('Making request', process.env.IPFS_REMOTE_URL + '/pin');
        //   let response = await request({
        //     url: process.env.IPFS_REMOTE_URL + '/pin',
        //     method: 'POST',
        //     body: {
        //       data: ipfsRawResult,
        //       hash: ipfsHash, // redundant, will get calculated from data
        //       signature: remoteSig
        //     },
        //     json: true
        //   });

        //   if(!response.pinned){
        //     return {
        //       error: true,
        //       message: 'Failed pinning to remote'
        //     }
        //   }

        // }catch(err){
        //   console.error(err);
        //   return {
        //     error: true,
        //     message: 'Failed pinning to remote'
        //   }
        // }

        // Create new node and save
        let newData = {
          // _id: uuidv4(),

          package: ipfsRawResult,
          ipfsHash,
          author: pubKey,
          ref,
          version,
          nonce,
          signature,

          chainPubKey, 
          // chain: app.publicKeyLocal, // always the same? 

          // extracted
          type: iNode.type,
          nodeId: iNode.nodeId,
          data: iNode.data,

          ready: false,

          createdAt: (new Date()).getTime()

        }

        // console.log('iNode:', iNode);
        // console.log('iNode DATA:', iNode.data);

        // TODO: sequence should be per-chain, not per the whole damn db 
        let nextId = await models.Node.nextCount(); // just for checking if previousNode shouldnt exist (id==1)

        // Get previous entry 
        // - will use package hash in signature of new node 
        let previousNode = await models.Node.findOne().sort({createdAt: -1});
        if(!previousNode && nextId != 1){
          // uh oh, should have a single node (unless this is id=1) 
          return {
            error: true,
            message: 'Missing previous Node internally'
          }
        }


        console.log('Next id:',nextId);


        // Save new node (get actual next id (shouldnt have changed)) 
        let newNode = new models.Node(newData);
        try {
          await newNode.save(newData);
        }catch(err){
          console.error(err);
          return {
            error: true,
            message: 'Failed saving locally',
            err
          }
        }

        // console.log('NewData:', JSON.stringify(newData));
        // console.log('NewNode:', JSON.stringify(newNode));

        // enough data for somebody to host eventlog and verify signatures 
        let savedBlockData = {
          data: {
            author: pubKey,
            id: newNode._id,
            node: ipfsHash,
            prev: previousNode ? previousNode.ipfsHashForThisNode : null, // previous entry in chain 
            chain: chainPubKey, // to identity "this" chain 
            ref,
            version,
            nonce,
            signature, // submitted signature
          },
          publicKey: chainPubKey, // our internal one, used for signing
          signature: null
        };


        let localKey = app.localKey; // stored on init

        // savedBlockData.publicKey = app.publicKeyLocal; //localKey.exportKey('public');

        let blockDataAsString = Stringify(savedBlockData.data);

        // Create signature for db entry 
        // - signing the entry
        let remoteSig2 = localKey.sign(blockDataAsString,'hex');
        savedBlockData.signature = remoteSig2;

        // Get ipfsHash of data (as an added file) 
        // - also add to the "perma-pin" api! 
        // console.log('------SAVEDBLOCK DATA1-----');
        // console.log(Stringify(savedBlockData));
        // console.log('------SAVEDBLOCK DATA2-----');
        let addedVerifiableEntries = await app.ipfs.files.add(new Buffer(Stringify(savedBlockData),'utf8'));
        console.log('hashes of db entries added', addedVerifiableEntries);

        let vHash = addedVerifiableEntries[0].hash;

        console.log('pinning to local');
        await app.ipfs.pin.add(vHash);

        // // calculate sig for storing data on remote Pin service 
        // let remoteSig3 = remoteKey.sign(vHash,'hex');

        // console.log('Adding permaPin2');
        // let permaPin2 = await request({
        //   url: process.env.IPFS_REMOTE_URL + '/pin',
        //   method: 'POST',
        //   body: {
        //     data: Stringify(savedBlockData),
        //     hash: vHash, // redundant, will get calculated from data
        //     signature: remoteSig3
        //   },
        //   json: true
        // });
        // console.log('Response from perma2:', permaPin2);


        // add chain hash to db also 
        newNode.ipfsHashForThisNode = vHash;
        newNode.ready = true;

        // Update node 
        try {
          // await newNode.save(newData);
          await newNode.save();
        }catch(err){
          console.error(err);
          return {
            error: true,
            message: 'Failed updating locally',
            err
          }
        }

        // // Add ipfsHashes to OrbitDB log 
        // // - ipfsHash of database entry, with signature 
        // // - sequential, in theory 
        // try {
        //   let orbitWrite = await app.orbitLogDb.add({
        //     _id: newNode._id,
        //     prev: previousNode ? previousNode.ipfsHashForThisNode : null,
        //     hash: vHash
        //   });
        //   console.log('Added to orbit log');
        // }catch(err){
        //   console.error('FAILED orbit DB writing:', err);
        // }

        // package: mongoose.Schema.Types.Mixed, // uploaded package, with signature, ipfs hash, nonce, etc. 
        // signature: String,

        // author: String, // base58 public key 
        // version: String, // never empty; random value, or should point at a previous _id. Validates matching author 

        // ipfsHash: String, // or "compromised" as a String to indicate the author has lost control of their private key 

        // // extracted information from IPFS node
        // type: String, // points to another IPFS node (stored in DB too) that MUST be a "language" node (name, schema). Or this must be a language node. 
        // nodeId: String, // might be pointing at another node on this chain
        // data: mongoose.Schema.Types.Mixed, // this is JSON parsed!

        let returnObj = {
          // complete: true,
          // args,
          // ipfsHash,
          // iNode,
          // parsed,
          ipfsHash,
          ledgerHash: vHash,
          node: newNode,
          // verified
        }
        // console.log('returnObj:', returnObj);

        console.log('Successful reponse (Node added to chain)');

        return returnObj;

      })
  
      console.log('Lock released');
      return lockResult;

      // , (err, ret)=>{
      //   if(err){
      //     console.error('Error in lock:', err);
      //   }
      //   // lock released
      //   console.log('Lock Released');
      //   return ret;
      // }, {
      //   timeout: 5000
      // });
    },
  });

  NodeMutationTC.addFields({
    add: NodeMutationTC.getResolver('add'),
    // create: NodeMutationTC.getResolver('createOne'),
    // updateById: NodeMutationTC.getResolver('updateById'),
    // updateOne: NodeMutationTC.getResolver('updateOne'),
    // updateMany: NodeMutationTC.getResolver('updateMany'),
    // removeById: NodeMutationTC.getResolver('removeById'),
    // removeOne: NodeMutationTC.getResolver('removeOne'),
    // removeMany: NodeMutationTC.getResolver('removeMany'),
  });

  return {
    NodeMutationTC
  }

}

export {
  buildMutationTC
}