import mongoose from 'mongoose';
import composeWithMongoose from 'graphql-compose-mongoose';
// import { GQC } from 'graphql-compose';

import { buildAll as OrganizationUser_buildAll } from '../model/organization_user'


const buildTC = (GQC, db) => {

  const { OrganizationUserModel, OrganizationUserTC } = OrganizationUser_buildAll(db);

  OrganizationUserTC.addResolver({
    name: 'load',
    type: OrganizationUserTC,
    resolve: () => ({}),
  });

  OrganizationUserTC.addFields({
    byId: OrganizationUserTC.getResolver('findById'),
    byIds: OrganizationUserTC.getResolver('findByIds'),
    one: OrganizationUserTC.getResolver('findOne'),
    many: OrganizationUserTC.getResolver('findMany'),
    count: OrganizationUserTC.getResolver('count'),
    connection: OrganizationUserTC.getResolver('connection'),
    pagination: OrganizationUserTC.getResolver('pagination'),
  });

  return {
    OrganizationUserModel,
    OrganizationUserTC
  }

}

export {
  buildTC
}