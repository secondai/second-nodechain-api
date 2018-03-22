import mongoose from 'mongoose';
import composeWithMongoose from 'graphql-compose-mongoose';
// import { GQC } from 'graphql-compose';

import { buildAll as Language_buildAll } from '../model/language'


const buildTC = (GQC, db) => {

  const { LanguageModel, LanguageTC } = Language_buildAll(db);

  LanguageTC.addResolver({
    name: 'load',
    type: LanguageTC,
    resolve: () => ({}),
  });

  LanguageTC.addFields({
    byId: LanguageTC.getResolver('findById'),
    byIds: LanguageTC.getResolver('findByIds'),
    one: LanguageTC.getResolver('findOne'),
    many: LanguageTC.getResolver('findMany'),
    count: LanguageTC.getResolver('count'),
    connection: LanguageTC.getResolver('connection'),
    pagination: LanguageTC.getResolver('pagination'),
  });

  return {
    LanguageModel,
    LanguageTC
  }

}

export {
  buildTC
}