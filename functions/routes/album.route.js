const { Router } = require("express");
const { successResponse, failureResponse } = require("../utils/response.util");
const { createResponse } = require("../utils/util");
const albumService = require("./../services/album.service");

const router = Router();
// Get all albums
router.get("/albums", async (req, res) => {
  try {
    albumService.findAll((error, result) => {
      if (error) failureResponse("Unable to fetch albums.", null, res);
      else successResponse("Albums fetched.", result, res);
    });
  } catch (error) {
    failureResponse(error.message, null, res);
  }
});

// Get Album by ID
router.get("/albums/:id", async (req, res) => {
  try {
    albumService.findById(req.params.id, (error, result) => {
      if (error) failureResponse("Unable to fetch album.", error, res);
      else successResponse("Album fetched.", result, res);
    });
  } catch (error) {
    failureResponse(error.message, null, res);
  }
});

// Create an album
router.post("/albums", async (req, res) => {
  try {
    albumService.create(req.body, (error, result) => {
      if (error) failureResponse("Unable to fetch album.", error, res);
      else successResponse("Album created successfully.", result, res);
    });
  } catch (error) {
    failureResponse(error.message, null, res);
  }
});

// Update an album by id
router.patch("/albums/:id", async (req, res) => {
  try {
    albumService.update(req.params.id, req.body, (error, result) => {
      if (error) failureResponse("Unable to update album.", error, res);
      else successResponse("Album updated successfully.", result, res);
    });
  } catch (error) {
    failureResponse(error.message, null, res);
  }
});

// Delete an album by id
router.delete("/albums/:id", async (req, res) => {
  try {
    albumService.delete(req.params.id, (error, result) => {
      if (error) failureResponse("Unable to delete album.", error, res);
      else successResponse("Album deleted successfully.", result, res);
    });
  } catch (error) {
    failureResponse(error.message, null, res);
  }
});

// Reorder albums
router.post("/albums/reorder", async (req, res) => {
  try {
    albumService.reorder(req.body, (error, result) => {
      if (error) failureResponse("Unable to reorder albums.", error, res);
      else successResponse("Albums reorderd successfully.", result, res);
    });
  } catch (error) {
    failureResponse(error.message, null, res);
  }
});

// Get all photos of an album by id
router.get("/albums/:id/photos",async (req,res)=>{
  try {
    albumService.getPhotosById(req.params.id,(error,result)=>{
      if(error) failureResponse(`Unable to fetch photos for album.`,error,res);
      else successResponse(`Fetched album's photos successfully.`,result,res);
    });
  } catch(error){
    failureResponse(error.message,null,res);
  }
})

module.exports = router;
