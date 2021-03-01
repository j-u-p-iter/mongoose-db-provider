import mongoose from "mongoose";

interface DBProvider {
  connect: () => Promise<any>;
  close: () => void;
  clearDB: () => Promise<void>;
}

type CreateMongooseDBProvider = (connectionUrl: string) => DBProvider;
export const createMongooseDBProvider: CreateMongooseDBProvider = connectionUrl => {
  let dbConnection;

  const getAllCollections = () => {
    return mongoose.connection.collections;
  };

  const getCollectionByName = collectionName => {
    return getAllCollections()[collectionName];
  };

  const deleteCollection = (collectionName: string) => {
    return getCollectionByName(collectionName).deleteMany({});
  };

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
    let clearDBResult;

    try {
      clearDBResult = await Promise.all(
        Object.keys(getAllCollections()).map(deleteCollection)
      );
    } catch (error) {
      console.log(error);
    }

    return clearDBResult;
  };

  return {
    connect,
    close,
    clearDB
  };
};
