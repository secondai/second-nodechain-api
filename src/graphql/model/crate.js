import mongoose from 'mongoose';
import composeWithDataLoader from 'graphql-compose-dataloader';
import { composeWithMongoose, mongooseTypeStorage } from 'graphql-compose-mongoose';
// import { GQC } from 'graphql-compose';

const buildAll = (db) => {

  const CrateSchema = new mongoose.Schema({

    // userId: 

    name: String, // slugified (no spaces, only dashes) 
    description: String,
    repository: String, // git repository link (or host locally?) (npm vs. github approach...publish vs. develop...or BOTH) 
    
    environment: String, // should be a link to the environment repository? 
    platform: String, 

    envRequirements: String, // should be a link to the environment repository? 
    universeCapabilities: String,

    type: String, // bundle or environment

    nodes: mongoose.Schema.Types.Mixed,
    // [
    //   {
    //     type: mongoose.Schema.Types.Mixed
    //   }
    // ],

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

  const CrateModel = db.model('Crates', CrateSchema);
  mongooseTypeStorage.clear();
  const CrateTC = composeWithDataLoader(composeWithMongoose(CrateModel));

  return {
    CrateSchema,
    CrateModel,
    CrateTC
  }

}

export {
  buildAll
}
