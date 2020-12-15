const functions = require("firebase-functions");
const express = require("express");
const bodyParser = require("body-parser");
const db = require('./dbConnection');

const albumsRouter = require("./routes/album.route");
const photosRouter = require("./routes/photo.route");

const main = express();

async function init(){
    let albumsQuerySnapshot = await db.collection('albums').get();
    db.collection('config').doc('albumCount').set({count : albumsQuerySnapshot.size});
}
init();

main.use(bodyParser.json());
main.use("/api/v1", albumsRouter);
main.use("/api/v1",photosRouter);

const webApi = functions.https.onRequest(main);
exports.webApi = webApi;
