"use strict";

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const { SECRET_KEY } = require("../config");

let test1Token;
let test2Token;

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

  });

  describe("Testing GET /", function () {
    test("Success condition", async function () {
      // user is logged in and receives all data
      console.log("$$$$$$$ test1Token: ", test1Token);

      const response = await request(app).get("/");

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual.any(Array);
      expect(response.body[1]).toEqual({
        username: "test1",
        first_name: "Test1",
        last_name: "Testy1"
      });


    });
    test("Failure condition", async function () {

    });

  });

});