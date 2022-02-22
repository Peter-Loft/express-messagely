"use strict";

const Router = require("express").Router;
const router = new Router();
const { ensureLoggedIn,
  ensureCorrectUser } = require("../middleware/auth");

const { UnauthorizedError } = require("../expressError");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id",
  ensureLoggedIn,
  async function (req, res, next) {
    const messageId = res.params.id;
    const message = Message.get(messageId);

    if (res.locals.user.username === message.from_user.username ||
      res.locals.user.username === message.to_user.username) {
      return res.json({ message });
    }
  });


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/",
  ensureLoggedIn,
  async function (req, res, next) {
    const { to_username, body } = req.body;
    const message = Message.create({
      from_username: res.locals.user.username,
      to_username: to_username,
      body: body
    });

    return res.json({ message });
  });


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read",
  ensureLoggedIn,
  async function (req, res, next) {
    const messageId = req.params.id;
    const message = Message.get(messageId);
    const toUsername = message.to_user.username;

    if (toUsername === res.locals.user.username) {
      const messageRead = Message.markRead(messageId);
      return res.json({ message: messageRead });
    }
    else {
      throw new UnauthorizedError(
        "Only recipient may mark this message as read");
    }

  });

module.exports = router;