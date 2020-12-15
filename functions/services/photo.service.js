const photoModel = require("./../models/photo.model");
const MAX_LIMIT = 30;

module.exports.findById = async function (id,callback) {
  const errors = []
  if(!id){
    errors.push({id : 'Required'});
  }
  if(errors.length > 0){
    callback(errors,null);
    return;
  }
  const photo = await photoModel.findById(id);
  callback(null,photo);
};

module.exports.findByLastIdAndLimit = async function (lastId, limit, callback) {
  let limit = lastId || MAX_LIMIT;
  const photos = [];
  let last = null;
  // Check query contains last
  if (lastId) {
    // Get photo by last parameter
    let last = await photoModel.findById(lastId);
    // Check last exists in collection
    if (!last.exists) {
      callback([{ lastId: "Invalid lastId" }], null);
    }
  }
  // Get all photos after last and limit to limit
  photos = await photoModel.findByLastIdAndLimit(last, limit);
  callback(null, photos);
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
    callback(errors, null);
    return;
  }
  const photos = await photoModel.filter(
    filter.field,
    filter.operator,
    filter.value
  );
  callback(null, photos);
};
 
module.exports.create = async function(photo,callback){
  let { name, description, albums, photoURL, isActive } = photo;

  if (!name) throw new Error("Name is required");
  if(!albums) albums=[];
  if(!isActive) isActive = true;
  if(!description) description="";

  const data = {
    name,
    description,
    albums,
    photoURL,
    isActive,
    dateCreated: Date.now(),
    dateModified: Date.now(),
  };

  const photo = await photoModel.create(data);
  data.id = photo.id;
  albums.forEach(async (albumId) => {
    await albumPhotosService.addPhoto(albumId,data,(error,result)=>{
      if(error) {
        // Error in adding photo to photos subcollection 
      }
    });
  });
  callback(null,data);
};

module.exports.update = async function (id, newPhoto, callback) {
  let errors = [];
  if (!id) errors.push({ id: "id Required." });
  let photo = await photoModel.findById(id);
  if (!photo.exists) {
    errors.push({ id: `Invalid photo id : ${id}` });
  }
  if (errors.length > 0) {
    callback(errors, null);
    return;
  }
  const data = {};

  if (newPhoto.name) data.name = name;
  if (newPhoto.description) data.description = description;
  if (newPhoto.albums) data.albums = albums;
  if (newPhoto.photoURL) data.photoURL = photoURL;
  if (newPhoto.isActive) data.isActive = isActive;
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
      await albumPhotosService.deletePhoto(albumId, id, (error, result) => {
        if (error) {
          // Unable to delete photo, log to the logs
        }
      });
    });
    albumsToUpdate.forEach(async (albumId) => {
      await albumPhotosService.updatePhoto(albumId,id,updatedPhoto.data(), (error, result) => {
        if (error) {
          // Unable to delete photo, log to the logs
        }
      });
    });
    albumsToAdd.forEach(async (albumId) => {
      await albumPhotosService.addPhoto(albumId, {
        id,
        ...updatedPhoto.data(),
      });
    });

  }
  callback(null, updatedPhoto);
};

module.exports.delete = async function(photoId,callback){
  const errors = []
  if(!id){
    errors.push({id : 'Required'});
  }
  const photo = await photoModel.findById(photoId);
  if (!photo.exists) {
    errors.push({ id: `Photo with ID : ${photoId} doesn't exists.` });
    return;
  }
  if (errors.length > 0) {
    callback(errors, null);
    return;
  }  
  photo.data().albums.forEach(albumId=>{
    await albumPhotosService.deletePhoto(albumId,photoid);
  });
  await photoModel.delete(photoId);
  callback(null, `Photo with ID : ${photoId} deleted.`);
};