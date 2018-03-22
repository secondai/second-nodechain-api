import mongoose from 'mongoose';
import composeWithDataLoader from 'graphql-compose-dataloader';
import { composeWithMongoose, mongooseTypeStorage } from 'graphql-compose-mongoose';
// import { GQC } from 'graphql-compose';

const buildAll = (db) => {

  const jsonParse = v => {
    try {
      return JSON.parse(v);
    }catch(err){
      console.error('Failed fetching');
      return {};
    }
  }
  const jsonStringify = v => {
    return JSON.stringify(v);
  }

  const LanguageSchema = new mongoose.Schema({

    title: String,

    slug: {
      type: String,
      unique: true
    },

    schemaCode: {
      type: String, // for generating the schemaObj (temporary, for editing!) 
      default: '',
    },
    schemaObj: {
      type: mongoose.Schema.Types.Mixed, // jsSchema, as JSON object. Schema can be many types of things! (define inputs, outputs, etc.) It can also reference OTHER language schemas! 
      set: jsonStringify,
      get: jsonParse
    },

    active: Boolean,

    createdAt: {
      type: Number,
      index: true
    },
    updatedAt: {
      type: Number,
      index: true
    }
  });

  const LanguageModel = db.model('Languages', LanguageSchema);
  mongooseTypeStorage.clear();
  const LanguageTC = composeWithDataLoader(composeWithMongoose(LanguageModel));

  return {
    LanguageSchema,
    LanguageModel,
    LanguageTC
  }

}

export {
  buildAll
}
