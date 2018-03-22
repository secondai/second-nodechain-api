
import { buildAll as Wallet_buildAll } from '../model/wallet'


const buildMutationTC = (GQC, db, models, tcs) => {

  // const { WalletTC: WalletMutationTC } = Wallet_buildAll(db);
  // let WalletMutationTC = GQC.get('Wallet');
  const WalletMutationTC = tcs.Wallet;

  WalletMutationTC.addResolver({
    name: 'load',
    type: WalletMutationTC,
    resolve: () => ({}),
  });

  WalletMutationTC.addFields({
    // create: WalletMutationTC.getResolver('createOne'),
    // updateById: WalletMutationTC.getResolver('updateById'),
    // updateOne: WalletMutationTC.getResolver('updateOne'),
    // updateMany: WalletMutationTC.getResolver('updateMany'),
    // removeById: WalletMutationTC.getResolver('removeById'),
    // removeOne: WalletMutationTC.getResolver('removeOne'),
    // removeMany: WalletMutationTC.getResolver('removeMany'),
  });

  return {
    WalletMutationTC
  }

}

export {
  buildMutationTC
}