const photoModel = require("./../models/photo.model");
const albumPhotosService = require("./albumPhotos.service");
const MAX_LIMIT = 30;

module.exports.findById = async function (id) {
  const errors = [];
  if (!id) {
    errors.push({ id: "Required" });
  }
  if (errors.length > 0) {
    return {
      error: true,
      statusCode: 400,
      data: errors,
    };
  }
  const photo = await photoModel.findById(id);
  if (photo.exists) {
    return {
      statusCode: 200,
      data: { id, ...photo.data() },
    };
  } else {
    return {
      error: true,
      statuscode: 404,
      data: `Photo with ID : ${id} not found`,
    };
  }
};

module.exports.findByLastIdAndLimit = async function (lastId, pageSize) {
  let limit = pageSize || MAX_LIMIT;
  let photos = [];
  let last = null;
  // Check query contains last
  if (lastId) {
    // Get photo by last parameter
    let last = await photoModel.findById(lastId);
    // Check last exists in collection
    if (!last.exists) {
      return {
        error: true,
        statusCode: 400,
        data: [{ lastId: "Invalid lastId" }],
      };
    }
  }
  // Get all photos after last and limit to limit
  photos = await photoModel.findByLastIdAndLimit(last, limit);
  return {
    statusCode: 200,
    data: photos,
  };
};

module.exports.filter = async function (filter) {
  let errors = [];
  if (!filter.field)
    errors.push({ filter: `Invalid filter field ${filter.field}` });
  if (!filter.operator)
    errors.push({ operator: `Invalid filter operator : ${filter.operator}` });
  if (!filter.value)
    errors.push({ value: `Invalid filter value : ${filter.value}` });

  if (errors.length > 0) {
    return {
      error: true,
      statuscode: 400,
      data: errors,
    };
  }
  const photos = await photoModel.filter(
    filter.field,
    filter.operator,
    filter.value
  );
  return {
    statusCode: 200,
    data: photos,
  };
};

module.exports.create = async function (photo) {
  let { name, description, albums, photoURL, isActive } = photo;

  if (!photo) errors.push({ photo: "Required" });
  if (!name) errors.push({ name: "photo name Required" });
  if (!albums) albums = [];
  if (!isActive) isActive = true;
  if (!description) description = "";
  if (errors.length > 0) {
    return {
      error: true,
      statusCode: 400,
      data: errors,
    };
  }
  const data = {
    name,
    description,
    albums,
    photoURL,
    isActive,
    dateCreated: Date.now(),
    dateModified: Date.now(),
  };

  let createdPhoto = await photoModel.create(data);

  albums.forEach(async (albumId) => {
    await albumPhotosService.addPhoto(albumId, createdPhoto);
  });
  return {
    statusCode: 200,
    data: createdPhoto,
  };
};

module.exports.update = async function (id, newPhoto) {
  let errors = [];
  if (!id) errors.push({ id: "id Required." });

  let photo = await photoModel.findById(id);
  if (!photo.exists) {
    errors.push({ id: `Invalid photo id : ${id}` });
  }
  if (errors.length > 0) {
    return {
      error: true,
      statuscode: 400,
      data: errors,
    };
  }
  const data = {};

  if (newPhoto.name) data.name = newPhoto.name;
  if (newPhoto.description) data.description = newPhoto.description;
  if (newPhoto.albums) data.albums = newPhoto.albums;
  if (newPhoto.photoURL) data.photoURL = newPhoto.photoURL;
  if (newPhoto.isActive) data.isActive = newPhoto.isActive;
  data.dateModified = Date.now();

  const updatedPhoto = await photoModel.update(id, data);

  if (newPhoto.albums) {
    const currentAlbums = photo.data().albums;

    const albumsToDelete = currentAlbums.filter(
      (currentAlbum) => !(currentAlbum in albums)
    );
    const albumsToUpdate = currentAlbums.filter(
      (currentAlbum) => currentAlbum in albums
    );
    const albumsToAdd = albums.filter((album) => !(album in currentAlbums));

    albumsToDelete.forEach(async (albumId) => {
      await albumPhotosService.deletePhoto(albumId, id);
    });
    albumsToUpdate.forEach(async (albumId) => {
      await albumPhotosService.updatePhoto(albumId,updatedPhoto);
    });
    albumsToAdd.forEach(async (albumId) => {
      await albumPhotosService.addPhoto(albumId, updatedPhoto);
    });
  }
  return {
    statusCode: 200,
    data: updatedPhoto,
  };
};

module.exports.delete = async function (id) {
  const errors = [];
  if (!id) {
    errors.push({ id: "Required" });
    return {
      error: true,
      statuscode: 400,
      data: errors,
    };
  }
  const photo = await photoModel.findById(id);
  if (!photo.exists) {
    errors.push({ id: `Photo with ID : ${id} doesn't exists.` });
  }
  if (errors.length > 0) {
    return {
      error: true,
      statuscode: 404,
      data: errors,
    };
  }
  photo.data().albums.forEach(async (albumId) => {
    await albumPhotosService.deletePhoto(albumId, id);
  });
  await photoModel.delete(id);
  return {
    statusCode: 200,
    data: `Photo with ID : ${id} deleted.`,
  };
};
