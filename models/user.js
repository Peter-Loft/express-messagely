"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const { DB_URI,
  SECRET_KEY,
  BCRYPT_WORK_FACTOR } = require("../config.js");


/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    // const { username, password, first_name, last_name, phone } = req.body;
    const hashPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(`
      INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
      VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
      RETURNING username, first_name, last_name, phone, join_at
    `, [username, hashPassword, first_name, last_name, phone]);

    const user = result.rows[0];

    if (!user) { throw new BadRequestError("Invalid credentials to create User") }

    return user;
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password
      FROM users
      WHERE username = $1`, [username]
    );

    const user = result.rows[0];

    if (await bcrypt.compare(password, user.password) === true && user) {
      return true;
    }
    else {
      return false;
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users 
      SET last_login_at = current_timestamp
      WHERE username = $1
      RETURNING username, last_login_at`, [username]
    );

    const user = result.rows[0];

    if (!user) {
      throw new NotFoundError(`User: ${username} not found`);
    }

    return user;
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const result = await db.query(
      `SELECT username, 
              first_name, 
              last_name
      FROM users`
    );

    const users = result.rows;

    return users;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT username,
              first_name, 
              last_name, 
              phone, 
              join_at,
              last_login_at
      FROM users
      WHERE username = $1`, [username]
    );

    const user = result.rows[0];

    if (!user) {
      throw new NotFoundError(`User: ${username} not found`);
    }

    return user;
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {

    const messageResult = await db.query(`
      SELECT id, to_username AS to_user, body, sent_at, read_at
      FROM messages
      WHERE from_username = $1
    `, [username]);

    let messages = messageResult.rows;

    console.log("messages: ", messages);

    for (let i = 0; i < messages.length; i++) {
      const toUser = messages[i].to_user;

      const userResult = await db.query(`
        SELECT username, first_name, last_name, phone
        FROM users
        WHERE username = $1
        `, [toUser]);

      const toUserInfo = userResult.rows[0];

      console.log("toUserInfo: ", toUserInfo);

      messages[i].to_user = toUserInfo;
    }

    return messages;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {

    const messageResult = await db.query(`
      SELECT id, from_username AS from_user, body, sent_at, read_at
      FROM messages
      WHERE to_username = $1
    `, [username]);

    let messages = messageResult.rows;

    for (let i = 0; i < messages.length; i++) {
      const fromUser = messages[i].from_user;
      const userResult = await db.query(`
        SELECT username, first_name, last_name, phone
        FROM users
        WHERE username = $1
        `, [fromUser]);
      const fromUserInfo = userResult.rows[0];

      messages[i].from_user = fromUserInfo;
    }

    return messages;
  }
}


module.exports = User;
