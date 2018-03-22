import mongoose from 'mongoose';
import { SchemaComposer } from 'graphql-compose';

import { setupRoot } from './rootQuery'
import { setupMutations } from './rootMutations'

// GQC.rootMutation().addFields(RootMutation);

// const schema = GQC.buildSchema();

const getSchema = (db) => {

  // console.log('schemaComposer');
  const GQC = new SchemaComposer();

  // console.log('setupRoot');
  const { models, tcs } = setupRoot(GQC, db);
  setupMutations(GQC, db, models, tcs);

  // console.log('buildSchema');
  const schema = GQC.buildSchema();

  schema.__models = models; // useful for direct manipulation

  return schema;

}


export default getSchema;