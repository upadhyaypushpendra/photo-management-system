const firebase = require("./firebase");

module.exports.operations = {
  WHERE: "WHERE",
  START_AT: "START_AT",
  START_AFTER: "START_AFTER",
  END_AT: "END_AT",
  END_BEFORE: "END_BEFORE",
  LIMIT: "LIMIT",
  ORDER_BY: "ORDER_BY",
};

module.exports.operators = {
  EQUAL_TO: "==",
  LESS_THAN: "<",
  LESS_THAN_OR_EQUAL_TO: "<=",
  GREATER_THAN: "<",
  GREATER_THAN_OR_EQUAL_TO: "<=",
  NOT_EQUAL_TO: "!=",
  ARRAY_CONTAINS: "array-contains",
  ARRAY_CONTAINS_ANY: "array-contains-any",
  IN: "in",
  NOT_IN: "not-in",
};
module.exports.findById = async (collection, id) => {
  const collectionRef = firebase.collection(collection);
  const docRef = collectionRef.doc(id);
  return await docRef.get();
};

module.exports.find = async (collection, filters = []) => {
  let query = firebase.collection(collection);

  //assumes filters is in processing order
  query = filters.reduce((accQuery, filter) => {
    switch (filter.operation) {
      case this.filters.WHERE:
        return accQuery.where(filter.fieldRef, filter.opStr, filter.value);
      case this.filters.ORDER_BY:
        return accQuery.orderBy(filter.value);
      case this.filters.START_AT:
        return accQuery.startAt(filter.value);
      case this.filters.START_AFTER:
        return accQuery.startAfter(filter.value);
      case this.filters.END_AT:
        return accQuery.endAt(filter.value);
      case this.filters.END_BEFORE:
        return accQuery.endBefore(filter.value);
      case this.filters.LIMIT:
        return accQuery.limit(filter.value);
      default:
        return accQuery;
    }
  }, query);

  const querySnapshot = await query.get();
  let docs = [];
  querySnapshot.forEach((doc) => {
    docs.push({ id: doc.id, ...doc.data() });
  });
  return docs;
};
module.exports.set = async (collection,docId,data) => {
    const collectionRef = firebase.collection(collection);
    const docRef = await collectionRef.doc(docId).set(data);
    return await docRef.get();
  };
module.exports.create = async (collection, data) => {
  const collectionRef = firebase.collection(collection);
  const docRef = await collectionRef.add(data);
  return await docRef.get();
};
module.exports.deleteById = async (collection, id) => {
  const collectionRef = firebase.collection(collection);
  const docRef = collectionRef.doc(id);
  await docRef.delete();
};
module.exports.updateById = async (collection, id, data) => {
  const collectionRef = firebase.collection(collection);
  const docRef = collectionRef.doc(id);
  await docRef.update(data, { merge: true });
  return await docRef.get();
};
