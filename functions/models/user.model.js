const firebaseManager = require("./../system/firebase/firebase.manager");
const COLLECTION = "users";

module.exports.find = async (filters = []) => {
  return await firebaseManager.find(COLLECTION, filters);
};

module.exports.findById = async (id) => {
  return await firebaseManager.findById(COLLECTION, id);
};
module.exports.findByEmail = async (email) => {
  let filters = [];
  filters.push({
    operation: firebaseManager.operations.WHERE,
    fieldRef: "email",
    opStr: firebaseManager.operators.EQUAL_TO,
    value: email,
  });
  filters.push({
    operation: firebaseManager.operations.LIMIT,
    value: 1,
  });
  let  result = await firebaseManager.find(COLLECTION, filters);
  return result.length > 0 ? result[0] : null;
};

module.exports.create = async (user) => {
  return await firebaseManager.create(COLLECTION, user);
};

module.exports.update = async (id, user) => {
  return await firebaseManager.updateById(COLLECTION, id, user);
};

module.exports.delete = async (id) => {
  return await firebaseManager.deleteById(COLLECTION, id);
};
