import createServer from "../utils/createServer";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../models/User";
import { userRegister, userLogin } from "../utils/userAuth";

const app = createServer();

describe("User", () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  describe("Auth", () => {
    describe("Register", () => {
      describe("One or more properties are missing", () => {
        it("should throw a BadRequestError", async () => {
          const user = new User(userLogin(5));
          await expect(user.validate()).rejects.toThrow();
        });
      });

      describe("User created succesfully", () => {
        it("should return a 201", async () => {
          const res = await request(app)
            .post("/api/v1/auth/register")
            .send(userRegister(1))
            .expect(201);

          expect(res.body.name).toEqual(userRegister(1).name);
          expect(res.body.email).toEqual(userRegister(1).email);
          expect(res.body.userId).toBeDefined();
        });
      });
    });
    describe("Login", () => {
      describe("Invalid password", () => {
        it("should return 400 and 'Provide all values message!'", async () => {
          const res = await request(app)
            .post("/api/v1/auth/login")
            .send(userRegister(5).email)
            .expect(400);

          expect(res.body.msg).toEqual("Please provide all values!");
        });
      });

      describe("Invalid email", () => {
        it("should return 400  and 'Invalid credentials!' message", async () => {
          await request(app)
            .post("/api/v1/auth/register")
            .send(userRegister(3))
            .expect(201);
          const res = await request(app)
            .post("/api/v1/auth/login")
            .send(userLogin(4))
            .expect(400);

          expect(res.body.msg).toEqual("Invalid credentials!");
        });
      });

      describe("Different passwords", () => {
        it("should return a 401 with 'Invalid credentials!' message", async () => {
          await request(app)
            .post("/api/v1/auth/register")
            .send(userRegister(6))
            .expect(201);
          const res = await request(app)
            .post("/api/v1/auth/login")
            .send({ email: userRegister(6).email, password: "randomPassword" })
            .expect(401);

          expect(res.body.msg).toEqual("Invalid credentials!");
        });
      });

      describe("Login Successful", () => {
        it("should return a 200", async () => {
          await request(app)
            .post("/api/v1/auth/register")
            .send(userRegister(2))
            .expect(201);

          await request(app)
            .post("/api/v1/auth/login")
            .send(userLogin(2))
            .expect(200);
        });
      });
    });
    describe("Get Current User", () => {
      describe("If there is no user", () => {
        it("should return a 401 with 'Authentication Invalid!' message", async () => {
          const res = await request(app)
            .get("/api/v1/auth/getCurrentUser")
            .expect(401);

          expect(res.body.msg).toEqual("Authentication Invalid!");
        });
      });
      describe("If there is a user", () => {
        it("should return a 200 with the user", async () => {
          const user = await request(app)
            .post("/api/v1/auth/register")
            .send(userRegister(7))
            .expect(201);
          expect(user.get("Set-Cookie")).toBeDefined;
          const token = user.get("Set-Cookie").toString();
          const formattedToken = token.split("token=")[1].split(";")[0];

          const res = await request(app)
            .get("/api/v1/auth/getCurrentUser")
            .expect(200)
            .set(
              "Cookie",
              `token=${formattedToken}; Path=/; HttpOnly; Secure; SameSite=none`
            );
          expect(res.body._id).toBe(user.body.userId);
          expect(res.body.name).toEqual(user.body.name);
          expect(res.body.email).toBe(user.body.email);
        });
      });
    });
    describe("Logout user", () => {
      describe("If the logout was successful", () => {
        it("should return 200 and 'User logged out' message", async () => {
          await request(app)
            .post("/api/v1/auth/register")
            .send(userRegister(8))
            .expect(201);

          const res = await request(app).get("/api/v1/auth/logout").expect(200);
          expect(res.body.msg).toEqual("User logged out!");
        });
      });
    });
  });
});
