import mongoose from 'mongoose';
import composeWithMongoose from 'graphql-compose-mongoose';
// import { GQC } from 'graphql-compose';

import { buildAll as Node_buildAll } from '../model/node'

import _ from 'lodash'

const buildTC = (GQC, db) => {

  const { NodeModel, NodeTC } = Node_buildAll(db);

  NodeTC.addResolver({
    name: 'load',
    type: NodeTC,
    resolve: () => ({}),
  });

  NodeTC.addFields({
    byId: NodeTC.getResolver('findById'),
    byIds: NodeTC.getResolver('findByIds'),
    one: NodeTC.getResolver('findOne')
    .addFilterArg({
      name: 'nested',
      type: 'JSON',
      description: 'nested node.data search',
      query: (rawQuery, value, resolveParams) => {
        console.log('search value:', typeof value, value);
        if(_.isArray(value)){
          value.forEach(val=>{
            rawQuery[val.key] = val.value;
          })
        }
      }
    })
    .wrapResolve(next=> rp => {
      // the following seems necessary to apply all the filters...
      const r = next(rp);
      return r;
    }),

    many: NodeTC.getResolver('findMany')
    .addFilterArg({
      name: 'nested',
      type: 'JSON',
      description: 'nested node.data search',
      query: (rawQuery, value, resolveParams) => {
        console.log('search value:', typeof value, value);
        if(_.isArray(value)){
          value.forEach(val=>{
            rawQuery[val.key] = val.value;
          })
        }
      }
    })
    .wrapResolve(next=> rp => {
      // the following seems necessary to apply all the filters...
      const r = next(rp);
      return r;
    }),


    count: NodeTC.getResolver('count'),
    connection: NodeTC.getResolver('connection'),
    pagination: NodeTC.getResolver('pagination'),
  });

  return {
    NodeModel,
    NodeTC
  }

}

export {
  buildTC
}