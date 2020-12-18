const { Router } = require("express");
const { successResponse, failureResponse } = require("../utils/response.util");
const albumService = require("./../services/album.service");

const router = Router();
// Get all albums
router.get("/", async (req, res) => {
  try {
    const result = await albumService.findAll();
    if (result.error)
      failureResponse(
        result.statusCode,
        "Unable to fetch albums.",
        result.data,
        res
      );
    else
      successResponse(result.statusCode, "Albums fetched.", result.data, res);
  } catch (error) {
    failureResponse(500, error.message, null, res);
  }
});

// Get Album by ID
router.get("/:id", async (req, res) => {
  try {
    const result = await albumService.findById(req.params.id);
    if (result.error)
      failureResponse(
        result.statusCode,
        "Unable to fetch album.",
        result.data,
        res
      );
    else successResponse(result.statusCode, "Album fetched.", result.data, res);
  } catch (error) {
    failureResponse(500, error.message, null, res);
  }
});

// Create an album
router.post("/", async (req, res) => {
  try {
    const result = await albumService.create(req.body);
    if (result.error)
      failureResponse(
        result.statusCode,
        "Unable to create album.",
        result.data,
        res
      );
    else
      successResponse(
        result.statusCode,
        "Album created successfully.",
        result.data,
        res
      );
  } catch (error) {
    failureResponse(500, error.message, null, res);
  }
});

// Update an album by id
router.patch("/:id", async (req, res) => {
  try {
    const result = await albumService.update(req.params.id, req.body);
    if (result.error)
      failureResponse(
        result.statusCode,
        "Unable to update album.",
        result.data,
        res
      );
    else
      successResponse(
        result.statusCode,
        "Album updated successfully.",
        result.data,
        res
      );
  } catch (error) {
    failureResponse(500, error.message, null, res);
  }
});

// Delete an album by id
router.delete("/:id", async (req, res) => {
  try {
    const result = await albumService.delete(req.params.id);
    if (result.error)
      failureResponse(
        result.statusCode,
        "Unable to delete album.",
        result.data,
        res
      );
    else
      successResponse(
        result.statusCode,
        "Album deleted successfully.",
        result.data,
        res
      );
  } catch (error) {
    failureResponse(500, error.message, null, res);
  }
});

// Reorder albums
router.post("/reorder", async (req, res) => {
  try {
    const result = await albumService.reorderAlbum(req.body);
    if (result.error)
      failureResponse(
        result.statusCode,
        "Unable to reorder albums.",
        result.data,
        res
      );
    else
      successResponse(
        result.statusCode,
        "Albums reorderd successfully.",
        result.data,
        res
      );
  } catch (error) {
    failureResponse(500, error.message, null, res);
  }
});

// Get all photos of an album by id
router.get("/:id/photos", async (req, res) => {
  try {
    const result = await albumService.getPhotosById(req.params.id);
    if (result.error)
      failureResponse(
        result.statusCode,
        `Unable to fetch photos for album.`,
        result.data,
        res
      );
    else
      successResponse(
        result.statusCode,
        `Fetched album's photos successfully.`,
        result.data,
        res
      );
  } catch (error) {
    failureResponse(500, error.message, null, res);
  }
});

module.exports = router;
