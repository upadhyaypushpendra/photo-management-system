const { Router } = require("express");
const photoService = require("./../services/photo.service");

const {
  successResponse,
  failureResponse,
} = require("./../utils/response.util");

const router = Router();
// Get photos
router.get("/", async (req, res) => {
  try {
    const result = await photoService.findByLastIdAndLimit(
      req.query.last,
      parseInt(req.query.pageSize)
    );
    if (result.error)
      failureResponse(result.statusCode, "Unable to fetch photos.", result.data, res);
    else
      successResponse(
        result.statusCode,
        "Photos fetched successfully.",
        result.data,
        res
      );
  } catch (error) {
    // send error in response
    failureResponse(500, error.message, null, res);
  }
});

// Get photo by id
router.get("/:id", async (req, res) => {
  try {
    const result = await photoService.findById(req.params.id);
    if (result.error)
      failureResponse(result.statusCode, "Unable to fetch photo.", result.data, res);
    else
      successResponse(
        result.statusCode,
        "Photo fetched successfully.",
        result.data,
        res
      );
  } catch (error) {
    res.failureResponse(500, error.message, null, res);
  }
});

// Create a photo
router.post("/", async (req, res) => {
  try {
    const result = await photoService.create(req.body);
    if (result.error)
      failureResponse(result.statusCode, "Unable to add photo", result.data, res);
    else
      successResponse(
        result.statusCode,
        "Photo added successfully.",
        result.data,
        res
      );
  } catch (error) {
    res.failureResponse(500, error.message, null, res);
  }
});

// Update an photo by id
router.patch("/:id", async (req, res) => {
  try {
    const result = await photoService.update(req.params.id, req.body);
    if (result.error)
      failureResponse(result.statusCode, "Unable to update photo", result.data, res);
    else
      successResponse(
        result.statusCode,
        "Photo updated successfully.",
        result.data,
        res
      );
  } catch (error) {
    res.failureResponse(500, error.message, null, res);
  }
});

// Delete photo by id
router.delete("/:id", async (req, res) => {
  try {
    const result = await photoService.delete(req.params.id);
    if (result.error)
      failureResponse(result.statusCode, "Unable to delete photo", result.data, res);
    else
      successResponse(
        result.statusCode,
        "Photo deleted successfully.",
        result.data,
        res
      );
  } catch (error) {
    res.failureResponse(500, error.message, null, res);
  }
});

module.exports = router;
