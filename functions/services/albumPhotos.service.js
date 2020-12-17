const albumPhotosModel = require("../models/alubmPhotos.model");

module.exports.findAll = async function (albumId) {
  let errors = [];
  if (!albumId) {
    errors.push({ id: "Required" });
  }
  if (errors.length > 0) {
    return {
      error: true,
      statuscode: 400,
      data: errors,
    };
  } else {
    let photos = await albumPhotosModel.findAll(albumId);
    return {
      statusCode: 200,
      data: photos,
    };
  }
};

module.exports.addPhoto = async function (albumId, photoData) {
  let errors = [];
  if (!albumId) {
    errors.push({ id: "Required" });
  }
  if (!photoData) {
    errors.push({ photoData: "Required" });
  }
  if (!photoData.id) {
    errors.push({ photoData: "photoData id Required" });
  }
  if (errors.length > 0) {
    return {
      error: true,
      statuscode: 400,
      data: errors,
    };
  } else {
    let photo = await albumPhotosModel.addPhoto(albumId, photoData);
    return {
      statusCode: 200,
      data: photo,
    };
  }
};

module.exports.deletePhoto = async function (albumId, photoId) {
  let errors = [];
  if (!albumId) {
    errors.push({ id: "Required" });
  }
  if (!photoId) {
    errors.push({ photoId: "Required" });
  }
  if (errors.length > 0) {
    return {
      error: true,
      statuscode: 400,
      data: errors,
    };
  } else {
    let photo = await albumPhotosModel.deletePhoto(albumId, photoId);
    return {
      statusCode: 200,
      data: photo,
    };
  }
};

module.exports.updatePhoto = async function (albumId, photoId, photo) {
  let errors = [];
  if (!albumId) {
    errors.push({ id: "Required" });
  }
  if (!photoId) {
    errors.push({ photoId: "Required" });
  }
  if (!photo) {
    errors.push({ photo: "Required" });
  }
  if (errors.length > 0) {
    return {
      error: true,
      statuscode: 400,
      data: errors,
    };
  } else {
    let photo = await albumPhotosModel.updatePhoto(albumId, photoId, photo);
    return {
      statusCode: 200,
      data: photo,
    };
  }
};
