import mongoose from "mongoose";

interface DBProvider {
  connect: () => Promise<any>;
  close: () => void;
  clearDB: () => Promise<void>;
}

type CreateMongooseDBProvider = (connectionUrl: string) => DBProvider;
export const createMongooseDBProvider: CreateMongooseDBProvider = connectionUrl => {
  let dbConnection;

  const connect = async () => {
    try {
      dbConnection = await mongoose.connect(connectionUrl, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
      });
    } catch (error) {
      console.error(error);
    }

    return dbConnection;
  };

  const close = () => mongoose.connection.close();

  const clearDB = async () => {
    const collections = mongoose.connection.collections;

    Object.keys(collections).forEach(collectionName => {
      collections[collectionName].remove({});
    });
  };

  return {
    connect,
    close,
    clearDB
  };
};
