const albumModel = require("./../models/album.model");

const configService = require("../system/config/config.service");
const photoService = require("./photo.service");
const albumPhotosService = require("./albumPhotos.service");

module.exports.findAll = async () => {
  const albums = await albumModel.findAll();
  return {
    statusCode: 200,
    data: albums,
  };
};

module.exports.findById = async (albumId) => {
  const errors = [];
  if (!albumId) {
    errors.push({ id: "Required." });
  }
  if (errors.length > 0) {
    return {
      error: true,
      statusCode: 400,
      data: errors,
    };
  }

  const album = await albumModel.findById(albumId);
  if (album) {
    return {
      statusCode: 200,
      data: { id: album.id, ...album.data() },
    };
  } else {
    return {
      error: true,
      statusCode: 404,
      data: `Album with ID : ${albumId} doesn't exists.`,
    };
  }
};

module.exports.create = async (album) => {
  const { name, description, coverImageURL, isActive } = req.body;

  const errors = [];

  // Assuming album name is required.
  if (!name) errors.push({ name: "name Required." });

  if (!description) {
    // Adding empty string as default description.
    description = "";
  }
  if (!coverImageURL) {
    // add some default cover image
    // assuming default URL to :  https://kutuki/images/albumImage.jpg
    coverImageURL = "https://kutuki/images/albumImage.jpg";
  }
  if (!isActive) {
    // set some default value
    // assuming default to be true
    isActive = true;
  }
  if (errors.length > 0) {
    return {
      error: true,
      statusCode: 400,
      data: errors,
    };
  }

  let albumCount = (await configService.getAlbumCount()).data;
  const displayPosition = albumCount + 1;

  const albumData = {
    name,
    description,
    coverImageURL,
    displayPosition,
    isActive,
    dateCreated: Date.now(), // Assuming Created time to be added at server side
    dateModified: Date.now(), // Assuming Modified time to be added at server side
  };

  const createdAlbum = await albumModel.create(albumData);

  await configService.setAlbumCount(albumCount + 1);
  return {
    statusCode: 201,
    data: createdAlbum,
  };
};

module.exports.update = async (albumId, albumData) => {
  let errors = [];
  if (!albumId) {
    errors.push({ id: "Required" });
  }
  if (errors.length > 0) {
    return {
      error: true,
      statusCode: 400,
      data: errors,
    };
  }
  const {
    name,
    description,
    coverImageURL,
    displayPosition,
    isActive,
  } = albumData;

  const data = {};
  if (name) data.name = name;
  if (description) data.description = description;
  if (coverImageURL) data.coverImageURL = coverImageURL;
  if (displayPosition) data.displayPosition = displayPosition;
  if (isActive) data.isActive = isActive;

  data.dateModified = Date.now();

  const album = await albumModel.findById(albumId);
  if (album.exists) {
    if (displayPosition && album.data().displayPosition !== displayPosition) {
      //reorderAlbums(albumsCollectionRef,displayPosition,album.data().displayPosition);
    }
    const updatedAlbum = albumModel.update(data);
    return {
      statusCode: 200,
      data: updatedAlbum,
    };
  } else {
    return {
      error: true,
      statusCode: 400,
      data: `Album with ID : ${albumId} doesn't exists.`,
    };
  }
};

module.exports.delete = async (id) => {
  const errors = [];
  const albumId = req.params.id;
  if (albumId) {
    errors.push({ id: "Required." });
  }
  if (errors.length > 0) {
    return {
      error: true,
      statusCode: 400,
      data: errors,
    };
  }
  const album = await albumModel.findById(albumId);
  if (!album.exists) {
    return {
      error: true,
      statusCode: 404,
      data: `Album with ID : ${albumId} doesn't exists.`,
    };
  }

  // delete this albumId from all the photos
  const photoFilter = {
    field: "albums",
    operator: "array-contains",
    value: albumId,
  };
  let photos = await photoService.filter(photoFilter);
  if (photos.error) {
    return photos;
  }

  photos.data.forEach(async (doc) => {
    // remove albumId from photo
    await photoService.update(photo.id, {
      albums: photo.data().albums.filter((id) => id !== albumId),
    });
  });

  // delete album
  await albumModel.delete(albumId);

  //reorder albums
  let currentAlbumPosition = album.data().displayPosition;
  let totalAlbums = (await configService.getAlbumCount()).data;
  await albumModel.reorderAlbums(currentAlbumPosition, totalAlbums);
  return {
    statusCode: 200,
    data: `Album with ID : ${albumId} deleted.`,
  };
};

// Reorder albums
module.exports.reorderAlbums = async (position1, position2) => {
  const errors = [];
  if (!position1) errors.push({ position1: "Required." });
  if (!position2) errors.push({ position2: "Required." });

  if (errors.length > 0) {
    return {
      error: true,
      statusCode: 400,
      data: errors,
    };
  }

  await albumModel.reorderAlbums(position1, position2);
  return {
    statusCode: 200,
    data: {},
  };
};

// Reorder an album
module.exports.reorderAlbum = async (albumData) => {
  const errors = [];
  if (!albumData.albumId) errors.push({ albumId: "albumId Required." });

  if (!albumData.displayPosition)
    errors.push({ displayPosition: "displayPostion Required." });

  if (errors.length > 0) {
    return {
      error: true,
      statusCode: 400,
      data: errors,
    };
  }

  let album = albumModel.findById(albumData.albumId);
  if (!album.exists) {
    return {
      error: true,
      statusCode: 404,
      data: `Album with ID ${albumData.albumId} doesn't exists.`,
    };
  }

  const result = await this.reorderAlbums(
    albumData.displayPosition,
    album.data().displayPosition
  );
  if (!result.error) {
    return {
      statusCode: 200,
      data: albumData,
    };
  } else {
    return result;
  }
};

module.exports.getPhotosById = async (albumId) => {
  let errors = [];
  if (!albumId) {
    errors.push({ id: "Required" });
  }
  if (errors.length > 0) {
    return {
      error: true,
      statusCode: 400,
      data: errors,
    };
  }
  let album = await albumModel.findById(albumId);
  if (!album.exists) {
    return {
      error: true,
      statusCode: 400,
      data: `Alubm with id : ${albumId} doesn't exists.`,
    };
  }
  const photos = await albumPhotosService.findAll(albumId);
  return photos;
};
