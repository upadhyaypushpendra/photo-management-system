const functions = require("firebase-functions");
const express = require("express");
const bodyParser = require("body-parser");
const httpContext = require('express-http-context');

const verifyToken = require("./system/auth/verifyToken");
const albumsRouter = require("./routes/album.route");
const photosRouter = require("./routes/photo.route");
const authRouter = require("./system/auth/auth.route");


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(httpContext.middleware);
app.use("/api/v1/auth",authRouter)
app.use(verifyToken);
app.use("/api/v1/albums", albumsRouter);
app.use("/api/v1/photos",photosRouter);

const webApi = functions.https.onRequest(app);
exports.webApi = webApi;
