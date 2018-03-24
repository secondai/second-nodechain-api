import mongoose from 'mongoose';
import composeWithMongoose from 'graphql-compose-mongoose';
// import { GQC } from 'graphql-compose';

import { buildAll as Chain_buildAll } from '../model/chain'

import _ from 'lodash'

const buildTC = (GQC, db) => {

  const { ChainModel, ChainTC } = Chain_buildAll(db);

  ChainTC.addResolver({
    name: 'load',
    type: ChainTC,
    resolve: () => ({}),
  });

  ChainTC.addFields({
    byId: ChainTC.getResolver('findById'),
    byIds: ChainTC.getResolver('findByIds'),
    one: ChainTC.getResolver('findOne'),
    many: ChainTC.getResolver('findMany'),
    count: ChainTC.getResolver('count'),
    connection: ChainTC.getResolver('connection'),
    pagination: ChainTC.getResolver('pagination'),
  });

  return {
    ChainModel,
    ChainTC
  }

}

export {
  buildTC
}