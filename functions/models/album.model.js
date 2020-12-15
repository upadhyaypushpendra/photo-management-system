const db = require("./../dbConnection");
const { deleteCollection } = require("./../utils/util");
const albumsCollectionRef = db.collection("albums");
const BATCH_SIZE = 25;

module.exports.findAll = async () => {
  const albumQuerySnapshot = await albumsCollectionRef.get();
  const albums = [];
  albumQuerySnapshot.forEach((doc) => {
    albums.push({
      id: doc.id,
      ...doc.data(),
    });
  });
  return albums;
};

module.exports.findById = async (id) => {
  return await albumsCollectionRef.doc(id).get();
};

module.exports.create = async (album) => {
  const albumRef = await albumsCollectionRef.add(album);
  return await albumRef.get();
};
module.exports.update = async (id, album) => {
  const albumRef = albumsCollectionRef.doc(id);
  await albumRef.update(album);
  return await albumRef.get();
};
module.exports.delete = async (id) => {
  // delete photos subcollection from this album
  await deleteCollection(db, `albums/${id}/photos`, BATCH_SIZE);
  // delete album
  await albumsCollectionRef.doc(id).delete();
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
  let albumQuerySnapshot = await collection
    .where("displayPosition", "<=", startPosition)
    .where("displayPosition", ">=", endPosition)
    .orderBy("displayPosition")
    .get();
  let displayPosition = startPosition;
  albumQuerySnapshot.forEach(async (doc) => {
    await albumsCollectionRef
      .doc(doc.id)
      .update({ displayPosition }, { merge: true });
    displayPosition++;
  });
};
