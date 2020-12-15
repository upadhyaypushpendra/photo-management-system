const albumCountModel = require('./../models/albumCount.model');

module.exports.getCount = async function(){
    return await albumCountModel.getCount();
}

module.exports.setCount = async function(count){
    await albumCountModel.setCount(count);
};