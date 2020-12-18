const firebaseManager = require("./../system/firebase/firebase.manager");

const COLLECTION = "photos";

module.exports.findAll = async function () {
  return await firebaseManager.find(COLLECTION);
};
module.exports.findByLastIdAndLimit = async function (startAfter, limit) {
  const filters = [];
  filters.push({
    operation: firebaseManager.operations.ORDER_BY,
    value: "dateModified",
  });

  if (startAfter) {
    filters.push({
      operation: firebaseManager.operations.START_AFTER,
      value: startAfter,
    });
  }

  filters.push({
    operation: firebaseManager.operations.LIMIT,
    value: limit || 30,
  });
  
  return await firebaseManager.find(COLLECTION, filters);
};

module.exports.filter = async function (filterObject) {
  return await firebaseManager.find(COLLECTION, [
    {
      operation: firebaseManager.operations.WHERE,
      fieldRef: filterObject.field,
      opStr: filterObject.operator,
      value: filterObject.value,
    },
  ]);
};
module.exports.findById = async function (id) {
  return await firebaseManager.findById(COLLECTION, id);
};

module.exports.create = async function (photo) {
  return await firebaseManager.create(COLLECTION, photo);
};

module.exports.update = async function (id, photo) {
  return firebaseManager.updateById(COLLECTION, id, photo);
};

module.exports.delete = async function (id) {
  await firebaseManager.deleteById(COLLECTION, id);
};
