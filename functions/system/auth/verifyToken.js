const jwt = require("jsonwebtoken");
const { failureResponse } = require("./../../utils/response.util");
const dotenv = require('dotenv');
const { decode } = require("firebase-functions/lib/providers/https");
dotenv.config();

function verifyToken(req, res, next) {
  let token = req.headers["x-access-token"];
  if (!token) {
    return failureResponse(403, "No token provided.", { auth: false }, res);
  }
  try {
    let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userId = decoded.id;
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