const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI);

(async () => {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await User.create({
    email: "admin@gmail.com",
    password: hashedPassword
  });

  console.log("✅ Admin user created");
  process.exit();
})();
