import mongoose from 'mongoose';
import composeWithDataLoader from 'graphql-compose-dataloader';
import { composeWithMongoose, mongooseTypeStorage } from 'graphql-compose-mongoose';
// import { GQC } from 'graphql-compose';

const buildAll = (db) => {

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

  const WalletModel = db.model('Wallets', WalletSchema);
  mongooseTypeStorage.clear();
  const WalletTC = composeWithDataLoader(composeWithMongoose(WalletModel));

  return {
    WalletSchema,
    WalletModel,
    WalletTC
  }

}

export {
  buildAll
}
