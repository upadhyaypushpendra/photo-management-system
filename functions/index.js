const functions = require("firebase-functions");
const express = require("express");
const bodyParser = require("body-parser");
const db = require('./dbConnection');

const albumsRouter = require("./routers/albums");
const photosRouter = require("./routers/photos");
const { initializeApp } = require("firebase-admin");

const main = express();

async function init(){
    let albumsQuerySnapshot = await db.collection('albums').get();
    db.collection('config').doc('albumCount').set({count : albumsQuerySnapshot.size});
}
await init();

main.use(bodyParser.json());
main.use("/api/v1", albumsRouter);
main.use("/api/v1",photosRouter);

const webApi = functions.https.onRequest(main);
exports.webApi = webApi;
