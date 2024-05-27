import mongoose from "mongoose";

const userType = ["Buyer", "Seller"];
const userSchema = new mongoose.Schema({
  tag: {
    type: String,
    required: true,
    enum: userType,
  },
  firstname: {
    required: true,
    type: String,
    trim: true,
  },
  lastname: {
    type: String,
    trim: true,
  },
  phonenumber: {
    required: true,
    type: String,
  },
  email: {
    required: true,
    type: String,
    trim: true,
    validate: {
      validator: (value) => {
        const re =
          /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return value.match(re);
      },
      message: "Please enter a valid email address",
    },
  },
  password: {
    required: true,
    type: String,
  },
});

const User = mongoose.model("User", userSchema);

export { User };
