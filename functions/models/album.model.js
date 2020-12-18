const firebaseManager = require("./../system/firebase/firebase.manager");
const { deleteCollection } = require("./../utils/util");
const BATCH_SIZE = 25;
const COLLECTION = "albums";

module.exports.find = async (filters = []) => {
  return await firebaseManager.find(COLLECTION, filters);
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

module.exports.reorderAlbum = async (currentPosition, newPosition) => {
  // both positions are same  hence nothing is required to do
  if (currentPosition === newPosition) {
    return;
  }
  let startPosition = newPosition, endPosition = currentPosition;
  if (newPosition > currentPosition) {
    startPosition = currentPosition;
    endPosition = newPosition;
  }

  // create filters
  let filters = [];
  filters.push({
    operation: firebaseManager.operations.ORDER_BY,
    fieldRef: "displayPosition",
  });
  filters.push({
    operation: firebaseManager.operations.WHERE,
    fieldRef: "displayPosition",
    opStr: firebaseManager.operators.GREATER_THAN_OR_EQUAL_TO,
    value: startPosition,
  });
  filters.push({
    operation: firebaseManager.operations.WHERE,
    fieldRef: "displayPosition",
    opStr: firebaseManager.operators.LESS_THAN_OR_EQUAL_TO,
    value: endPosition,
  });

  let albumsToReOrder = await firebaseManager.find(COLLECTION, filters);
  let length = albumsToReOrder.length;
  
  let start = 0;
  let end = length - 1 ;
  let displayPosition = startPosition;

  if(newPosition < currentPosition) {
    await firebaseManager.updateById(COLLECTION, albumsToReOrder[end].id, { displayPosition : newPosition});
    displayPosition+=1;
    end-=1;
  } else {
    await firebaseManager.updateById(COLLECTION, albumsToReOrder[start].id, { displayPosition : newPosition});
    start+=1;
  }
  
  for (let i = start; i <= end ; i++) {
    let album = albumsToReOrder[i];
    await firebaseManager.updateById(COLLECTION, album.id, { displayPosition });
    displayPosition+=1;
  }
};
