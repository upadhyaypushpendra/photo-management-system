const Router = require("express").Router;
const { createResponse,deleteCollection } = require("../utils/util");
const db = require("./../dbConnection");

const router = Router();

const albumsCollectionRef = db.collection("albums");
const phtoossCollectionRef = db.collection("photos");
const albumCountDocRef = db.collection("config").doc('albumCount');
const BATCH_SIZE = 25;

// Get all albums
router.get("/albums", async (req, res) => {
  try {
    const albumQuerySnapshot = await albumsCollectionRef.get();
    const albums = [];
    albumQuerySnapshot.forEach((doc) => {
      albums.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    res.json(createResponse(true, albums));
  } catch (error) {
    res.status(500).json(createResponse(false, error.message));
  }
});

// Get Album by ID
router.get("/albums/:id", async (req, res) => {
  try {
    const albumId = req.params.id;

    if (!albumId) {
      res.status(400).json(createResponse(false, `albumId is required.`));
      return;
    }

    const albumRef = albumsCollectionRef.doc(albumId);

    const album = await albumRef.get();

    if (!album.exists) {
      res
        .status(404)
        .json(
          createResponse(false, `Album with ID : ${albumId} doesn't exists.`)
        );
      return;
    }

    res.json({
      id: album.id,
      ...album.data(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create an album
router.post("/albums", async (req, res) => {
  try {
    const {
      name,
      description,
      coverImageURL,
      isActive,
    } = req.body;

    const errors = [];

    // Assuming album name is required.
    if (!name) errors.push({ name: "name Required." });

    if (!description) {
      // Adding empty string as default description.
      description = "";
    }
    if (!coverImageURL) {
      // add some default cover image
      // assuming default URL to :  https://kutuki/images/albumImage.jpg
      coverImageURL = "https://kutuki/images/albumImage.jpg";
    }

    if (!isActive) {
      // set some default value
      // assuming default to be true
      isActive = true;
    }

    if (errors.length > 0) {
      res.status(400).json(createResponse(false, errors));
      return;
    }

    const albumCount = await albumCountDocRef.get();
    let displayPosition = albumCount.data().count + 1;

    const data = {
      name,
      description,
      coverImageURL,
      displayPosition,
      isActive,
      dateCreated: Date.now(), // Assuming Created time to be added at server side
      dateModified: Date.now(), // Assuming Modified time to be added at server side
    };

    const albumRef = await albumsCollectionRef.add(data);

    const album = await albumRef.get();

    await albumCountDocRef.set({count : albumCount.data().count + 1});

    res.json(
      createResponse(true, {
        id: albumRef.id,
        ...album.data(),
      })
    );
  } catch (error) {
    res.status(500).json(createResponse(false, error.message));
  }
});

// Update an album by id
router.patch("/albums/:id", async (req, res) => {
  try {
    const albumId = req.params.id;

    if (!albumId) {
      res.status(400).json(createResponse(false, `albumId is required.`));
      return;
    }

    const {
      name,
      description,
      coverImageURL,
      displayPosition,
      isActive,
    } = req.body;

    const data = {};
    if (name) data.name = name;
    if (description) data.description = description;
    if (coverImageURL) data.coverImageURL = coverImageURL;
    if (displayPosition) data.displayPosition = displayPosition;
    if (isActive) data.isActive = isActive;

    data.dateModified = Date.now();

    const albumRef = albumsCollectionRef.doc(albumId);

    const album = await albumRef.get();

    if (!album.exists) {
      res
        .status(404)
        .json(
          createResponse(false, `Album with ID : ${albumId} doesn't exists.`)
        );
      return;
    }

    if(displayPosition && album.data().displayPosition !== displayPosition){
      reorderAlbums(albumsCollectionRef,displayPosition,album.data().displayPosition);
    }

    await albumRef.update(data);

    const updatedAlbum = await albumRef.get();

    res.status(200).json(
      createResponse(true, {
        id: albumId,
        ...updatedAlbum.data(),
      })
    );
  } catch (error) {
    res.status(500).json(createResponse(false, error.message));
  }
});

// Delete an album by id
router.delete("/albums/:id", async (req, res) => {
  try {
    const albumId = req.params.id;

    if (!albumId) {
      res.status(400).json(createResponse(false, `Album ID required.`));
      return;
    }

    const albumRef = albumsCollectionRef.doc(albumId);

    let album = await albumRef.get();

    if (!album.exists) {
      res
        .status(404)
        .json(
          createResponse(false, `Album with ID ${albumId} doesn't exists.`)
        );
      return;
    }

    // delete this albumId from all the photos
    let photos = await albumRef.collection('photos').get();
    photos.forEach(doc => {
      // get photo from photos collection
      let photoRef =  phtoossCollectionRef.doc(doc.id);
      let photo = await photoRef.get();

      // remove albumId from photo
      await photoRef.update({albums : photo.data().albums.filter(id=> id !== albumId)},{merge : true});
    });

    // delete photos subcollection from this album
    await deleteCollection(db,`albums/${albumId}/photos`,BATCH_SIZE);

    // delete album
    await albumRef.delete();
    
    // reorder albums after delete
    let position = album.data().displayPosition;
    let totalAlbums = (await albumCountDocRef.get()).data().count;    
    await reorderAlbums(albumsCollectionRef,position,totalAlbums);
    
    res.json(createResponse(true, `Album with ID : ${albumId} deleted.`));

  } catch (error) {
    res.status(500).json(createResponse(false, error.message));
  }
});

// Reorder albums
router.post("/alubms/reorder", async (req, res) => {
  try {
    const { albumId, displayPosition } = req.body;
    const errors = [];
    if (!albumId) errors.push({ albumId: "albumId Required." });

    if (!displayPosition)
      errors.push({ displayPosition: "displayPostion Required." });

    if (errors.length > 0) {
      res.status(400).json(createResponse(false, errors));
      return;
    }

    let albumRef = albumsCollectionRef.doc(albumId);
    let album = await albumRef.get();
    if (!album.exists) {
      res
        .status(400)
        .json(
          createResponse(false, `Album with ID ${albumId} doesn't exists.`)
        );
      return;
    }

    reorderAlbums(albumsCollectionRef,displayPosition,album.data().displayPosition);

  } catch (error) {
    res.status(500).json(createResponse(false, error.message));
    return;
  }
});


module.exports = router;
