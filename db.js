const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "api",
});

connection.connect((error) => {
  if (error) {
    console.error("Ошибка подключения к БД!");
  } else {
    console.log("Подключение к БД успешно!");
  }
});

module.exports = connection;
