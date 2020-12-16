const albumModel = require("./../models/album.model");

const albumCountService = require("./albumCount.service");
const photoService = require("./photo.service");
const albumPhotosService = require("./albumPhotos.service");

module.exports.findAll = async (callback) => {
  const albums = await albumModel.findAll();
  callback(null, albums);
};

module.exports.findById = async (albumId, callback) => { 
  const errors = [];
  if (!albumId) {
    errors.push({ id: "Required." });
  }
  if (errors.length > 0) {
    callback(errors, null);
    return;
  }

  const album = await albumModel.findById(albumId);
  if (album) {
    callback(null, { id: album.id, ...album.data() });
  } else {
    callback(`Album with ID : ${albumId} doesn't exists.`, null);
  }
};

module.exports.create = async (album, callback) => {
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
    callback(errors, null);
    return;
  }

  let albumCount = await albumCountService.getCount();
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

  await albumCountService.setCount(albumCount + 1);

  callback(null, createdAlbum);
};

module.exports.update = async (albumId, albumData, callback) => {
  let errors = [];
  if (!albumId) {
    errors.push({ id: "Required" });
  }
  if (errors.length > 0) {
    callback(errors, null);
    return;
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
    callback(null, updatedAlbum);
  } else {
    callback(`Album with ID : ${albumId} doesn't exists.`, null);
  }
};

module.exports.delete = async (id, callback) => {
  const errors = [];
  const albumId = req.params.id;
  if (albumId) {
    errors.push({ id: "Required." });
  }
  const album = await albumModel.findById(albumId);
  if (!album.exists) {
    errors.push({ id: `Album with ID : ${albumId} doesn't exists.` });
    return;
  }
  if (errors.length > 0) {
    callback(errors, null);
    return;
  }

  // delete this albumId from all the photos
  const photoFilter = {
    field: "albums",
    operator: "array-contains",
    value: albumId,
  };
  let photos = null;
  photoService.filter(photoFilter, (error, result) => {
    if (!error) photos = result;
  });
  if (photos) {
    photos.forEach(async (doc) => {
      // remove albumId from photo
      photoService.update(
        photo.id,
        { albums: photo.data().albums.filter((id) => id !== albumId) },
        (err, result) => {}
      );
    });
  }

  // delete album
  await albumModel.delete(albumId);

  //reorder albums
  let currentAlbumPosition = album.data().displayPosition;
  let totalAlbums = await albumCountService.getCount();
  await albumModel.reorderAlbums(currentAlbumPosition, totalAlbums);
  callback(null, `Album with ID : ${albumId} deleted.`);
};

// Reorder albums
module.exports.reorderAlbums = async (albumData, callback) => {
  const errors = [];
  if (!albumData.albumId) errors.push({ albumId: "albumId Required." });

  if (!albumData.displayPosition)
    errors.push({ displayPosition: "displayPostion Required." });

  if (errors.length > 0) {
    callback(errors, null);
    return;
  }

  let album = albumModel.findById(albumData.albumId);
  if (!album.exists) {
    callback(`Album with ID ${albumId} doesn't exists.`, null);
    return;
  }

  await albumModel.reorderAlbums(displayPosition, album.data().displayPosition);
  callback(null, album);
};

module.exports.getPhotosById = async (albumId,callback)=>{ 
  let errors = [];
  if(!albumId) {
    errors.push({id : "Required"});
  }
  let album = await albumModel.findById(albumId);
  if(!album.exists) {
    errors.push({id : `Alubm with id : ${albumId} doesn't exists.`});
  }
  if(errors.length > 0) {
    callback(errors,null);
    return;
  }
  await albumPhotosService.findAll(albumId,(error,result)=>{
        if(error) callback(error,null);
        else callback(null,result);
  });
 };