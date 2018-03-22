
import { buildAll as Language_buildAll } from '../model/language'


const buildMutationTC = (GQC, db, models, tcs) => {

  // const { LanguageTC: LanguageMutationTC } = Language_buildAll(db);
  // let LanguageMutationTC = GQC.get('Language');
  const LanguageMutationTC = tcs.Language;

  LanguageMutationTC.addResolver({
    name: 'load',
    type: LanguageMutationTC,
    resolve: () => ({}),
  });

  LanguageMutationTC.addFields({
    create: LanguageMutationTC.getResolver('createOne'),
    updateById: LanguageMutationTC.getResolver('updateById'),
    // updateOne: LanguageMutationTC.getResolver('updateOne'),
    // updateMany: LanguageMutationTC.getResolver('updateMany'),
    // removeById: LanguageMutationTC.getResolver('removeById'),
    // removeOne: LanguageMutationTC.getResolver('removeOne'),
    // removeMany: LanguageMutationTC.getResolver('removeMany'),
  });

  return {
    LanguageMutationTC
  }

}

export {
  buildMutationTC
}