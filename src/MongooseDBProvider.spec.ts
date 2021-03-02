import mongoose from "mongoose";

import { MongooseDBProvider } from ".";

const CONNECTION_URL = "mongodb://localhost:27017/test";

describe("MongooseDBProvider", () => {
  let mongooseDBProvider;
  let createMongooseDBProvider;

  beforeAll(() => {
    createMongooseDBProvider = (connectionURL) => {
      return new MongooseDBProvider({ 
        connectionURL,
        client: mongoose,
      });
    }      
  });

  afterEach(() => {
    return mongooseDBProvider.closeConnection();
  });

  describe("connect", () => {
    describe("with valid connection url", () => {
      it("creates db connection", async () => {
        mongooseDBProvider = createMongooseDBProvider(
          CONNECTION_URL
        );

        const connection = await mongooseDBProvider.connect();

        expect(connection.connections).toBeDefined();
        expect(connection.models).toBeDefined();
      });
    });
  });

  describe("close", () => {
    it("closes connection", async () => {
      mongooseDBProvider = createMongooseDBProvider(
        CONNECTION_URL
      );

      await mongooseDBProvider.connect();

      expect(mongooseDBProvider.isConnected).toBe(true);

      await mongooseDBProvider.closeConnection();

      expect(mongooseDBProvider.isConnected).toBe(false);
    });
  });

  describe("clearDB", () => {
    it("removes collections", async () => {
      const UserModel = mongoose.model(
        "User",
        new mongoose.Schema({ name: String })
      );
      const PostModel = mongoose.model(
        "Post",
        new mongoose.Schema({ title: String })
      );

      mongooseDBProvider = createMongooseDBProvider(
        CONNECTION_URL
      );

      await mongooseDBProvider.connect();

      await mongooseDBProvider.clearDB();

      let usersCount = await mongooseDBProvider.getCollectionLength('users');
      let postsCount = await mongooseDBProvider.getCollectionLength('posts');

      expect(usersCount).toBe(0);
      expect(postsCount).toBe(0);

      await Promise.all([
        UserModel.create({ name: "Joe" }),
        PostModel.create({ title: "Post title" })
      ]);

      usersCount = await mongooseDBProvider.getCollectionLength('users');
      postsCount = await mongooseDBProvider.getCollectionLength('posts');

      expect(usersCount).toBe(1);
      expect(postsCount).toBe(1);

      await mongooseDBProvider.clearDB();

      usersCount = await mongooseDBProvider.getCollectionLength('users');
      postsCount = await mongooseDBProvider.getCollectionLength('posts');

      expect(usersCount).toBe(0);
      expect(postsCount).toBe(0);
    });
  });
});
