"use strict";

const Router = require("express").Router;
const router = new Router();
const { User } = require("../models/user.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config.js");
const { UnauthorizedError } = require("../expressError.js");

/** POST /login: {username, password} => {token} */
router.post("/login", async function (req, res, next) {
  const { username, password } = req.body;

  if (await User.authenticate(username, password) === true) {
    const token = await jwt.sign(await User.get(username), SECRET_KEY);
    return res.json({ token });
  }
  else {
    throw new UnauthorizedError("Invalid user/password");
  }
});


/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post('/register', async function (req, res, next) {
  const userInputs = req.body;

  const user = await User.register(userInputs);

  if (await User.authenticate(username, password) === true) {
    const token = jwt.sign(await User.get(username), SECRET_KEY);
    return res.json({ token });
  }
  else {
    throw new UnauthorizedError("Invalid user/password");
  }
});

module.exports = router;