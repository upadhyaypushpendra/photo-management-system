const db = require('./../../dbConnection');
const configCollectionRef = db.collection("config");

const albumCountDocRef = configCollectionRef.doc('albumCount');

module.exports.getAlbumCount = async function(){
    const albumCount = await albumCountDocRef.get();
    return albumCount.data().count;
}
module.exports.setAlbumCount = async function(count){
    await albumCountDocRef.set({count});
};