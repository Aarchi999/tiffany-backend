const bcrypt = require("bcrypt"); //bcrypt is designed specifically for secure password hashing

const SALT_ROUNDS = 10; //This controls how slow and secure the hashing process is

const bcryptHash = async (plainText) => {
  return bcrypt.hash(plainText, SALT_ROUNDS);
};

const bcryptCompare = async (plainText, hashValue) => {
  if (!hashValue) return false;
  return bcrypt.compare(plainText, hashValue);
};

module.exports = {
  bcryptHash,
  bcryptCompare    //Makes both functions reusable
};
