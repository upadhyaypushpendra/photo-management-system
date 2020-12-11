const Router = require("express").Router;
const db = require("./../dbConnection");
const createResponse = require("./../utils/responseUtil").createResponse;

const router = Router();
const PAGE_SIZE = 30;

const photosCollectionRef = db.collection("photos");
const albumsCollectionRef = db.collection("albums");

// get all photos
router.get("/photos", async (req, res) => {
  try {
    let pageSize = parseInt(req.query.pageSize) || PAGE_SIZE;
    const photos = [];
    // Check query contains last
    if (req.query.last) {
      // Get photo by last parameter
      let last = await photosCollectionRef.doc(req.query.last).get();

      // Check last exists in collection
      if (!last.exists) throw new Error("Invalid last element id");

      // Get all photos after last and limit to pageSize
      let photoQuerySnapshot = await photosCollectionRef
        .orderBy("dateModified")
        .startAfter(last)
        .limit(pageSize)
        .get();

      photoQuerySnapshot.forEach((doc) => {
        photos.push({
          id: doc.id,
          ...doc.data(),
        });
      });
    } else {
      const photoQuerySnapshot = await photosCollectionRef
        .orderBy("dateModified")
        .limit(pageSize)
        .get();

      photoQuerySnapshot.forEach((doc) => {
        photos.push({
          id: doc.id,
          ...doc.data(),
        });
      });
    }

    // send photos in response
    res.json(createResponse(true, photos));

  } catch (error) {
    // send error in response
    res.status(500).json(createResponse(false, error.message));
  }
});

// get photo by id
router.get("/photos/:id", async (req, res) => {
  try {
    const photoId = req.params.id;

    if (!photoId) throw new Error("photo ID is required");

    const photo = await photosCollectionRef.doc(photoId).get();

    if (!photo.exists) {
      throw new Error("photo doesn't exist.");
    }

    // send photo in response
    res.json(
      createResponse(true, {
        id: photo.id,
        ...photo.data(),
      })
    );
  } catch (error) {
    // send error in response
    res.status(500).json(createResponse(false, error.message));
  }
});

//get a photo by id
router.get("/photos/:id", async (req, res) => {
  try {
    const photoId = req.params.id;

    if (!photoId) {
      res.status(400).json(createResponse(false,`photo ID is required.`));
      return;
    }

    const photoRef = photosCollectionRef.doc(photoId);

    const photo = await photoRef.get();

    if (!photo.exists) {
      res.status(404).json(createResponse(false,`Not found.`));
      return;
    }

    res.json({
      id: photo.id,
      ...photo.data(),
    });
  } catch (error) {
    // send error in response
    res.status(500).json(createResponse(false, error.message));
  }
});

// add a photo
router.post("/photos", async (req, res) => {
  try {
    const { name, description, albums, photoURL, isActive } = req.body;
    
    if (!name) throw new Error("Name is required");

    const data = {
      name,
      description,
      albums,
      photoURL,
      isActive,
      dateCreated: Date.now(),
      dateModified: Date.now(),
    };

    const photoRef = await photosCollectionRef.add(data);
    const photo = await photoRef.get();

    albums.forEach(async (albumId) => {
      const albumRef = albumsCollectionRef.doc(albumId);
      const res = await albumRef
        .collection("photos")
        .doc(photo.id)
        .set({ ...photo.data() });
    });

    res.json(createResponse(true,{ id: photoRef.id, ...photo.data() }));

  } catch (error) {
    // send error in response
    res.status(500).json(createResponse(false, error.message));
  }
});

// Update an photo by id
router.patch("/photos/:id", async (req, res) => {
  try {
    const photoId = req.params.id;
    if (!photoId) throw new Error("id is required.");

    const { name, description, albums, photoURL, isActive } = req.body;

    const data = {};

    if (name) data.name = name;
    if (description) data.description = description;
    if (albums) data.albums = albums;
    if (photoURL) data.photoURL = photoURL;
    if (isActive) data.isActive = isActive;

    data.dateModified = Date.now();

    const photoRef = await photosCollectionRef.doc(photoId);
    const photo = await photoRef.get();

    if (!photo.exists) {
      res.status(404).json(createResponse(false,`Not found.`));
      return;
    }

    if (albums) {
      const currentAlbums = photo.data().albums;

      const albumsToDelete = currentAlbums.filter(
        (currentAlbum) => !(currentAlbum in albums)
      );
      const albumsToAdd = albums.filter((album) => !(album in currentAlbums));

      albumsToDelete.forEach(async (albumId) => {
        const albumRef = albumsCollectionRef.doc(albumId);
        const res = await albumRef.collection("photos").doc(photo.id).delete();
      });

      albumsToAdd.forEach(async (albumId) => {
        const albumRef = albumsCollectionRef.doc(albumId);
        const result = await albumRef
          .collection("photos")
          .doc(photo.id)
          .set({ ...photo.data() });
      });
    }

    await photoRef.update(data, { merge: true });

    const newPhoto = await photoRef.get();

    res.json(createResponse(true, { id: photoId, ...newPhoto.data() }));

  } catch (error) {
    // send error in response
    res.status(500).json(createResponse(false, error.message));
  }
});

// Delete photo by id
router.delete("/photos/:id", async (req, res) => {
  try {
    const photoId = req.params.id;

    if (!photoId) throw new Error("ID is required");

    const photoRef = photosCollectionRef.doc(photoId);

    let photo = await photoRef.get();

    if (!photo.exists) {
      res.status(404).json(createResponse(false,`Not found.`));
      return;
    }

    const albums = photo.data().albums;
    albums.forEach(async (albumId) => {
      await albumsCollectionRef
        .doc(albumId)
        .collection("photos")
        .doc(photoId)
        .delete();
    });
    await photoRef.delete();

    // send success response
    res.json(
      createResponse(true, {
        message: `Photo with ID : ${photoId} deleted successfully.`,
      })
    );
  } catch (error) {
    // send error in response
    res.status(500).json(createResponse(false, error.message));
  }
});

module.exports = router;
