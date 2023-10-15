const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcrypt");
const connection = require("../db");
const util = require("util");
const query = util.promisify(connection.query).bind(connection);

const { controllerWrapper } = require("../utils/decorators/ctrlWrapper");
const { HttpError } = require("../utils/helpers/HttpError");

const { SECRET_KEY } = process.env;

const registerUser = controllerWrapper(async (req, res, next) => {
  const { email, password, subscription = "starter" } = req.body;
  const hashPassword = await bcrypt.hash(password, 10);
  const user = {
    email,
    password: hashPassword,
    subscription,
    token: "",
  };

  await query("INSERT INTO users SET ?", user, (error, result) => {
    if (error) {
      return next(error);
    }

    const insertedId = result.insertId;

    connection.query(
      "SELECT * FROM users WHERE id = ?",
      [insertedId],
      (error, addedUser) => {
        if (error) {
          return next(error);
        }

        const token = jwt.sign({ userId: insertedId }, SECRET_KEY, {
          expiresIn: "22h",
        });

        connection.query(
          "UPDATE users SET token = ? WHERE id = ?",
          [token, insertedId],
          (error, result) => {
            if (error) {
              return next(error);
            }

            res.status(201).json({
              token,
              user: {
                email: addedUser[0].email,
                subscription: addedUser[0].subscription,
              },
            });
          }
        );
      }
    );
  });
});

const loginUser = controllerWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  const results = await query("SELECT * FROM users WHERE email = ?", [email]);

  if (results.length === 0) {
    return res.status(401).json({ message: "Email or password is wrong" });
  }

  const user = results[0];

  const comparePassword = await bcrypt.compare(password, user.password);

  if (!comparePassword) {
    throw new HttpError(401, "Email or password is wrong");
  }

  const newtoken = jwt.sign({ userId: user.id }, SECRET_KEY, {
    expiresIn: "12h",
  });

  await query("UPDATE users SET token = ? WHERE id = ?", [newtoken, user.id]);

  res.status(200).json({
    token: newtoken,
    user: { email: user.email, subscription: user.subscription },
  });
});

const getCurrentUser = controllerWrapper(async (req, res) => {
  const { token } = req.user;
  res.status(200).json(token);
});

const logoutUser = (req, res, next) => {
  const { id } = req.user;
  const token = "";

  connection.query(
    "UPDATE users SET token = ? WHERE id = ?",
    [token, id],
    (error, result) => {
      if (error) {
        return next(error);
      }

      res.status(204).end();
    }
  );
};

const updateSubscription = controllerWrapper(async (req, res, next) => {
  const { id } = req.user;
  const { subscription } = req.body;
  connection.query(
    "UPDATE users SET subscription = ? WHERE id = ?",
    [subscription, id],
    (error, result) => {
      if (error) {
        return next(error);
      }

      res.status(200).json({ subscription: subscription });
    }
  );
});

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  updateSubscription,
};
