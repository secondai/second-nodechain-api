import express from 'express';
import path from 'path';
import logger from 'morgan';
import bodyParser from 'body-parser';

import fs from 'fs'

import request from 'request-promise-native'


var Stringify = require('json-stable-stringify');


const util = require('util');

var helmet = require('helmet')
var cors = require('cors');
var cookieParser = require('cookie-parser')
var compression = require('compression')

var utilLogger = require("./utils/logging");

const IPFS = require('ipfs')
// const Repo = require('ipfs-repo') // useless
const OrbitDB = require('orbit-db')

const wrtc = require('wrtc') // or require('electron-webrtc')()
const WStar = require('libp2p-webrtc-star')

const NodeRSA = require('node-rsa');
const uuidv4 = require('uuid/v4');

const app = express();
global.app = app;


// Get public key for Node Chain 
console.log('Creating Public Key from stored Private Key. for Chain verification');
if(!process.env.PRIVATE_KEY_BASE64){
  console.error('MISSING process.env.PRIVATE_KEY_BASE64');
}
app.privateKeyLocal = (new Buffer(process.env.PRIVATE_KEY_BASE64,'base64')).toString('utf8');
app.localKey = new NodeRSA(app.privateKeyLocal);
app.publicKeyLocal = app.localKey.exportKey('public');

app.publicDir = path.join(__dirname, '../public/');

// // global.console = utilLogger;
// // utilLogger.debug("Overriding 'Express' logger");
// // app.use(utilLogger.middleware);
// app.use(require('morgan')('combined', { "stream": utilLogger.stream }));

// GraphQL Setup (mongoose models) 
app.graphql = require('./graphql').default;

app.use(cors({
	origin: '*',
	credentials: true
}));
app.use(cookieParser())

// app.use(helmet({
// }))

app.use(compression())

// View engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

// app.use(logger('dev', {
//   skip: () => app.get('env') === 'test'
// }));
app.use(bodyParser.json({
  limit: '10mb'
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));

// Session (redis)
const session = require('express-session');
// const RedisStore = require('connect-redis')(session);
// var redis = require("redis"),
//     redisClient = redis.createClient();
// redisClient.on("error", function (err) {
//     console.error("Error " + err);
// });
// const redisOptions = {
// 	client: redisClient
// }
app.use(session({
  // store: new RedisStore(redisOptions),
  secret: 'sdjkfhsdjkhf92312',
  resave: false,
  saveUninitialized: true,
  cookie: {
  	domain: false, //'acme.etteserver.test',
  	sameSite: false
  }
}));

// console.log('session setup 1');

// app.use('/import-initial', async (req,res,next)=>{
//   // Write language nodes 
//   console.log('import-initial');

//   // temporary, for writing initial languages
//   let keyString = (new Buffer(process.env.TMP_PRIVATE_KEY_FOR_WRITING,'base64')).toString('utf8');
//   let key = new NodeRSA(keyString);
//   let pubKey = key.exportKey('public');
//   let chainPubKey = (new Buffer(process.env.TMP_REMOTE_CHAIN_PUBLIC_KEY,'base64')).toString('utf8');

//   let schema = await app.graphql.getAdminSchema();
//   let models = schema.__models;

//   let allLanguage = await models.Language.find();

//   let nodes = [];

//   console.log('iterate over languages');
//   for(let lang of allLanguage){
//     // console.log('lang');

//     let slug = lang.slug;
//     let parts = slug.split(':');
//     let nodeInputStr = Stringify({
//       type: 'language',
//       data: {
//         slug,
//         name: parts[0],
//         version: parts[1],
//         location: parts[2],
//         ref: parts[3],
//         description: '',
//         schema: lang.schemaObj
//       }
//     });

//     // console.log('--node--');
//     // console.log(nodeInputStr);
//     // console.log(JSON.parse(nodeInputStr));

//     // nodes.push(JSON.parse(nodeInputStr));

//     let vals = await app.ipfs.files.add(new Buffer(nodeInputStr,'utf8'));
//     let ipfsHash = vals[0].hash;

//     let ref = uuidv4();
//     let version = 1;
//     let nonce = uuidv4();

//     // ipfsHash + sha256(pubKey) + version + nonce
//     let strToSign = [
//       ipfsHash, 
//       // SHA256(this.state.pubKey).toString(),
//       pubKey,
//       // btoa(this.state.pubKey),
//       chainPubKey, 
//       ref,
//       version,
//       nonce
//     ];

//     strToSign = strToSign.join('');
//     let signature = key.sign(strToSign,'hex');

//     // console.log('signature:', signature);

//     let nodeToAdd = {
//       nodeInputStr, // converted to ipfsHash 
//       pubKey,
//       ref,
//       version,
//       nonce,
//       signature
//     }

    
//     // console.log('Adding node to chain');
//     let nodeAdded = await request({
//       // url: 'http://localhost:7011/nodes/add',
//       url: 'https://api.getasecond.com/nodes/add',
//       method: 'POST',
//       body: nodeToAdd,
//       json: true
//     });

//     // if(lang.slug == 'testing_sample:0.0.1:local:8293h2f24'){
//     //   // console.log();
//     //   console.log(nodeInputStr);
//     //   console.log(nodeAdded);
//     //   throw "TESTING SAMPLE";
//     // }
//     // console.log('Response from NodeChain:', nodeAdded);
    
//     // res.send({
//     //   nodeAdded
//     // });

//     // throw "Stop1"

//     nodes.push(nodeAdded);
//   }

//   res.send({
//     key: key.exportKey('public'),
//     nodes
//   });


// })


function repoInit(repo){
  return new Promise((resolve,reject)=>{
    repo.init({},(err)=>{
      if(err){
        return reject();
      }
      resolve();
    })
  })
}

function ipfsInstanceReady(ipfsInstance){
  return new Promise((resolve,reject)=>{
    ipfsInstance.on('ready', () => {
      resolve();
    });
  })
}
function ipfsInstanceStop(ipfsInstance){
  return new Promise((resolve,reject)=>{
    ipfsInstance.stop(() => {
      resolve();
    });
  })
}

// Load IPFS repo if exists (.env) 
function ipfsSetup(){
  return new Promise((resolve,reject)=>{

    setTimeout(async()=>{

      console.log('Starting ipfs setup');

      // OrbitDB uses Pubsub which is an experimental feature
      let repoDir = 'repo/ipfs1';

      const wstar = new WStar({ wrtc: wrtc })
      let ipfsOptions = {
        // repo: './ipfs-repo',

        init: true,
        // start: false, // we'll start it after overwriting the config file! 

        repo: repoDir,
        pass: 'passwordpasswordpasswordpassword', // i set this beforehand! 

        EXPERIMENTAL: {
          pubsub: true
        },

        libp2p: {
          modules: {
            transport: [wstar],
            discovery: [wstar.discovery]
          }
        },

        config: {
          "Addresses": {
            "Swarm": [
              "/ip4/0.0.0.0/tcp/4002",
              "/ip4/127.0.0.1/tcp/4003/ws",
              // "/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star",
              "/dns4/wrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star"
            ],
            "API": "/ip4/127.0.0.1/tcp/5002",
            "Gateway": "/ip4/127.0.0.1/tcp/9090"
          },
          "Discovery": {
            "MDNS": {
              "Enabled": true,
              "Interval": 10
            },
            "webRTCStar": {
              "Enabled": true
            }
          },
          // "Bootstrap": [
          //   "/ip4/104.236.176.52/tcp/4001/ipfs/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z",
          //   "/ip4/104.131.131.82/tcp/4001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
          //   "/ip4/104.236.179.241/tcp/4001/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM",
          //   "/ip4/162.243.248.213/tcp/4001/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm",
          //   "/ip4/128.199.219.111/tcp/4001/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu",
          //   "/ip4/104.236.76.40/tcp/4001/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64",
          //   "/ip4/178.62.158.247/tcp/4001/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd",
          //   "/ip4/178.62.61.185/tcp/4001/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3",
          //   "/ip4/104.236.151.122/tcp/4001/ipfs/QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx",
          //   "/ip6/2604:a880:1:20::1f9:9001/tcp/4001/ipfs/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z",
          //   "/ip6/2604:a880:1:20::203:d001/tcp/4001/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM",
          //   "/ip6/2604:a880:0:1010::23:d001/tcp/4001/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm",
          //   "/ip6/2400:6180:0:d0::151:6001/tcp/4001/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu",
          //   "/ip6/2604:a880:800:10::4a:5001/tcp/4001/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64",
          //   "/ip6/2a03:b0c0:0:1010::23:1001/tcp/4001/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd",
          //   "/ip6/2a03:b0c0:1:d0::e7:1/tcp/4001/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3",
          //   "/ip6/2604:a880:1:20::1d9:6001/tcp/4001/ipfs/QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx",
          //   "/dns4/wss0.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic",
          //   "/dns4/wss1.bootstrap.libp2p.io/tcp/443/wss/ipfs/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6",
          //   "/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star/ipfs/QmVNqmWGV248kCZpJq2yXSYzTQi5the7vxs82HLfZj3tcK" // necessary?
          // ]
        }
      }

      // let configPath = path.resolve(repoDir,'./config');
      // let configExists = fs.existsSync(configPath);

      // if(!process.env.IPFS_CONFIG_64){
      //   console.error('Missing process.env.IPFS_CONFIG_64'); // need to generate once, then notify user that we're waiting (and have a valid config file to use) 

      //   // const repo = new Repo(repoDir)
      //   // await repoInit(repo);
      //   // let configFile = fs.readFileSync(configPath, 'utf8');
      //   // console.log('newFile:', configFile);
      //   // return;

      // }

      // // If directory exists, update with correct config file we already stored 
      // console.log('ConfigPath:', configPath, configExists);
      // if(!configExists){
      //   console.log('Writing config');

      //   const ipfsTmp = new IPFS(ipfsOptions)
      //   await ipfsInstanceReady(ipfsTmp);
      //   await ipfsInstanceStop(ipfsTmp);

      //   // init, now we overwrite and then re-init a new instance to use going forward 
      //   let configFileContents = new Buffer(process.env.IPFS_CONFIG_64,'base64').toString('utf8');
      //   console.log('---------CONFIG FILE CONTENTS1111');
      //   console.log(configFileContents);
      //   console.log('---------CONFIG FILE CONTENTS2222');
      //   fs.writeFileSync(configPath, configFileContents,'utf8');
      //   console.log('config overwritten');
      // }

      // console.log('config ready!');
      // return;


      // console.log('ipfsSetup 1');

      // const repo = new Repo('./ipfs-repo')
      // let exists = await util.promisify(repo.config.exists)();
      // if(!exists){
      //   console.log('Repo creating');
      //   await repoInit(repo);
      // } else {
      //   console.log('Repo exists');
      // }

      // if(process.env.IPFS_REPO_PRIVATE_KEY){
      //   await util.promisify(repo.config.set)('Identity.PrivKey', process.env.IPFS_REPO_PRIVATE_KEY);
      // } else {
      //   // Get, print out for saving!
      //   let config = await util.promisify(repo.config.get)();
      //   console.log('Config:', config);
      //   if(!config.Identity || !config.Identity.PrivKey){
      //     // needs to be created! (ipfs node started) 
      //     console.log('Identity needs to be created!');
      //     const tmpIpfs = new IPFS(Object.assign({
      //       repo
      //     },ipfsOptions));
      //   }
      //   // console.log('Save this private key!:', privKey);
      //   // repo.config.get((e,b)=>{
      //   //   console.log(e,b);
      //   // })
      // }

      // console.log('setup!');

      // return;

      // Create IPFS instance
      // ipfsOptions.start = true;
      const ipfs = new IPFS(ipfsOptions)

      app.ipfs = ipfs;

      ipfs.on('error', (err) => {
        console.error('IPFS ERROR!!!!');
        console.error(err);
        // process.exit(); // should restart automatically! 
      });

      // ipfs.on('init', async ()=>{
      //   console.log('init');
      // })
      ipfs.on('ready', async () => {
        console.log('ready');
          
        let myId = await ipfs.id();
        console.log('ID:', myId);

        // if(!configExists){
        //   // now write the config, then restart 
        //   // - could also see if it exists, if not then init, then restart? 
        //   console.log('Config did not exist, expecting it to now! (so overwrite on next load)');
        //   return process.exit();
        // }

        // console.log('Config does exist! Using it');

        // // let val = await ipfs.config.get();
        
        // return;

        // console.log('Getting private key');
        // let ipfsPrivateKey = await ipfs.key.export('self','passwordpasswordpasswordpassword');

        // await ipfs.key.import('self',new Buffer(process.env.IPFS_REPO_PRIVATE_KEY2,'base64').toString('utf8'), 'passwordpasswordpasswordpassword');
        

        // console.log('config:', JSON.stringify(val,null,2)); //.Identity.PrivKey);

        // Change Private Key 
        // - odd to do it here, after startup and a new PrivKey was created :( 

        // if(!process.env.IPFS_REPO_PRIVATE_KEY){
        //   const orbitdb1 = new OrbitDB(ipfs)
        //   let orbitWriteKey = orbitdb1.key.getPublic('hex')

        //   console.log('Private Key:', val.Identity.PrivKey);
        //   console.log('Orbit Write Key:', orbitWriteKey);

        //   return console.error('Add above Private key to IPFS_REPO_PRIVATE_KEY, and orbit key to ORBIT_PUBLIC_WRITE_KEY (will use going forward)');

        // }

        // // Change Private Key! 
        // // - no idea if this works immeditely or not (I dont think this is doing anything actually) 
        // console.log('Updated/set private key');
        // // await ipfs.config.set('Identity.PrivKey', process.env.IPFS_REPO_PRIVATE_KEY);

        // if(!process.env.ORBIT_PUBLIC_WRITE_KEY){

        //   const orbitdb2 = new OrbitDB(ipfs)
        //   let orbitWriteKey2 = orbitdb2.key.getPublic('hex')

        //   console.log('Orbit Write Key:', orbitWriteKey2);
        //   return console.error('Missing ORBIT_PUBLIC_WRITE_KEY');
        // }

        // try {
        //   console.log('Reading ipfs value... (probably gonna fail cuz js-ipfs just doesnt work with defaults)');
        //   ipfs.files.cat('QmXSaDkqxMEV4TzuRbqoPvAaVXVPj9xeUkPb3bwRtvSLJL',(err,data)=>{
        //     if(err){
        //       return console.error('--FAILED-- reading ipfs value (kinda expected)');
        //     }
        //     console.log('Read IPFS Value (length=248):', data.toString('utf8').length);
        //   });
        // }catch(err){
        //   console.error('ERROR123234:', err);
        // }



        // console.log('orbit setup');

        // // Create OrbitDB instance
        // const orbitdb = new OrbitDB(ipfs)
        // app.orbitdb = orbitdb;

        // // giving ourselves access 
        // const access = {
        //   // Give write access to ourselves
        //   // write: [orbitdb.key.getPublic('hex')],
        //   // write: [
        //   //   process.env.ORBIT_PUBLIC_WRITE_KEY
        //   // ]
        //   write: ['*']
        // }

        // console.log('creating orbit db 1');
        // const db = await app.orbitdb.log('node-chain-001', access)
        // console.log('loading data for orbit db 1');
        // try {
        //   db.load((err)=>{
        //     console.log('Load fail?', err);
        //   })
        // }catch(err){
        //   console.error('DB Load error:', err);
        // }
        // app.orbitLogDb = db;

        // console.log('OrbitDB Address (for sharing):', db.address.toString())

        // // /orbitdb/Qmd8TmZrWASypEp4Er9tgWP4kCNQnW4ncSnvjvyHQ3EVSU/first-database

        // // test orbit write 
        // function testOrbitWrite(){
        //   try {
        //     console.log('test orbit write');
        //     app.orbitLogDb.add('testing123',{},function(err,added){
        //       console.log('ORBIT RESULT:', err, added);
        //     });
        //   }catch(err){
        //     console.error('Orbit write failed');
        //   }
        // }
        // setInterval(testOrbitWrite,30 * 1000);
        // testOrbitWrite();


        console.log('Ready to process new nodes (loading previous into ipfs)');
        resolve();


        // Load and seed all files from DB 
        let schema = await app.graphql.getAdminSchema();
        let models = schema.__models;

        let allNodes = await models.Node.find().sort({_id: 1});
        console.log('All Nodes:', allNodes.length);

        // cat/pin all files that are ready! 
        // - currently no way of "rehydrating" from a repo
        let prevHash = null;
        for(let node of allNodes){
          console.log('add node', node._id, node.ipfsHashForThisNode);
          let pkgHash = await ipfs.files.add(new Buffer(node.package,'utf8'));
          if(pkgHash[0].hash != node.ipfsHash){
            console.log('FAIL');
            console.log('pkg:', pkgHash[0].hash);
            console.log('node:', node.ipfsHash);
            // console.log('node.package:', Stringify(node.package) );
            // console.log(JSON.stringify(node.package,null,2));
            // throw "Failed matching hash"
            console.error('Failed matching hash');
          }


          // enough data for somebody to host eventlog and verify signatures 
          let savedChainData = {
            data: {
              author: node.author,
              id: node._id,
              node: node.ipfsHash,
              prev: prevHash, //previousNode ? previousNode.ipfsHashForThisNode : null, // previous entry in chain 
              chain: app.publicKeyLocal, // to identity "this" chain 
              ref: node.ref,
              version: node.version,
              nonce: node.nonce ,
              signature: node.signature , // submitted signature
            },
            publicKey: app.publicKeyLocal, //localKey.exportKey('public'), // our internal one, used for signing
            signature: null
          };

          let localKey = app.localKey; // stored on init

          // savedChainData.publicKey = app.publicKeyLocal; //localKey.exportKey('public');

          let blockDataAsString = Stringify(savedChainData.data);

          // Create signature for db entry 
          // - signing the entry
          let remoteSig2 = localKey.sign(blockDataAsString,'hex');
          savedChainData.signature = remoteSig2;

          // console.log('savedChainData', savedChainData, node);

          // console.log('------SAVEDBLOCK DATA1-----');
          // console.log(Stringify(savedChainData));
          // console.log('------SAVEDBLOCK DATA2-----');

          // Get ipfsHash of data (as an added file) 
          // - also add to the "perma-pin" api! 
          let expectedChainHash = await app.ipfs.files.add(new Buffer(Stringify(savedChainData),'utf8'));
          if(expectedChainHash[0].hash != node.ipfsHashForThisNode){
            console.log('FAILED:', JSON.stringify(savedChainData,null,2));
            throw "Failed matching chain hash"
          }

          // pin 
          await app.ipfs.pin.add(node.ipfsHash);
          await app.ipfs.pin.add(node.ipfsHashForThisNode);

          prevHash = node.ipfsHashForThisNode;

        }

        console.log('Loaded all existing ipfs files');

        return;

      })

      // ipfs.init({},(err,result)=>{
      //   console.log('INIT:', err,result);
      // })

    },3000);

    console.log('setup ipfs in 3 seconds');

  });
}

let ipfsReady = ipfsSetup();

// IPFS middleware 
app.use(async (req,res,next)=>{
  await ipfsReady;
  next();
});

// Routes
app.use('/', require('./routes').default);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('Fallback Error Handler2:', err);
  res
    .status(err.status || 500)
    .render('error', {
      message: err.message
    });
});

export default app;
