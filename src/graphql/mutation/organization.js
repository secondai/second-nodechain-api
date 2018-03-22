
import { buildAll as Organization_buildAll } from '../model/organization'


const buildMutationTC = (GQC, db, models, tcs) => {

  // const { OrganizationTC: OrganizationMutationTC } = Organization_buildAll(db);
  // let OrganizationMutationTC = GQC.get('Organization');
  const OrganizationMutationTC = tcs.Organization;

  OrganizationMutationTC.addResolver({
    name: 'load',
    type: OrganizationMutationTC,
    resolve: () => ({}),
  });

  OrganizationMutationTC.addFields({
    // create: OrganizationMutationTC.getResolver('createOne'),
    // updateById: OrganizationMutationTC.getResolver('updateById'),
    // updateOne: OrganizationMutationTC.getResolver('updateOne'),
    // updateMany: OrganizationMutationTC.getResolver('updateMany'),
    // removeById: OrganizationMutationTC.getResolver('removeById'),
    // removeOne: OrganizationMutationTC.getResolver('removeOne'),
    // removeMany: OrganizationMutationTC.getResolver('removeMany'),
  });

  return {
    OrganizationMutationTC
  }

}

export {
  buildMutationTC
}