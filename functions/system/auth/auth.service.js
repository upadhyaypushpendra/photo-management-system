const userService = require("./../../services/user.service");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

module.exports.register = async (user) => {
  let hashedPassword = bcrypt.hashSync(user.password);
  let userData = {
    name: user.name,
    email: user.email,
    password: hashedPassword,
  };
  const result = await userService.create(userData);
  if (result.error)
    return {
      auth: false,
      ...result,
    };
  let apiToken = jwt.sign({ id: result.data.id }, process.env.JWT_SECRET_KEY, {
    expiresIn: 15 * 60, // expires in 15 minutes
  });
  let refreshToken = jwt.sign({ id: result.data.id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "2h", // expires in 2 hours
  });
  return {
    statusCode: 200,
    data: {
      auth: true,
      apiToken,
      refreshToken,
    },
  };
};

module.exports.refreshToken = async (userId) => {    
  let apiToken = jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: 15*60, // expires in 15 minutes
  });
  let refreshToken = jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: "2h", // expires in 2 hours
  });
  return {
    statusCode: 200,
    data: {
      auth: true,
      apiToken,
      refreshToken,
    },
  };
};

module.exports.me = async (id) => {
  if (!id)
    return {
      error: true,
      statusCode: 400,
      data: [{ id: "Required" }],
    };
  let result = await userService.findById(id);
  if (result.error) return result;
  else
    return {
      statusCode: 200,
      data: {
        id: result.data.id,
        name: result.data.name,
        email: result.data.email,
      },
    };
};
module.exports.login = async (user) => {
  let errors = [];
  if (!user.email) {
    errors.push({ email: "Required." });
  }
  if (!user.password) {
    errors.push({ password: "Required." });
  }
  if (errors.length > 0) {
    return {
      error: true,
      statusCode: 400,
      data: errors,
    };
  }

  let result = await userService.findByEmail(user.email);
  if (result.error) return result;

  let passwordIsValid = bcrypt.compareSync(user.password, result.data.password);
  if (!passwordIsValid)
    return {
      error: true,
      statusCode: 401,
      data: { auth: false, token: null, refreshToken: null },
    };

  let apiToken = jwt.sign({ id: result.data.id }, process.env.JWT_SECRET_KEY, {
    expiresIn: 15 * 60, // expires in 15 minutes
  });
  let refreshToken = jwt.sign({ id: result.data.id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "2h", // expires in 2 hours
  });
  return {
    statusCode: 200,
    data: { auth: true, apiToken, refreshToken },
  };
};
