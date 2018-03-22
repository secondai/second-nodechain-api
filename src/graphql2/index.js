import mongoose from 'mongoose';
mongoose.set('debug', true)

import {graphql} from 'graphql'

import * as utils from './utils'

mongoose.Promise = global.Promise;

import composeWithMongoose from 'graphql-compose-mongoose';
import { GQC } from 'graphql-compose';


mongoose.connect(process.env.MONGODB_CONNECTION); // points to a database! 

const jsonParse = v => {
  try {
    return JSON.parse(v);
  }catch(err){
    console.error('Failed fetching');
    return {};
  }
}
const jsonStringify = v => {
  return JSON.stringify(v);
}

const LanguageSchema = new mongoose.Schema({

  title: String,

  slug: {
    type: String,
    unique: true
  },

  schemaCode: {
    type: String, // for generating the schemaObj (temporary, for editing!) 
    default: '',
  },
  schemaObj: {
    type: mongoose.Schema.Types.Mixed, // jsSchema, as JSON object. Schema can be many types of things! (define inputs, outputs, etc.) It can also reference OTHER language schemas! 
    set: jsonStringify,
    get: jsonParse
  },

  active: Boolean,

  createdAt: {
    type: Number,
    index: true
  },
  updatedAt: {
    type: Number,
    index: true
  }
});

const LanguageModel = mongoose.model('Languages', LanguageSchema);
const customizationOptions = {}; // left it empty for simplicity, described below
const LanguageTC = composeWithMongoose(LanguageModel, customizationOptions);


const WalletSchema = new mongoose.Schema({

  address: {
    type: String,
    index: true,
    unique: true
  },

  // transactions store the ipfs node in the OP_RETURNCODE metadata 
  // - external_identity and external_connect_method are stored in ipfs 
  transactions: [{
    txId: String,
    text: String // hex-encoded? 
  }],

  createdAt: {
    type: Number,
    index: true
  },
  updatedAt: {
    type: Number,
    index: true
  }
});

const WalletModel = mongoose.model('Wallets', WalletSchema);
const WalletTC = composeWithMongoose(WalletModel, customizationOptions);



const IpfsFileSchema = new mongoose.Schema({

  hash: {
    type: String,
    index: true,
    unique: true
  },

  text: String,

  createdAt: {
    type: Number,
    index: true
  },
  updatedAt: {
    type: Number,
    index: true
  }
});

const IpfsFileModel = mongoose.model('IpfsFiles', IpfsFileSchema);
const IpfsFileTC = composeWithMongoose(IpfsFileModel, customizationOptions);



GQC.rootQuery().addFields({
  languageById: LanguageTC.getResolver('findById'),
  languageByIds: LanguageTC.getResolver('findByIds'),
  languageOne: LanguageTC.getResolver('findOne'),
  languageMany: LanguageTC.getResolver('findMany'),
  languageCount: LanguageTC.getResolver('count'),
  languageConnection: LanguageTC.getResolver('connection'),
  languagePagination: LanguageTC.getResolver('pagination'),

  walletById: WalletTC.getResolver('findById'),
  walletByIds: WalletTC.getResolver('findByIds'),
  walletOne: WalletTC.getResolver('findOne'),
  walletMany: WalletTC.getResolver('findMany'),
  walletCount: WalletTC.getResolver('count'),
  walletConnection: WalletTC.getResolver('connection'),
  walletPagination: WalletTC.getResolver('pagination'),

  ipfsFileById: IpfsFileTC.getResolver('findById'),
  ipfsFileByIds: IpfsFileTC.getResolver('findByIds'),
  ipfsFileOne: IpfsFileTC.getResolver('findOne'),
  ipfsFileMany: IpfsFileTC.getResolver('findMany'),
  ipfsFileCount: IpfsFileTC.getResolver('count'),
  ipfsFileConnection: IpfsFileTC.getResolver('connection'),
  ipfsFilePagination: IpfsFileTC.getResolver('pagination'),

});

GQC.rootMutation().addFields({
  languageCreate: LanguageTC.getResolver('createOne'),
  languageUpdateById: LanguageTC.getResolver('updateById'),
  languageUpdateOne: LanguageTC.getResolver('updateOne'),
  languageUpdateMany: LanguageTC.getResolver('updateMany'),
  languageRemoveById: LanguageTC.getResolver('removeById'),
  languageRemoveOne: LanguageTC.getResolver('removeOne'),
  languageRemoveMany: LanguageTC.getResolver('removeMany'),

  walletCreate: WalletTC.getResolver('createOne'),
  walletUpdateById: WalletTC.getResolver('updateById'),
  walletUpdateOne: WalletTC.getResolver('updateOne'),
  walletUpdateMany: WalletTC.getResolver('updateMany'),
  walletRemoveById: WalletTC.getResolver('removeById'),
  walletRemoveOne: WalletTC.getResolver('removeOne'),
  walletRemoveMany: WalletTC.getResolver('removeMany'),

  ipfsFileCreate: IpfsFileTC.getResolver('createOne'),
  ipfsFileUpdateById: IpfsFileTC.getResolver('updateById'),
  ipfsFileUpdateOne: IpfsFileTC.getResolver('updateOne'),
  ipfsFileUpdateMany: IpfsFileTC.getResolver('updateMany'),
  ipfsFileRemoveById: IpfsFileTC.getResolver('removeById'),
  ipfsFileRemoveOne: IpfsFileTC.getResolver('removeOne'),
  ipfsFileRemoveMany: IpfsFileTC.getResolver('removeMany'),
});


const schema = GQC.buildSchema();

export default {
  schema,
  graphql,
  utils
}
