const firebaseManager = require("./../system/firebase/firebase.manager");

module.exports.findAll = async (albumId) => {
  return await firebaseManager.find(`albums/${albumId}/photos`);
};

module.exports.addPhoto = async (albumId, photo) => {
  return await firebaseManager.create(
    `albums/${albumId}/photos`,
    photo.id,
    photo
  );
};
module.exports.deletePhoto = async (albumId, photoId) => {
  return await firebaseManager.deleteById(`albums/${albumId}/photos`, photoId);
};

module.exports.updatePhoto = async (albumId, photoId, photo) => {
  return await firebaseManager.updateById(
    `albums/${albumId}/photos`,
    photoId,
    photo
  );
};
