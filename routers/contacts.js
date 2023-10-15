const express = require("express");

const router = express.Router();

const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateFavorite,
} = require("../controllers/contactsController");

const { verifyToken } = require("../utils/auth/verifyToken");
const { useSchema } = require("../utils/contacts/useSchema");

router.get("/", verifyToken, listContacts);

router.get("/:contactId", verifyToken, getContactById);

router.post("/", verifyToken, useSchema, addContact);

router.delete("/:contactId", verifyToken, removeContact);

router.put("/:contactId", verifyToken, useSchema, updateContact);

router.patch("/:contactId/favorite", verifyToken, updateFavorite);

module.exports = router;
