const connection = require("../../db");
const { HttpError } = require("../helpers/HttpError");

const useValidationEmail = async (req, res, next) => {
  const { email } = req.body;

  connection.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (error, result) => {
      if (error) {
        // Обработка ошибки при выполнении запроса к базе данных
        return next(error);
      }

      if (result.length > 0) {
        // Если результат содержит записи, значит, email уже используется
        return next(new HttpError(409, "Email in use"));
      }

      // Если нет записей, email свободен
      next();
    }
  );
};

module.exports = {
  useValidationEmail,
};
