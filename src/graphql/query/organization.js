import mongoose from 'mongoose';
import composeWithMongoose from 'graphql-compose-mongoose';
// import { GQC } from 'graphql-compose';

import { buildAll as Organization_buildAll } from '../model/organization'


const buildTC = (GQC, db) => {

  const { OrganizationModel, OrganizationTC } = Organization_buildAll(db);

  OrganizationTC.addResolver({
    name: 'load',
    type: OrganizationTC,
    resolve: () => ({}),
  });

  OrganizationTC.addFields({
    byId: OrganizationTC.getResolver('findById'),
    byIds: OrganizationTC.getResolver('findByIds'),
    one: OrganizationTC.getResolver('findOne'),
    many: OrganizationTC.getResolver('findMany'),
    count: OrganizationTC.getResolver('count'),
    connection: OrganizationTC.getResolver('connection'),
    pagination: OrganizationTC.getResolver('pagination'),
  });

  return {
    OrganizationModel,
    OrganizationTC
  }

}

export {
  buildTC
}