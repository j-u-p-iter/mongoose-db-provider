import { Mongoose } from "mongoose";

export interface MongooseDBProviderOptions {
  client: Mongoose;
  connectionURL: string;
}

export class MongooseDBProvider {
  private mongooseClient = null;

  private connectionURL = "";

  private getAllCollections() {
    return this.mongooseClient.connection.collections;
  }

  private getCollectionByName(collectionName: string) {
    return this.getAllCollections()[collectionName];
  }

  private deleteCollection(collectionName: string) {
    return this.getCollectionByName(collectionName).deleteMany({});
  }

  constructor({ client, connectionURL }: MongooseDBProviderOptions) {
    this.mongooseClient = client;
    this.connectionURL = connectionURL;
  }

  public get isConnected() {
    /**
     * Equals to 1, when the connection is set up.
     *   Equals to 0, when the connection is closed.
     *
     */
    return this.mongooseClient.connection.readyState === 1;
  }

  public getCollectionLength(collectionName: string) {
    return this.mongooseClient.connection.collections[collectionName].count();
  }

  public async connect() {
    const dbConnection = await this.mongooseClient.connect(this.connectionURL, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true
    });

    return dbConnection;
  }

  public closeConnection() {
    this.mongooseClient.connection.close();
  }

  public async clearDB() {
    const clearDBResult = await Promise.all(
      Object.keys(this.getAllCollections()).map(
        this.deleteCollection.bind(this)
      )
    );

    return clearDBResult;
  }
}
