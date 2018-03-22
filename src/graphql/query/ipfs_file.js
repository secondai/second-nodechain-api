import mongoose from 'mongoose';
import composeWithMongoose from 'graphql-compose-mongoose';
// import { GQC } from 'graphql-compose';

import { buildAll as IpfsFile_buildAll } from '../model/ipfs_file'


const buildTC = (GQC, db) => {

  const { IpfsFileModel, IpfsFileTC } = IpfsFile_buildAll(db);

  IpfsFileTC.addResolver({
    name: 'load',
    type: IpfsFileTC,
    resolve: () => ({}),
  });

  IpfsFileTC.addFields({
    byId: IpfsFileTC.getResolver('findById'),
    byIds: IpfsFileTC.getResolver('findByIds'),
    one: IpfsFileTC.getResolver('findOne'),
    many: IpfsFileTC.getResolver('findMany'),
    count: IpfsFileTC.getResolver('count'),
    connection: IpfsFileTC.getResolver('connection'),
    pagination: IpfsFileTC.getResolver('pagination'),
  });

  return {
    IpfsFileModel,
    IpfsFileTC
  }

}

export {
  buildTC
}