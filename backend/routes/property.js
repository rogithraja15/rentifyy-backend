import {
  Property,
  validateProperty,
  validatePropertyUpdate,
} from "../models/property.js";
import express from "express";
import { auth } from "../middleware/auth.js";
import { User } from "../models/user.js";
import Interested from "../models/intrestModel.js";
import Like from "../models/likesModel.js";
import nodemailer from "nodemailer";
import { formatError, formatResponse } from "../utils/response.js";

const propertyRouter = express.Router();

//get all property list
propertyRouter.get("/getProperty", async (req, res) => {
  try {
    const properties = await Property.find({});
    res.json(formatResponse(properties));
  } catch (err) {
    console.error(err);
    res.status(500).json(formatError("Internal Server Error"));
  }
});

//filters for property
propertyRouter.post("/filters", async (req, res) => {
  try {
    const filters = req.body;
    const query = {};

    if (filters.location) {
      if (Array.isArray(filters.location)) {
        query.location = { $in: filters.location };
      } else {
        console.error("Location is not an array:", filters.location);
      }
    }

    if (filters.propertyType) {
      query.propertyType = filters.propertyType;
    }

    if (filters.amenities) {
      query.amenities = { $all: filters.amenities };
    }

    if (filters.minRent) {
      query.rent = { $gte: parseInt(filters.minRent) };
    }
    if (filters.maxRent) {
      query.rent = { ...query.rent, $lte: parseInt(filters.maxRent) };
    }

    if (filters.numberOfBedrooms) {
      query.numberOfBedrooms = parseInt(filters.numberOfBedrooms);
    }

    if (filters.numberOfBathrooms) {
      query.numberOfBathrooms = parseInt(filters.numberOfBathrooms);
    }

    const properties = await Property.find(query);
    res.json(formatResponse(properties));
  } catch (err) {
    console.error(err);
    res.status(500).json(formatError("Internal Server Error"));
  }
});

// Show Property details
propertyRouter.get("/property/:propertyid", async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyid);

    if (!property) {
      return res.status(404).json(formatError("Property not found"));
    }
    res.json(formatResponse(property));
  } catch (err) {
    console.error(err);
    res.status(500).json(formatError("Internal Server Error"));
  }
});

// Update likes count for a property (like/unlike)
propertyRouter.post("/property/like/:propertyid", auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyid);

    if (!property) {
      return res.status(404).json(formatError("Property not found"));
    }

    const existingLike = await Like.findOne({
      propertyId: req.params.propertyid,
      userId: req.user,
    });

    if (existingLike) {
      property.likes -= 1;
      await property.save();

      await Like.findOneAndDelete({
        propertyId: req.params.propertyid,
        userId: req.user,
      });

      return res
        .status(200)
        .json(formatResponse(property.likes, "Property unliked successfully"));
    }

    property.likes += 1;
    await property.save();

    const like = new Like({
      propertyId: req.params.propertyid,
      userId: req.user,
    });
    await like.save();

    res
      .status(200)
      .json(formatResponse(property.likes, "Property liked successfully"));
  } catch (err) {
    console.error(err);
    res.status(500).json(formatError("Internal Server Error"));
  }
});

export { propertyRouter };
