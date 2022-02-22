"use strict";

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const { SECRET_KEY } = require("../config");

let test1Token;
let test2Token;

describe("Testing user routes", async function () {
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
      const response = await request(app).get('/').send({ _token: test1Token })


    });
    test("Failure condition", async function () {

    });

  });

});