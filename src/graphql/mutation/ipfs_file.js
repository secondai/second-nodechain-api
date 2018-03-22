
import { buildAll as IpfsFile_buildAll } from '../model/ipfs_file'


const buildMutationTC = (GQC, db, models, tcs) => {

  // const { IpfsFileTC: IpfsFileMutationTC } = IpfsFile_buildAll(db);
  // let IpfsFileMutationTC = GQC.get('IpfsFile');
  const IpfsFileMutationTC = tcs.IpfsFile;

  IpfsFileMutationTC.addResolver({
    name: 'load',
    type: IpfsFileMutationTC,
    resolve: () => ({}),
  });

  IpfsFileMutationTC.addFields({
    // create: IpfsFileMutationTC.getResolver('createOne'),
    // updateById: IpfsFileMutationTC.getResolver('updateById'),
    // updateOne: IpfsFileMutationTC.getResolver('updateOne'),
    // updateMany: IpfsFileMutationTC.getResolver('updateMany'),
    // removeById: IpfsFileMutationTC.getResolver('removeById'),
    // removeOne: IpfsFileMutationTC.getResolver('removeOne'),
    // removeMany: IpfsFileMutationTC.getResolver('removeMany'),
  });

  return {
    IpfsFileMutationTC
  }

}

export {
  buildMutationTC
}