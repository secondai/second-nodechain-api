
import { buildAll as User_buildAll } from '../model/user'


const buildMutationTC = (GQC, db, models, tcs) => {

  // const { UserTC: UserMutationTC } = User_buildAll(db);
  // let UserMutationTC = GQC.get('User');
  const UserMutationTC = tcs.User;

  UserMutationTC.addResolver({
    name: 'load',
    type: UserMutationTC,
    resolve: () => ({}),
  });

  UserMutationTC.addFields({
    // create: UserMutationTC.getResolver('createOne'),
    // updateById: UserMutationTC.getResolver('updateById'),
    // updateOne: UserMutationTC.getResolver('updateOne'),
    // updateMany: UserMutationTC.getResolver('updateMany'),
    // removeById: UserMutationTC.getResolver('removeById'),
    // removeOne: UserMutationTC.getResolver('removeOne'),
    // removeMany: UserMutationTC.getResolver('removeMany'),
  });

  return {
    UserMutationTC
  }

}

export {
  buildMutationTC
}