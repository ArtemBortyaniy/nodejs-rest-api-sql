const { HttpError } = require("../utils/helpers/HttpError");
const { controllerWrapper } = require("../utils/decorators/ctrlWrapper");
const connection = require("../db");
const util = require("util");
const query = util.promisify(connection.query).bind(connection);

const listContacts = controllerWrapper(async (req, res, next) => {
  const { id: user_id } = req.user;

  await query(
    "SELECT * FROM contacts WHERE user_id = ?",
    [user_id],
    (error, results) => {
      if (error) {
        throw new HttpError(500);
      }

      res.status(200).json(results);
    }
  );
});

const getContactById = controllerWrapper(async (req, res, next) => {
  const contactId = req.params.contactId;
  const user_id = req.user.id;

  await query(
    "SELECT * FROM contacts WHERE id = ? AND user_id = ?",
    [contactId, user_id],
    (error, results) => {
      if (error) {
        throw new HttpError(500);
      } else if (results.length === 0) {
        throw new HttpError(404);
      } else {
        res.status(200).json(results[0]);
      }
    }
  );
});

const addContact = controllerWrapper(async (req, res, next) => {
  const { name, email, phone, favorite = "false" } = req.body;
  const user_id = req.user.id;

  await query(
    "INSERT INTO contacts (name, email, phone, favorite, user_id) VALUES (?, ?, ?, ?, ?)",
    [name, email, phone, favorite, user_id],
    (error, result) => {
      if (error) {
        next(error);
      } else {
        connection.query(
          "SELECT * FROM contacts WHERE id = ?",
          [result.insertId],
          (error, contact) => {
            if (error) {
              throw new HttpError(500);
            } else {
              res.status(201).json(contact[0]);
            }
          }
        );
      }
    }
  );
});

const removeContact = controllerWrapper(async (req, res, next) => {
  const contactId = req.params.contactId;
  const user_id = req.user.id;

  await query(
    "DELETE FROM contacts WHERE id = ? and user_id = ?",
    [contactId, user_id],
    (error) => {
      if (error) {
        throw new HttpError(500);
      }

      res.status(200).json({ message: "contact deleted" });
    }
  );
});

const updateContact = controllerWrapper(async (req, res, next) => {
  const { name, email, phone, favorite = "false" } = req.body;
  const contactId = req.params.contactId;
  const user_id = req.user.id;

  await query(
    "UPDATE contacts SET name = ?, email = ?, phone = ?, favorite = ? WHERE id = ? AND user_id = ?",
    [name, email, phone, favorite, contactId, user_id],
    (error, result) => {
      if (error) {
        throw new HttpError(500);
      } else if (result.affectedRows === 0) {
        throw new HttpError(404);
      } else {
        res.status(200).json({ message: "Contact updated successfully" });
      }
    }
  );
});

const updateFavorite = controllerWrapper(async (req, res, next) => {
  const { favorite } = req.body;
  const contactId = req.params.contactId;
  const user_id = req.user.id;

  await query(
    "UPDATE contacts SET favorite = ? WHERE id = ? AND user_id = ?",
    [favorite, contactId, user_id],
    (err, result) => {
      if (err) {
        throw new HttpError(500);
      }
      res.status(200).json({ message: "Contact updated successfully" });
    }
  );
});

module.exports = {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateFavorite,
};
