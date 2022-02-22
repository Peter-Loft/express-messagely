"use strict";

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Message = require("../models/message");
const { SECRET_KEY } = require("../config");

let test1Token;
let test2Token;
let m1;
let m2;

describe("Testing user routes", function () {
  beforeEach(async function () {
    await db.query("DELETE FROM messages");
    await db.query("DELETE FROM users");

    let u1 = await User.register({
      username: "test1",
      password: "password",
      first_name: "Test1",
      last_name: "Testy1",
      phone: "+14155550000",
    });

    let u2 = await User.register({
      username: "test2",
      password: "password",
      first_name: "Test2",
      last_name: "Testy2",
      phone: "+14155550002",
    });

    test1Token = jwt.sign({ username: u1.username }, SECRET_KEY);
    test2Token = jwt.sign({ username: u2.username }, SECRET_KEY);

    m1 = await Message.create({
      from_username: "test1",
      to_username: "test2",
      body: "t1 to t2"
    });
    m2 = await Message.create({
      from_username: "test2",
      to_username: "test1",
      body: "t2 to t1"
    });

  });

  describe("Testing GET users/", function () {
    test("Success condition", async function () {
      // user is logged in and receives all data
      const response = await request(app)
        .get("/users")
        .send({ _token: test1Token });

      expect(response.statusCode).toEqual(200);
      expect(response.body.users).toEqual(expect.any(Object));
      expect(response.body.users[0]).toEqual({
        username: "test1",
        first_name: "Test1",
        last_name: "Testy1"
      });
    });
    test("Fail condition: no token", async function () {
      const response = await request(app).get("/users");

      expect(response.statusCode).toEqual(401);
      expect(response.body).toEqual({
        "error": {
          "message": "Unauthorized",
          "status": 401
        }
      });
    });
    test("Fail condition: Invalid token", async function () {
      const response = await request(app)
        .get("/users")
        .send({ _token: "failure" });
      expect(response.statusCode).toEqual(401);
      expect(response.body).toEqual({
        "error": {
          "message": "Unauthorized",
          "status": 401
        }
      });
    });

  });

  describe("Testing GET /users/:username", function () {
    test("Testing Successful GET", async function () {
      const response = await request(app)
        .get("/users/test1")
        .send({ _token: test1Token });

      expect(response.statusCode).toEqual(200);
      expect(response.body.user.username).toEqual("test1");
      expect(response.body.user.first_name).toEqual("Test1");
      expect(response.body.user.last_name).toEqual("Testy1");
      expect(response.body.user.phone).toEqual("+14155550000");
      expect(new Date(response.body.user.join_at)).toEqual(expect.any(Date));
      expect(new Date(response.body.user.last_login_at)).toEqual(expect.any(Date));


    });

    test("Testing failed GET: no login", async function () {
      const response = await request(app)
        .get("/users/test1");

      expect(response.statusCode).toEqual(401);
      expect(response.body).toEqual({
        "error": {
          "message": "Unauthorized",
          "status": 401
        }
      });
    });

    test("Testing failed GET: failed login", async function () {
      const response = await request(app)
        .get("/users/test1")
        .send({ _token: "failure token" });
      expect(response.statusCode).toEqual(401);
      expect(response.body).toEqual({
        "error": {
          "message": "Unauthorized",
          "status": 401
        }
      });
    });


    test("Testing failed GET: no user, but valid token", async function () {
      const response = await request(app)
        .get("/users/wronguser")
        .send({ _token: test1Token });

      expect(response.statusCode).toEqual(401);
      expect(response.body).toEqual({ "error": { "message": "Unauthorized", "status": 401 } });
    });
  });

  describe("Testing GET /users/:username/to", function () {

    test("Testing success: user is logged in and authorized to see messages",
      async function () {
        const response = await request(app)
          .get("/users/test1/to")
          .send({ _token: test1Token });

        expect(response.statusCode).toEqual(200);

        console.log("##### response.body.messages: ", response.body.messages)
        // message m2 is being sent FROM test2 TO test1, so it should show up here
        expect(response.body.messages[0].id).toEqual(m2.id);
      });

    test("Testing failed: user is logged in, but trying to access other user messages",
      function () {

      });

  });
});