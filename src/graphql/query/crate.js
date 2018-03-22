import mongoose from 'mongoose';
import composeWithMongoose from 'graphql-compose-mongoose';
// import { GQC } from 'graphql-compose';

import { buildAll as Crate_buildAll } from '../model/crate'


const buildTC = (GQC, db) => {

  const { CrateModel, CrateTC } = Crate_buildAll(db);

  CrateTC.addResolver({
    name: 'load',
    type: CrateTC,
    resolve: () => ({}),
  });

  CrateTC.addFields({
    byId: CrateTC.getResolver('findById'),
    byIds: CrateTC.getResolver('findByIds'),
    one: CrateTC.getResolver('findOne'),
    many: CrateTC.getResolver('findMany'),
    count: CrateTC.getResolver('count'),
    connection: CrateTC.getResolver('connection'),
    pagination: CrateTC.getResolver('pagination'),
  });

  return {
    CrateModel,
    CrateTC
  }

}

export {
  buildTC
}