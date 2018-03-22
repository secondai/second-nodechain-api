import mongoose from 'mongoose';
import composeWithDataLoader from 'graphql-compose-dataloader';
import { composeWithMongoose, mongooseTypeStorage } from 'graphql-compose-mongoose';
// import { GQC } from 'graphql-compose';

import { schemaComposer } from 'graphql-compose';

const buildAll = (db) => {

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

  const IpfsFileModel = db.model('IpfsFiles', IpfsFileSchema);
  schemaComposer.clear();
  const IpfsFileTC = composeWithDataLoader(composeWithMongoose(IpfsFileModel));

  return {
    IpfsFileSchema,
    IpfsFileModel,
    IpfsFileTC
  }

}

export {
  buildAll
}
