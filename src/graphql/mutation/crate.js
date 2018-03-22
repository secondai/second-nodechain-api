
import { buildAll as Crate_buildAll } from '../model/crate'


const buildMutationTC = (GQC, db, models, tcs) => {

  // const { CrateTC: CrateMutationTC } = Crate_buildAll(db);
  // let CrateMutationTC = GQC.get('Crate');
  const CrateMutationTC = tcs.Crate;

  CrateMutationTC.addResolver({
    name: 'load',
    type: CrateMutationTC,
    resolve: () => ({}),
  });

  CrateMutationTC.addFields({
    // create: CrateMutationTC.getResolver('createOne'),
    // updateById: CrateMutationTC.getResolver('updateById'),
    // updateOne: CrateMutationTC.getResolver('updateOne'),
    // updateMany: CrateMutationTC.getResolver('updateMany'),
    // removeById: CrateMutationTC.getResolver('removeById'),
    // removeOne: CrateMutationTC.getResolver('removeOne'),
    // removeMany: CrateMutationTC.getResolver('removeMany'),
  });

  return {
    CrateMutationTC
  }

}

export {
  buildMutationTC
}