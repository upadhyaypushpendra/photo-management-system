module.exports.successResponse = function (statusCode = 200,message, data, res) {
  res.status(statusCode).json({
    STATUS: "SUCCESS",
    MESSAGE: message,
    data,
  });
};

module.exports.failureResponse = function (statusCode = 500,message, data, res) {
  res.status(statusCode).json({
    STATUS: "FAILURE",
    MESSAGE: message,
    data,
  });
};
