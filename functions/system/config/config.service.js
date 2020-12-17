const configModel = require("./config.model");

module.exports.getAlbumCount = async function () {
  const count = await configModel.getAlbumCount();
  return {
    statusCode: 200,
    data: count,
  };
};

module.exports.setAlbumCount = async function (count) {
  await configModel.setAlbumCount(count);
  return {
    statusCode: 200,
    data: count,
  };
};
