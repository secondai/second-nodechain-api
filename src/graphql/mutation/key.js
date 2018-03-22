
import request from 'request'

import { buildAll as Key_buildAll } from '../model/key'

const uuidv4 = require('uuid/v4');
var SHA256 = require("crypto-js/sha256");
var NodeRSA = require('node-rsa');
var jsSchema = require('js-schema');

const buildMutationTC = (GQC, db, models, tcs) => {

  // const { KeyTC: KeyMutationTC } = Key_buildAll(db);
  // let KeyMutationTC = GQC.get('Key');
  const KeyMutationTC = tcs.Key;

  // console.log('NODE Model:',models.Key);

  KeyMutationTC.addResolver({
    name: 'load',
    type: KeyMutationTC,
    resolve: () => ({}),
  });

  KeyMutationTC.addResolver({
    name: 'add',
    args: {
      record: 'JSON'
    },
    type: 'JSON',
    resolve: async ({source, args, context, info}) => {
      
      let {
        name,
        pubKey,
        publicContact,
        privateContact
      } = args.record;


      let newData = {
        name,
        pubKey,
        publicContact,
        privateContact,
        canCreate: false,
        createdAt: (new Date()).getTime()
      };

      // Save new node (get actual next id (shouldnt have changed)) 
      let newKey = new models.Key(newData);
      try {
        await newKey.save(newData);
      }catch(err){
        console.error(err);
        return {
          error: true,
          message: 'Failed saving locally',
          err
        }
      }

      return {
        recordId: newKey._id,
        record: newKey
      }
    },
  });

  KeyMutationTC.addFields({
    add: KeyMutationTC.getResolver('add'),
    // updateById: KeyMutationTC.getResolver('updateById'),
    // updateOne: KeyMutationTC.getResolver('updateOne'),
    // updateMany: KeyMutationTC.getResolver('updateMany'),
    // removeById: KeyMutationTC.getResolver('removeById'),
    // removeOne: KeyMutationTC.getResolver('removeOne'),
    // removeMany: KeyMutationTC.getResolver('removeMany'),
  });

  return {
    KeyMutationTC
  }

}

export {
  buildMutationTC
}