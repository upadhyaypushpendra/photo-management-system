const firebaseManager = require("./../system/firebase/firebase.manager");
const db = require("./../dbConnection");
const { deleteCollection } = require("./../utils/util");
const albumsCollectionRef = db.collection("albums");
const BATCH_SIZE = 25;
const COLLECTION = "albums";

module.exports.findAll = async () => {
  return await firebaseManager.find(COLLECTION);
};

module.exports.findById = async (id) => {
  return await firebaseManager.findById(COLLECTION, id);
};

module.exports.create = async (album) => {
  return await firebaseManager.create(COLLECTION, album);
};
module.exports.update = async (id, album) => {
  return await firebaseManager.updateById(COLLECTION, id, album);
};
module.exports.delete = async (id) => {
  // delete photos subcollection from this album
  await deleteCollection(db, `albums/${id}/photos`, BATCH_SIZE);
  // delete album
  await firebaseManager.deleteById(COLLECTION, id);
};

module.exports.reorderAlbums = async (position1, position2) => {
  let startPosition, endPosition;
  if (position1 === position2) return;
  else if (position1 < position2) {
    startPosition = position1;
    endPosition = position2;
  } else {
    endPosition = position1;
    startPosition = position2;
  }
  let filters = [];
  filters.push({
    operation: firebaseManager.operations.WHERE,
    fieldRef: "displayPosition",
    opStr: firebaseManager.operators.LESS_THAN_OR_EQUAL_TO,
    value: startPosition,
  });
  filters.push({
    operation: firebaseManager.operations.WHERE,
    fieldRef: "displayPosition",
    opStr: firebaseManager.operators.GREATER_THAN_OR_EQUAL_TO,
    value: endPosition,
  });

  let albums = await firebaseManager.find(COLLECTION, filters);

  let displayPosition = startPosition;
  albums.forEach(async (album) => {
    await firebaseManager.updateById(COLLECTION, album.id, { displayPosition });
    displayPosition++;
  });
};