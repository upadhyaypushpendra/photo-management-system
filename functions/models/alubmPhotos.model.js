const db = require("./../dbConnection");

module.exports.findAll = async (albumId) =>{
    return await db.collection('albums').doc(albumId).collection('photos').get();
};

module.exports.addPhoto = async (albumId,photo) =>{
    return await db.collection('albums').doc(albumId).collection('photos').doc(photo.id).set(photo);
};

module.exports.deletePhoto = async (albumId,photoId) =>{
    return await db.collection('albums').doc(albumId).collection('photos').doc(photoId).delete();
};

module.exports.updatePhoto = async (albumId,photoId,photo) =>{
    return await db.collection('albums').doc(albumId).collection('photos').doc(photoId).update(photo,{merge:true});
};