const path = require("path");

console.log("CURRENT FILE =", __filename);

console.log("DB PATH =", require.resolve("./db"));

const db = require("./db");

console.log(db);

console.log(db.constructor.name);

console.log(typeof db);

console.log(db.prepare("SELECT name FROM sqlite_master").all());