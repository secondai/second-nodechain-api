import mongoose from 'mongoose';
import composeWithDataLoader from 'graphql-compose-dataloader';
import { composeWithMongoose, mongooseTypeStorage } from 'graphql-compose-mongoose';
// import { GQC } from 'graphql-compose';

const buildAll = (db) => {

  const OrganizationSchema = new mongoose.Schema({

    name: {
      type: String,
      index: true
    },
    
    subdomain: {
      type: String,
      unique: true,
      index: true
    },

    dbName: {
      type: String,
      unique: true,
      index: true
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

  const OrganizationModel = db.model('Organizations', OrganizationSchema);
  mongooseTypeStorage.clear();
  const OrganizationTC = composeWithDataLoader(composeWithMongoose(OrganizationModel));

  return {
    OrganizationSchema,
    OrganizationModel,
    OrganizationTC
  }

}

export {
  buildAll
}
