import mongoose from 'mongoose';
import composeWithDataLoader from 'graphql-compose-dataloader';
import { composeWithMongoose, mongooseTypeStorage } from 'graphql-compose-mongoose';
// import { GQC } from 'graphql-compose';

const buildAll = (db) => {

  const KeySchema = new mongoose.Schema({

    name: String,
    pubKey: {
      type: String,
      unique: true
    },

    publicContact: String,
    privateContact: String,

    canCreate: {
      type: Boolean,
      index: true
    },

    createdAt: {
      type: Number,
      index: true
    },
  });

  const KeyModel = db.model('Keys', KeySchema);
  mongooseTypeStorage.clear();
  const KeyTC = composeWithDataLoader(composeWithMongoose(KeyModel));

  return {
    KeySchema,
    KeyModel,
    KeyTC
  }

}

export {
  buildAll
}
