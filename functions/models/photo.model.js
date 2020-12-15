const db = require("./../dbConnection");
const photosCollectionRef = db.collection("photos");

module.exports.findAll = async function() {
  return await photosCollectionRef.get();
};

module.exports.findByLastIdAndLimit = async function (startAfter, limit) {
  const photoQuerySnapshot = null;
  const photos = [];
  if (startAfter) {
    photoQuerySnapshot = await photosCollectionRef
      .orderBy("dateModified")
      .limit(limit)
      .get();
  } else {
    photoQuerySnapshot = await photosCollectionRef
      .orderBy("dateModified")
      .startAfter(startAfter)
      .limit(limit)
      .get();
  }
  photoQuerySnapshot.forEach((doc) => {
    photos.push({
      id: doc.id,
      ...doc.data(),
    });
  });
  return photos;
};

module.exports.filter = async function (filterObject) {
  return await photosCollectionRef.where(filterObject.field,filterObject.operator,filterObject.value).get();
}
module.exports.findById = async function (id) {
  return await photosCollectionRef.doc(id).get();
};

module.exports.create = async function (photo) {
  const photoRef = await photosCollectionRef.add(photo);
  return await photoRef.get();
};

module.exports.update = async function (id, photo) {
  const photoRef = photosCollectionRef.doc(id);
  await photoRef.update(photo);
  return await photoRef.get();
};

module.exports.delete = async function (id) {
  await photosCollectionRef.doc(id).delete();
};
