const userModel = require("./../models/user.model");

module.exports.findAll = async () => {
  const users = await userModel.find();
  return {
    statusCode: 200,
    data: users,
  };
};

module.exports.find = async (filters) => {
  const users = await userModel.find(filters);
  return {
    statusCode: 200,
    data: users,
  };
};
module.exports.findByEmail = async (email) => {
  const errors = [];
  if (!email) {
    errors.push({ email: "Required." });
  }
  if (errors.length > 0) {
    return {
      error: true,
      statusCode: 400,
      data: errors,
    };
  }

  const user = await userModel.findByEmail(email);
  return user
    ? {
        statusCode: 200,
        data: user,
      }
    : {
        error: true,
        statusCode: 404,
        data: `User with email : ${email} doesn't exists.`,
      };
};

module.exports.findById = async (userId) => {
  const errors = [];
  if (!userId) {
    errors.push({ id: "Required." });
  }
  if (errors.length > 0) {
    return {
      error: true,
      statusCode: 400,
      data: errors,
    };
  }

  const user = await userModel.findById(userId);
  if (user.exists) {
    return {
      statusCode: 200,
      data: { id: user.id, ...user.data() },
    };
  } else {
    return {
      error: true,
      statusCode: 404,
      data: `User with ID : ${userId} doesn't exists.`,
    };
  }
};

module.exports.create = async (user) => {
  const { name, email, password } = user;

  const errors = [];

  // Assuming user name is required.
  if (!name) errors.push({ name: "Required." });
  if (!email) errors.push({ email: "Required." });
  if (!password) errors.push({ password: "Required." });

  if (errors.length > 0) {
    return {
      error: true,
      statusCode: 400,
      data: errors,
    };
  }

  const userData = {
    name,
    email,
    password,
  };

  const createdUser = await userModel.create(userData);
  return {
    statusCode: 201,
    data: createdUser,
  };
};

module.exports.update = async (id, userData) => {
  let errors = [];
  if (!id) {
    errors.push({ id: "Required" });
  }
  if (errors.length > 0) {
    return {
      error: true,
      statusCode: 400,
      data: errors,
    };
  }
  const { name, email, password } = userData;

  const data = {};
  if (name) data.name = name;
  if (email) data.email = email;
  if (password) data.password = password;

  const result = await this.findById(id);
  if (result.error) return result;

  const updatedUser = await userModel.update(id, data);
  return {
    statusCode: 200,
    data: updatedUser,
  };
};

module.exports.delete = async (id) => {
  const errors = [];
  if (id) {
    errors.push({ id: "Required." });
  }
  if (errors.length > 0) {
    return {
      error: true,
      statusCode: 400,
      data: errors,
    };
  }
  const result = await this.findById(id);
  if (result.error) {
    return result;
  }
  // delete user
  await userModel.delete(id);
  return {
    statusCode: 200,
    data: `User with ID : ${id} deleted.`,
  };
};
