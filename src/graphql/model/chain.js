import mongoose from 'mongoose';
import composeWithDataLoader from 'graphql-compose-dataloader';
import { composeWithMongoose, mongooseTypeStorage } from 'graphql-compose-mongoose';
// import { GQC } from 'graphql-compose';

import { schemaComposer } from 'graphql-compose';

const buildAll = (db) => {

  const ChainSchema = new mongoose.Schema({

    pubKey: {
      type: String,
      unique: true
    },

    createdAt: {
      type: Number,
      index: true
    },
    
  });


  const ChainModel = db.model('Chains', ChainSchema);
  schemaComposer.clear();
  const ChainTC = composeWithMongoose(ChainModel);

  return {
    ChainSchema,
    ChainModel,
    ChainTC
  }

}

export {
  buildAll
}
