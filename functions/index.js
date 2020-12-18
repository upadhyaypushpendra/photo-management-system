const functions = require("firebase-functions");
const express = require("express");
const bodyParser = require("body-parser");

const albumsRouter = require("./routes/album.route");
const photosRouter = require("./routes/photo.route");
const authRouter = require("./system/auth/auth.route");


const main = express();

main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));

main.use("/api/v1/auth",authRouter)
main.use("/api/v1/albums", albumsRouter);
main.use("/api/v1/photos",photosRouter);

const webApi = functions.https.onRequest(main);
exports.webApi = webApi;
