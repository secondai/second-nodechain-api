// rootQuery.js
// import { GQC } from 'graphql-compose';
// import { ViewerLoader } from './query/viewer';
// import { AdminTC } from './admin';

import { buildMutationTC as Chain_buildMutationTC } from './mutation/chain';
import { buildMutationTC as Key_buildMutationTC } from './mutation/key';
import { buildMutationTC as Node_buildMutationTC } from './mutation/node';
// import { buildMutationTC as Crate_buildMutationTC } from './mutation/crate';

// import { buildMutationTC as Language_buildMutationTC } from './mutation/language';
// import { buildMutationTC as Wallet_buildMutationTC } from './mutation/wallet';
// import { buildMutationTC as IpfsFile_buildMutationTC } from './mutation/ipfs_file';

// import { buildMutationTC as Organization_buildMutationTC } from './mutation/organization';
// import { buildMutationTC as OrganizationUser_buildMutationTC } from './mutation/organization_user';
// import { buildMutationTC as User_buildMutationTC } from './mutation/user';

function setupMutations(GQC, db, models, tcs){

  // modifies GQC in place 

  const { ChainMutationTC } = Chain_buildMutationTC(GQC, db, models, tcs);
  const { KeyMutationTC } = Key_buildMutationTC(GQC, db, models, tcs);
  const { NodeMutationTC } = Node_buildMutationTC(GQC, db, models, tcs);
  // const { CrateMutationTC } = Crate_buildMutationTC(GQC, db, models, tcs);

  // const { LanguageMutationTC } = Language_buildMutationTC(GQC, db, models, tcs);
  // const { WalletMutationTC } = Wallet_buildMutationTC(GQC, db, models, tcs);
  // const { IpfsFileMutationTC } = IpfsFile_buildMutationTC(GQC, db, models, tcs);

  // const { OrganizationMutationTC } = Organization_buildMutationTC(GQC, db, models, tcs);
  // const { OrganizationUserMutationTC } = OrganizationUser_buildMutationTC(GQC, db, models, tcs);
  // const { UserMutationTC } = User_buildMutationTC(GQC, db, models, tcs);

  // const ViewerTC = ViewerLoader(GQC, db).ViewerTC;

  GQC.rootMutation().addFields({
    chain: ChainMutationTC.get('$load'),
    key: KeyMutationTC.get('$load'),
    node: NodeMutationTC.get('$load'),
    // crate: CrateMutationTC.get('$load'),

    // language: LanguageMutationTC.get('$load'),
    // wallet: WalletMutationTC.get('$load'),
    // ipfsFile: IpfsFileMutationTC.get('$load'),

    // organization: OrganizationMutationTC.get('$load'),
    // organizationUser: OrganizationUserMutationTC.get('$load'),
    // user: UserMutationTC.get('$load'),
  });

}

export {
  setupMutations
}
