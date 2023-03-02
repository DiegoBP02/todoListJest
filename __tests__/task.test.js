import createServer from "../utils/createServer";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { userRegister } from "../utils/userAuth";

const app = createServer();

const task = {
  task: "work",
};
const updateTask = {
  task: "work harder",
  completed: true,
  urgency: "medium",
};

describe("Task", () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  describe("Create task", () => {
    describe("No task in the req.body", () => {
      it("should return a 400 with 'Please provide all values!' message", async () => {
        const user = await request(app)
          .post("/api/v1/auth/register")
          .send(userRegister(1))
          .expect(201);
        expect(user.get("Set-Cookie")).toBeDefined;
        const token = user.get("Set-Cookie").toString();
        const formattedToken = token.split("token=")[1].split(";")[0];

        const res = await request(app)
          .post("/api/v1/task")
          .send({})
          .set(
            "Cookie",
            `token=${formattedToken}; Path=/; HttpOnly; Secure; SameSite=none`
          )
          .expect(400);
        expect(res.body.msg).toEqual("Please provide all values!");
      });
    });
    describe("Task created successfully", () => {
      it("should return a 201 with task", async () => {
        const user = await request(app)
          .post("/api/v1/auth/register")
          .send(userRegister(2))
          .expect(201);
        expect(user.get("Set-Cookie")).toBeDefined;
        const token = user.get("Set-Cookie").toString();
        const formattedToken = token.split("token=")[1].split(";")[0];

        const res = await request(app)
          .post("/api/v1/task")
          .send(task)
          .set(
            "Cookie",
            `token=${formattedToken}; Path=/; HttpOnly; Secure; SameSite=none`
          )
          .expect(201);
        expect(res.body.task).toEqual(task.task);
      });
    });
  });
  describe("Get all tasks", () => {
    describe("Get all tasks successful", () => {
      it("should return a 200 with the tasks", async () => {
        const user = await request(app)
          .post("/api/v1/auth/register")
          .send(userRegister(3))
          .expect(201);
        expect(user.get("Set-Cookie")).toBeDefined;
        const token = user.get("Set-Cookie").toString();
        const formattedToken = token.split("token=")[1].split(";")[0];
        const res = await request(app)
          .get("/api/v1/task")
          .set(
            "Cookie",
            `token=${formattedToken}; Path=/; HttpOnly; Secure; SameSite=none`
          )
          .expect(200);

        expect(res.body.tasks).toBeDefined();
        expect(res.body.totalTasks).toBeDefined();
        expect(res.body.numOfPages).toBeDefined();
      });
    });
  });
  describe("Update task", () => {
    describe("If one property is missing", () => {
      it("should return a 400 with 'Please provide all values!' message", async () => {
        // register user
        const user = await request(app)
          .post("/api/v1/auth/register")
          .send(userRegister(4))
          .expect(201);
        expect(user.get("Set-Cookie")).toBeDefined;
        const token = user.get("Set-Cookie").toString();
        const formattedToken = token.split("token=")[1].split(";")[0];
        const resTask = await request(app)
          .post("/api/v1/task")
          .send(task)
          .set(
            "Cookie",
            `token=${formattedToken}; Path=/; HttpOnly; Secure; SameSite=none`
          )
          .expect(201);
        expect(resTask.body.task).toEqual(task.task);
        const taskId = resTask.body._id;
        const res = await request(app)
          .patch(`/api/v1/task/${taskId}`)
          .send({ task: "study", completed: true })
          .set(
            "Cookie",
            `token=${formattedToken}; Path=/; HttpOnly; Secure; SameSite=none`
          )
          .expect(400);
        expect(res.body.msg).toEqual("Please provide all values!");
      });
    });
    describe("If the task wasn't found", () => {
      it("should return 404 with `No task with id: <taskId>!` message", async () => {
        const randomId = new mongoose.Types.ObjectId();
        const user = await request(app)
          .post("/api/v1/auth/register")
          .send(userRegister(5))
          .expect(201);
        expect(user.get("Set-Cookie")).toBeDefined;
        const token = user.get("Set-Cookie").toString();
        const formattedToken = token.split("token=")[1].split(";")[0];

        const res = await request(app)
          .patch(`/api/v1/task/${randomId}`)
          .send(updateTask)
          .set(
            "Cookie",
            `token=${formattedToken}; Path=/; HttpOnly; Secure; SameSite=none`
          )
          .expect(404);
        expect(res.body.msg).toEqual(`No task with id: ${randomId}!`);
      });
    });
    describe("If the task was updated successfully", () => {
      it("should return a 200 with the updated task", async () => {
        const user = await request(app)
          .post("/api/v1/auth/register")
          .send(userRegister(6))
          .expect(201);
        expect(user.get("Set-Cookie")).toBeDefined;
        const token = user.get("Set-Cookie").toString();
        const formattedToken = token.split("token=")[1].split(";")[0];

        const resTask = await request(app)
          .post("/api/v1/task")
          .send(task)
          .set(
            "Cookie",
            `token=${formattedToken}; Path=/; HttpOnly; Secure; SameSite=none`
          )
          .expect(201);
        expect(resTask.body.task).toEqual(task.task);
        const taskId = resTask.body._id;
        const res = await request(app)
          .patch(`/api/v1/task/${taskId}`)
          .send(updateTask)
          .set(
            "Cookie",
            `token=${formattedToken}; Path=/; HttpOnly; Secure; SameSite=none`
          )
          .expect(200);
        expect(res.body.task).toEqual(updateTask.task);
        expect(res.body.completed).toEqual(updateTask.completed);
        expect(res.body.urgency).toEqual(updateTask.urgency);
      });
    });
  });

  describe("Delete task", () => {
    describe("If the task wasn't found", () => {
      it("should return 404 with `No task with id: <taskId>!` message", async () => {
        const randomId = new mongoose.Types.ObjectId();
        const user = await request(app)
          .post("/api/v1/auth/register")
          .send(userRegister(7))
          .expect(201);
        expect(user.get("Set-Cookie")).toBeDefined;
        const token = user.get("Set-Cookie").toString();
        const formattedToken = token.split("token=")[1].split(";")[0];

        const res = await request(app)
          .delete(`/api/v1/task/${randomId}`)
          .set(
            "Cookie",
            `token=${formattedToken}; Path=/; HttpOnly; Secure; SameSite=none`
          )
          .expect(404);
        expect(res.body.msg).toEqual(`No task with id: ${randomId}!`);
      });
    });
    describe("If the task was deleted successfully", () => {
      it("should return a 200 with 'Success! Task removed!' message", async () => {
        const user = await request(app)
          .post("/api/v1/auth/register")
          .send(userRegister(8))
          .expect(201);
        expect(user.get("Set-Cookie")).toBeDefined;
        const token = user.get("Set-Cookie").toString();
        const formattedToken = token.split("token=")[1].split(";")[0];
        const resTask = await request(app)
          .post("/api/v1/task")
          .send(task)
          .set(
            "Cookie",
            `token=${formattedToken}; Path=/; HttpOnly; Secure; SameSite=none`
          )
          .expect(201);
        expect(resTask.body.task).toEqual(task.task);
        const taskId = resTask.body._id;
        const res = await request(app)
          .delete(`/api/v1/task/${taskId}`)
          .set(
            "Cookie",
            `token=${formattedToken}; Path=/; HttpOnly; Secure; SameSite=none`
          )
          .expect(200);
        expect(res.body.msg).toEqual("Success! Task removed!");
      });
    });
  });
});
