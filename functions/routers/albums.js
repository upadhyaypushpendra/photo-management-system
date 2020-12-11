const Router = require("express").Router;
const { createResponse } = require("../utils/responseUtil");
const db = require("./../dbConnection");

const router = Router();

const albumsCollectionRef = db.collection("albums");
const albumCountDocRef = db.collection("config").doc('albumCount');

// function to reorder albums between 2 positions
function reorderAlbums(position1,position2){
  let startPosition, endPosition;
  if(position1 === position2) return;
  else if (position1 < position2) {
    startPosition = position1;
    endPosition = position2;
  } else {
    endPosition = position1;
    startPosition = position2;
  }
  let albumQuerySnapshot = await albumsCollectionRef.where('displayPosition','<=',startPosition).where('displayPosition','>=',endPosition).orderBy('displayPosition').get();
  let displayPosition = startPosition;
  albumQuerySnapshot.forEach(doc => {
    await albumsCollectionRef.doc(doc.id).update({displayPosition : displayPosition},{merge : true});
    displayPosition++;
  });
  
};

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
      reorderAlbums(displayPosition,album.data().displayPosition);
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
    let position = album.data().displayPosition;
    let totalAlbums = (await albumCountDocRef.get()).data().count;
    
    await albumRef.delete();
    reorderAlbums(position,totalAlbums);    
    
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

    reorderAlbums(displayPosition,album.data().displayPosition);

  } catch (error) {
    res.status(500).json(createResponse(false, error.message));
    return;
  }
});


module.exports = router;
