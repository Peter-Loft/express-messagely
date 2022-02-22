"use strict";

const Router = require("express").Router;
const router = new Router();
const User = require("../models/user");

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config.js");
const { UnauthorizedError } = require("../expressError.js");

/** POST /login: {username, password} => {token} */
router.post("/login", async function (req, res, next) {
  const { username, password } = req.body;

  if (await User.authenticate(username, password) === true) {
    const payload = {
      username: (await User.get(username)).username }
    const token = jwt.sign(payload, SECRET_KEY);
    return res.json({ token });
  }

  throw new UnauthorizedError("Invalid user/password");

});


/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post('/register', async function (req, res, next) {
  const {username, password, first_name, last_name, phone} = req.body;

  // console.log("userInputs: ", {username, password, first_name, last_name, phone});

  const user = await User.register({username, password, first_name, last_name, phone});

  if (await User.authenticate(username, password) === true) {
    const payload = {
      username: (await User.get(username)).username }
    const token = jwt.sign(payload, SECRET_KEY);
    return res.json({ token });
  }
  
  throw new UnauthorizedError("Invalid user/password");

});

module.exports = router;