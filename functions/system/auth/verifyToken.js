const jwt = require("jsonwebtoken");
const httpContext = require("express-http-context");
const { failureResponse } = require("./../../utils/response.util");
const dotenv = require("dotenv");

dotenv.config();

function verifyToken(req, res, next) {
  let token = req.headers["x-access-token"];
  if (!token) {
    return failureResponse(403, "No token provided.", { auth: false }, res);
  }
  try {
    let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    httpContext.set('user', decoded.id);
    next();
  } catch (error) {
    return failureResponse(
      500,
      "Failed to authenticate token.",
      { auth: false },
      res
    );
  }
}

module.exports = verifyToken;
