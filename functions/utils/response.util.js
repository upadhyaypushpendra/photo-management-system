const response_status_codes = {
    success : 200,
    bad_request : 400,
    internal_server_error : 500,
    not_found : 404
};

module.exports.successResponse = function (message, data, res) {
  res.status(response_status_codes.success).json({
    STATUS: "SUCCESS",
    MESSAGE: message,
    data,
  });
};

module.exports.notFoundResponse = function(message,res){
  res.status(response_status_codes.not_found).json({
    STATUS : "FAILURE",
    MESSAGE : message,
    data : {}
  });
};
module.exports.failureResponse = function (message, data, res) {
  res.status(response_status_codes.internal_server_error).json({
    STATUS: "FAILURE",
    MESSAGE: message,
    data,
  });
};

module.exports.insufficientParameters = function (data,res) {
  res.status(response_status_codes.bad_request).json({
    STATUS: "FAILURE",
    MESSAGE: "Insufficient parameters",
    data: data,
  });
};

module.exports.mongoError = function (err, res) {
  res.status(response_status_codes.internal_server_error).json({
    STATUS: "FAILURE",
    MESSAGE: "MongoDB error",
    data: err,
  });
}
