// viewer.js
// import { GQC } from 'graphql-compose';

import gql from 'graphql-tag'
import { buildTC as Key_buildTC } from './key';
import { buildTC as Node_buildTC } from './node';
import { buildTC as Crate_buildTC } from './crate';
import { buildTC as Language_buildTC } from './language';
import { buildTC as IpfsFile_buildTC } from './ipfs_file';
import { buildTC as Wallet_buildTC } from './wallet';
import { buildTC as Organization_buildTC } from './organization';
import { buildTC as OrganizationUser_buildTC } from './organization_user';
import { buildTC as User_buildTC } from './user';

export const ViewerLoader = (GQC, db) => {

  let modelToBuildAndLoad = {
    Key: Key_buildTC,
    Node: Node_buildTC,
    // Crate: Crate_buildTC,
    Language: Language_buildTC,
    IpfsFile: IpfsFile_buildTC,
    Wallet: Wallet_buildTC,
    // Organization: Organization_buildTC,
    // OrganizationUser: OrganizationUser_buildTC,
    // User: User_buildTC,
  }

  let models = {},
    tcs = {};

  const ViewerTC = GQC.get('Viewer');

  Object.keys(modelToBuildAndLoad).forEach(model=>{
    const exported = modelToBuildAndLoad[model](GQC, db);
    models[model] = exported[model + 'Model']; // UserModel;
    tcs[model] = exported[model + 'TC']; // UserTC;
  })

  ViewerTC.addResolver({
    name: 'load',
    type: ViewerTC,
    resolve: () => ({}),
  });


  // ViewerTC.addResolver({
  //   name: 'me',
  //   args: {},
  //   type: 'JSON',
  //   resolve: async ({ source, args, context, info }) => {
  //     // console.log('RETURNING CONTEXT:', context);
  //     // const res = await fetch(`/endpoint/${args.id}`); // or some fetch from any database
  //     // const data = await res.json();
  //     // // here you may clean up `data` response from API or Database,
  //     // // it should has same shape like UserTC fields
  //     // // eg. { name: 'Peter', nickname: 'peet', views: 20, someJsonMess: { ... } }
  //     // // if some fields are undefined or missing, graphql return `null` on that fields
  //     // return data;
  //     let user;
  //     if(context.user){
  //       user = await fetchUser({
  //         _id: context.user._id
  //       });
  //     }
  //     return user;
  //   },
  // });



  // ViewerTC.addFields({
  //   // user: UserTC.get('$load'),
  //   me: ViewerTC.get('$me')
  // });


  Object.keys(modelToBuildAndLoad).forEach(model=>{
    let tmpObj = {};
    let str = model.charAt(0).toLowerCase() + model.slice(1);
    tmpObj[str] = tcs[model].get('$load');
    ViewerTC.addFields(tmpObj);
  });


  return {
    ViewerTC,
    models,
    tcs
  }

}


const fetchUser = (filterOpts) => {

  return new Promise(async (resolve, reject) => {

    console.log('--FetchUser FIlter Opts--', filterOpts);

    const schema = await app.graphql.getAdminSchema();

    let query_User = `
      query (
        $filter: FilterFindOneUsersInput
      ) {
        viewer {
          user {
            one(filter: $filter) {
              _id
              auth0id
              email
              username
              createdAt
            }
          }
        }
      }
    `

    let result = await app.graphql.graphql({
      schema: schema,
      source: query_User,
      context: {
        admin: true,
        schema: schema,
        user: null
      },
      variableValues: {
        filter: filterOpts
      }
    })

    if(result.data && result.data.viewer){
      resolve(result.data.viewer.user.one);
    } else {
      console.error('Failed fetchUser in auth1!', JSON.stringify(result,null,2));
      reject(result);
    }

  })

}
