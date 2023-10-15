const { addSchema } = require("../validation/contactValidationSchemas");
const { HttpError } = require("../helpers/HttpError");
const { controllerWrapper } = require("../../utils/decorators/ctrlWrapper");

const useSchema = controllerWrapper(async (req, res, next) => {
  const { id: owner } = req.user;
  const { error } = addSchema.validate({ ...req.body, owner });

  if (error) {
    return next(new HttpError(400, error.message));
  }

  next();
});

module.exports = { useSchema };
