import mongoose from 'mongoose';
import composeWithMongoose from 'graphql-compose-mongoose';
// import { GQC } from 'graphql-compose';

import { buildAll as User_buildAll } from '../model/user'


const buildTC = (GQC, db) => {

  const { UserModel, UserTC } = User_buildAll(db);

  UserTC.addResolver({
    name: 'load',
    type: UserTC,
    resolve: () => ({}),
  });

  UserTC.addFields({
    byId: UserTC.getResolver('findById'),
    byIds: UserTC.getResolver('findByIds'),
    one: UserTC.getResolver('findOne'),
    many: UserTC.getResolver('findMany'),
    count: UserTC.getResolver('count'),
    connection: UserTC.getResolver('connection'),
    pagination: UserTC.getResolver('pagination'),
  });

  return {
    UserModel, 
    UserTC
  }

}

export {
  buildTC
}