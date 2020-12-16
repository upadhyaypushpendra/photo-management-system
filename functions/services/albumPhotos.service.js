const albumPhotosModel = require("../models/alubmPhotos.model");

module.exports.findAll = async function (albumId, callback) {
  let errors = [];
  if (!albumId) {
    errors.push({ id: "Required" });
  }
  if (errors.length > 0) {
    callback(errors, null);
  } else {
    let photos = await albumPhotosModel.findAll(albumId);
    callback(null, photos);
  }
};

module.exports.addPhoto = async function (albumId, photoData, callback) {
    let errors = [];
    if (!albumId) {
      errors.push({ id: "Required" });
    }
    if(!photoData){
        errors.push({ photoData: "Required" });
    }
    if(!photoData.id){
        errors.push({ photoData: "photoData id Required" });
    }
    if (errors.length > 0) {
      callback(errors, null);
    } else {
      let photo = await albumPhotosModel.addPhoto(albumId,photoData);
      callback(null, photo);
    } 
};

module.exports.deletePhoto = async function (albumId, photoId, callback) {
    let errors = [];
    if (!albumId) {
      errors.push({ id: "Required" });
    }
    if(!photoId){
        errors.push({ photoId: "Required" });
    }
    if (errors.length > 0) {
      callback(errors, null);
    } else {
      let photo = await albumPhotosModel.deletePhoto(albumId,photoId);
      callback(null, photo);
    } 
};

module.exports.updatePhoto = async function (albumId, photoId,photo, callback) {
    let errors = [];
    if (!albumId) {
      errors.push({ id: "Required" });
    }
    if(!photoId){
        errors.push({ photoId: "Required" });
    }
    if(!photo){
        errors.push({ photo: "Required" });
    }
    if (errors.length > 0) {
      callback(errors, null);
    } else {
      let photo = await albumPhotosModel.updatePhoto(albumId,photoId,photo);
      callback(null, photo);
    } 
};
