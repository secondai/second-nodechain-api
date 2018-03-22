import mongoose from 'mongoose';
import composeWithDataLoader from 'graphql-compose-dataloader';
import { composeWithMongoose, mongooseTypeStorage } from 'graphql-compose-mongoose';
// import { GQC } from 'graphql-compose';

const buildAll = (db) => {

  const UserSchema = new mongoose.Schema({

    // email: {
    //   type: String,
    //   unique: true,
    //   index: true
    // },
    // password: {
    //   type: String
    // },

    email: String,
    username: String, 
    auth0id: String,

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

  const UserModel = db.model('Users', UserSchema);
  mongooseTypeStorage.clear();
  const UserTC = composeWithDataLoader(composeWithMongoose(UserModel));

  return {
    UserSchema,
    UserModel,
    UserTC
  }

}

export {
  buildAll
}
