const albumModel = require("./../models/album.model");
const configService = require("../system/config/config.service");
const photoService = require("./photo.service");
const albumPhotosService = require("./albumPhotos.service");

module.exports.findAll = async () => {
  const albums = await albumModel.find();
  return {
    statusCode: 200,
    data: albums,
  };
};
module.exports.find = async (filters) => {
  const albums = await albumModel.find(filters);
  return {
    statusCode: 200,
    data: albums,
  };
};
module.exports.findById = async (id) => {
  const errors = [];
  if (!id) {
    errors.push({ id: "Required." });
  }
  if (errors.length > 0) {
    return {
      error: true,
      statusCode: 400,
      data: errors,
    };
  }

  const album = await albumModel.findById(id);
  if (album.exists) {
    return {
      statusCode: 200,
      data: { id: album.id, ...album.data() },
    };
  } else {
    return {
      error: true,
      statusCode: 404,
      data: `Album with ID : ${id} doesn't exists.`,
    };
  }
};

module.exports.create = async (album) => {
  const { name, description, coverImageURL, isActive } = req.body;

  const errors = [];

  // Assuming album name is required.
  if (!name) errors.push({ name: "Required." });

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
    data: createdAlbum
  };
};

module.exports.update = async (id, albumData) => {
  let errors = [];
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

  const result = await this.findById(id);
  if (!result.error) {
    let album = result.data();
    if (displayPosition && album.displayPosition !== displayPosition) {
      let result = await this.reorderAlbums(
        album.displayPosition,
        displayPosition
      );
      if (result.error) return result;
    }
    const updatedAlbum = await albumModel.update(data);
    return {
      statusCode: 200,
      data: updatedAlbum,
    };
  } else {
    return result;
  }
};

module.exports.delete = async (id) => {
  const errors = [];
  if (id) {
    errors.push({ id: "Required." });
  }
  if (errors.length > 0) {
    return {
      error: true,
      statusCode: 400,
      data: errors,
    };
  }
  const album = await this.findById(id);
  if (!album.exists) {
    return {
      error: true,
      statusCode: 404,
      data: `Album with ID : ${id} doesn't exists.`,
    };
  }

  // delete this album's id from all the photos
  const photoFilter = {
    field: "albums",
    operator: "array-contains",
    value: id,
  };

  let photos = await photoService.filter(photoFilter);
  if (photos.error) {
    return photos;
  }

  photos.data.forEach(async (doc) => {
    // remove this album's id from photo
    await photoService.update(photo.id, {
      albums: photo.data().albums.filter((albumId) => albumId !== id),
    });
  });

  //reorder albums below current album
  let currentAlbumPosition = album.data().displayPosition;
  let totalAlbums = (await configService.getAlbumCount()).data;
  let result = await this.reorderAlbums(currentAlbumPosition, totalAlbums);
  if (result.error) return result;

  // delete album
  await albumModel.delete(id);

  return {
    statusCode: 200,
    data: `Album with ID : ${id} deleted.`,
  };
};

// Reorder albums
module.exports.reorderAlbums = async (currentPosition, newPosition) => {
  const errors = [];
  if (!currentPosition) errors.push({ currentPosition: "Required." });
  if (!newPosition) errors.push({ newPosition: "Required." });

  if (errors.length > 0) {
    return {
      error: true,
      statusCode: 400,
      data: errors,
    };
  }
  await albumModel.reorderAlbum(currentPosition, newPosition);
  return {
    statusCode: 200,
    data: {},
  };
};

// Reorder an album
module.exports.reorderAlbum = async (albumData) => {
  const errors = [];
  if (!albumData.id) errors.push({ id: "Required." });

  if (!albumData.displayPosition) errors.push({ displayPosition: "Required." });

  if (errors.length > 0) {
    return {
      error: true,
      statusCode: 400,
      data: errors,
    };
  }

  let result = await this.findById(albumData.id);
  if (result.error) return result;

  result = await this.reorderAlbums(
    result.data.displayPosition,
    albumData.displayPosition
  );
  if (result.error) return result;

  return {
    statusCode: 200,
    data: albumData,
  };
};

module.exports.getPhotosById = async (id) => {
  let errors = [];
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
  let album = await albumModel.findById(id);
  if (!album.exists) {
    return {
      error: true,
      statusCode: 400,
      data: `Alubm with id : ${id} doesn't exists.`,
    };
  }
  const photos = await albumPhotosService.findAll(id);
  return photos;
};
