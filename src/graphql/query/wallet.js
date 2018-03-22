import mongoose from 'mongoose';
import composeWithMongoose from 'graphql-compose-mongoose';
// import { GQC } from 'graphql-compose';

import { buildAll as Wallet_buildAll } from '../model/wallet'


const buildTC = (GQC, db) => {

  const { WalletModel, WalletTC } = Wallet_buildAll(db);

  WalletTC.addResolver({
    name: 'load',
    type: WalletTC,
    resolve: () => ({}),
  });

  WalletTC.addFields({
    byId: WalletTC.getResolver('findById'),
    byIds: WalletTC.getResolver('findByIds'),
    one: WalletTC.getResolver('findOne'),
    many: WalletTC.getResolver('findMany'),
    count: WalletTC.getResolver('count'),
    connection: WalletTC.getResolver('connection'),
    pagination: WalletTC.getResolver('pagination'),
  });

  return {
    WalletModel,
    WalletTC
  }

}

export {
  buildTC
}