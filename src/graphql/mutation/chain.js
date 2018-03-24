
import request from 'request-promise-native'

import { buildAll as Key_buildAll } from '../model/key'
import { buildAll as Chain_buildAll } from '../model/chain'


var Stringify = require('json-stable-stringify');

const uuidv4 = require('uuid/v4');
var SHA256 = require("crypto-js/sha256");
var jsSchema = require('js-schema');

var AsyncLock = require('async-lock');
var lock = new AsyncLock({
  timeout: 5000
});

const buildMutationTC = (GQC, db, models, tcs) => {

  // const { ChainTC: ChainMutationTC } = Chain_buildAll(db);
  // let ChainMutationTC = GQC.get('Chain');
  const ChainMutationTC = tcs.Chain;

  // console.log('NODE Model:',models.Chain);

  ChainMutationTC.addResolver({
    name: 'load',
    type: ChainMutationTC,
    resolve: () => ({}),
  });

  // ChainMutationTC.addResolver({
  //   name: 'add',
  //   args: {
  //     record: 'JSON'
  //   },
  //   type: 'JSON',
  //   resolve: async ({source, args, context, info}) => {
      
  //     // Adding a new chain 

  //   },
  // });

  ChainMutationTC.addFields({
    // add: ChainMutationTC.getResolver('add'),
    create: ChainMutationTC.getResolver('createOne'),
    updateById: ChainMutationTC.getResolver('updateById'),
    updateOne: ChainMutationTC.getResolver('updateOne'),
    updateMany: ChainMutationTC.getResolver('updateMany'),
    removeById: ChainMutationTC.getResolver('removeById'),
    removeOne: ChainMutationTC.getResolver('removeOne'),
    removeMany: ChainMutationTC.getResolver('removeMany'),
  });

  return {
    ChainMutationTC
  }

}

export {
  buildMutationTC
}