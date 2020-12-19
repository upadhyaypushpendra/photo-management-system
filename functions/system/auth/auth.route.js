const { Router } = require("express");
const authService = require("./auth.service");
const {
  failureResponse,
  successResponse,
} = require("./../../utils/response.util");

const VerifyToken = require("./verifyToken");

const router = Router();

router.get("/refreshToken",VerifyToken,async (req,res)=>{
  try {
    const result = await authService.refreshToken(req.userId);
    if (result.error)
      failureResponse(
        result.statusCode,
        "Unable to refresh token.",
        result.data,
        res
      );
    else
      successResponse(
        result.statusCode,
        "Token refreshed successfully.",
        result.data,
        res
      );
  } catch (error) {
    failureResponse(
      500,
      "There was a problem in refreshing token.",
      error.message,
      res
    );
  }
});

router.post("/register", async (req, res) => {
  try {
    const result = await authService.register(req.body);
    if (result.error)
      failureResponse(
        result.statusCode,
        "There was a problem in registering the user.",
        result.data,
        res
      );
    else
      successResponse(
        result.statusCode,
        "User registered successfully.",
        result.data,
        res
      );
  } catch (error) {
    failureResponse(
      500,
      "There was a problem in registering the user.",
      error.message,
      res
    );
  }
});

router.get("/me", VerifyToken, async (req, res) => {
  try {
    let result = await authService.me(req.userId);
    if (result.error)
      failureResponse(
        result.statusCode,
        "Failed to get user.",
        result.data,
        res
      );
    else
      successResponse(
        result.statusCode,
        "Fetched User Successfully",
        result.data,
        res
      );
  } catch (error) {
    failureResponse(500, error.message, null, res);
  }
});

router.post("/login", async (req, res) => {
  try {
    let user = { email: req.body.email, password: req.body.password };
    let result = await authService.login(user);
    if (result.error)
      failureResponse(result.statusCode, "Login failed.", result.data, res);
    else
      successResponse(
        result.statusCode,
        "Logged in Successfully",
        result.data,
        res
      );
  } catch (error) {
    failureResponse(500, error.message, null, res);
  }
});

router.post("/logout", async (req, res) => {
  successResponse(
    200,
    "Logged out successfully.",
    { auth: false, apiToken: null, refreshToken: null },
    res
  );
});

module.exports = router;
