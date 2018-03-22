
import { buildAll as OrganizationUser_buildAll } from '../model/organization_user'


const buildMutationTC = (GQC, db, models, tcs) => {

  // const { OrganizationUserTC: OrganizationUserMutationTC } = OrganizationUser_buildAll(db);
  // let OrganizationUserMutationTC = GQC.get('OrganizationUser');
  const OrganizationUserMutationTC = tcs.OrganizationUser;

  OrganizationUserMutationTC.addResolver({
    name: 'load',
    type: OrganizationUserMutationTC,
    resolve: () => ({}),
  });

  OrganizationUserMutationTC.addFields({
    // create: OrganizationUserMutationTC.getResolver('createOne'),
    // updateById: OrganizationUserMutationTC.getResolver('updateById'),
    // updateOne: OrganizationUserMutationTC.getResolver('updateOne'),
    // updateMany: OrganizationUserMutationTC.getResolver('updateMany'),
    // removeById: OrganizationUserMutationTC.getResolver('removeById'),
    // removeOne: OrganizationUserMutationTC.getResolver('removeOne'),
    // removeMany: OrganizationUserMutationTC.getResolver('removeMany'),
  });

  return {
    OrganizationUserMutationTC
  }

}

export {
  buildMutationTC
}