const jwt = require("jsonwebtoken");
const { HttpError } = require("../helpers/HttpError");
require("dotenv").config();
const connection = require("../../db");

const { SECRET_KEY } = process.env;

const verifyToken = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new HttpError(401);
    }

    const [bearer, token] = authorization.split(" ");

    if (bearer !== "Bearer") {
      throw new HttpError(401);
    }

    const decoded = jwt.verify(token, SECRET_KEY);

    connection.query(
      "SELECT * FROM users WHERE id = ? AND token = ?",
      [decoded.userId, token],
      (error, results) => {
        if (error) {
          throw new HttpError(500, "Internal Server Error");
        }

        const user = results[0];

        if (!user) {
          throw new HttpError(401);
        }

        req.user = user;
        next();
      }
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { verifyToken };
