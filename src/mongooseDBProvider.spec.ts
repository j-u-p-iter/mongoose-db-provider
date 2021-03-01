import mongoose from "mongoose";

import { createMongooseDBProvider } from ".";

describe("createMongooseDBProvider", () => {
  afterEach(async () => {
    await mongoose.connection.close();
  });

  describe("connect", () => {
    describe("with valid connection url", () => {
      it("creates db connection", async () => {
        const connection = await createMongooseDBProvider(
          "mongodb://localhost:27017/test"
        ).connect();

        expect(connection.connections).toBeDefined();
        expect(connection.models).toBeDefined();
      });
    });

    describe("with invalid connection url", () => {
      it("writes error to console", async () => {
        const consoleErrorSpy = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});

        await createMongooseDBProvider("invalid-connection-url").connect();

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy.mock.calls.length).toBe(1);
      });
    });
  });

  describe("close", () => {
    it("closes connection", async () => {
      const connectionSpy = jest.spyOn(mongoose.connection, "close");

      const provider = createMongooseDBProvider(
        "mongodb://localhost:27017/test"
      );

      await provider.connect();

      expect(connectionSpy).toHaveBeenCalledTimes(0);

      await provider.close();

      expect(connectionSpy).toHaveBeenCalledTimes(1);
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

      const provider = createMongooseDBProvider(
        "mongodb://localhost:27017/test"
      );

      await provider.connect();

      await provider.clearDB();

      let usersCount = await mongoose.connection.collections.users.count();
      let postsCount = await mongoose.connection.collections.posts.count();

      expect(usersCount).toBe(0);
      expect(postsCount).toBe(0);

      await Promise.all([
        UserModel.create({ name: "Joe" }),
        PostModel.create({ title: "Post title" })
      ]);

      usersCount = await mongoose.connection.collections.users.count();
      postsCount = await mongoose.connection.collections.posts.count();

      expect(usersCount).toBe(1);
      expect(postsCount).toBe(1);

      await provider.clearDB();

      //usersCount = await mongoose.connection.collections.users.count();
      //postsCount = await mongoose.connection.collections.posts.count();

      //expect(usersCount).toBe(0);
      //expect(postsCount).toBe(0);
    });
  });
});
