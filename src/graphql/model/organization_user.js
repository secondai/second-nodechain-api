import mongoose from 'mongoose';
import composeWithDataLoader from 'graphql-compose-dataloader';
import { composeWithMongoose, mongooseTypeStorage } from 'graphql-compose-mongoose';
// import { GQC } from 'graphql-compose';

const buildAll = (db) => {

  const OrganizationUserSchema = new mongoose.Schema({

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organizations'
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users'
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

  const OrganizationUserModel = db.model('OrganizationUsers', OrganizationUserSchema);
  mongooseTypeStorage.clear();
  const OrganizationUserTC = composeWithDataLoader(composeWithMongoose(OrganizationUserModel));

  return {
    OrganizationUserSchema,
    OrganizationUserModel,
    OrganizationUserTC
  }

}

export {
  buildAll
}
