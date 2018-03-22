import mongoose from 'mongoose';
import composeWithMongoose from 'graphql-compose-mongoose';
// import { GQC } from 'graphql-compose';

import { buildAll as Key_buildAll } from '../model/key'


const buildTC = (GQC, db) => {

  const { KeyModel, KeyTC } = Key_buildAll(db);

  KeyTC.addResolver({
    name: 'load',
    type: KeyTC,
    resolve: () => ({}),
  });

  KeyTC.addFields({
    byId: KeyTC.getResolver('findById'),
    byIds: KeyTC.getResolver('findByIds'),
    one: KeyTC.getResolver('findOne'),
    many: KeyTC.getResolver('findMany'),
    count: KeyTC.getResolver('count'),
    connection: KeyTC.getResolver('connection'),
    pagination: KeyTC.getResolver('pagination'),
  });

  return {
    KeyModel,
    KeyTC
  }

}

export {
  buildTC
}