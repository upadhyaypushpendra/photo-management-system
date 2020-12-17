const firebaseManager = require('./../firebase/firebase.manager');

module.exports.getAlbumCount = async function(){
    const albumCount = await firebaseManager.findById('config','albumCount');
    return albumCount.data().count;
}
module.exports.setAlbumCount = async function(count){
    await firebaseManager.updateById('config','albumCount',{count});
};