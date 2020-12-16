const { Router } = require("express");
const photoService = require("./../services/photo.service");

const {
  successResponse,
  failureResponse,
} = require("./../utils/response.util");

const router = Router();
// Get photos
router.get("/photos", async (req, res) => {
  try {
    photoService.findByLastIdAndLimit(
      req.query.last,
      parseInt(req.query.pageSize),
      (error, result) => {
        if (error) failureResponse("Unable to fetch photos.", error, res);
        else successResponse("Photos fetched successfully.", result, res);
      }
    );
  } catch (error) {
    // send error in response
    failureResponse(error.message, null, res);
  }
});

// Get photo by id
router.get("/photos/:id", async (req, res) => {
  try {
    photoService.findById(req.params.id, (error, result) => {
      if (error) failureResponse("Unable to fetch photo.", error, res);
      else successResponse("Photo fetched successfully.", result, res);
    });
  } catch (error) {
    res.failureResponse(error.message, null, res);
  }
});

// Create a photo
router.post("/photos",async (req,res)=>{
  try {
    photoService.create(req.body,(error,result)=>{
      if(error) failureResponse("Unable to add photo",error,res);
      else successResponse("Photo added successfully.",result,res);
    });
  } catch (error){
    res.failureResponse(error.message, null, res);
  }
});

// Update an photo by id
router.patch("/photos/:id",async (req,res)=>{
  try {
    photoService.update(req.params.id,req.body,(error,result)=>{
      if(error) failureResponse("Unable to update photo",error,res);
      else successResponse("Photo updated successfully.",result,res);
    });
  } catch (error){
    res.failureResponse(error.message, null, res);
  }
});

// Delete photo by id
router.delete("/photos/:id",async (req,res)=>{

  try {
    photoService.delete(req.params.id,(error,result)=>{
      if(error) failureResponse("Unable to delete photo",error,res);
      else successResponse("Photo deleted successfully.",result,res);
    });
  } catch (error){
    res.failureResponse(error.message, null, res);
  }
});

module.exports = router;