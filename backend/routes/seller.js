import mongoose from "mongoose";
import {
  Property,
  validateProperty,
  validatePropertyUpdate,
} from "../models/property.js";
import express from "express";
import { auth } from "../middleware/auth.js";
import Interested from "../models/intrestModel.js";
import { formatError, formatResponse } from "../utils/response.js";

const sellerRouter = express.Router();

// create Property with details
sellerRouter.post("/Property", auth, async (req, res) => {
  if (req.userType === "Buyer")
    return res
      .status(401)
      .json(formatError("User is not authorized to perform this action"));

  const { error } = validateProperty(req.body);
  if (error) {
    return res.status(400).json(formatError(error.details[0].message));
  }

  const propertyDetails = new Property({
    propertyType: req.body.propertyType,
    location: req.body.location,
    amenities: req.body.amenities,
    rent: req.body.rent,
    address: req.body.address,
    image: req.body.image,
    userId: req.user,
    numberOfBedrooms: req.body.numberOfBedrooms,
    numberOfBathrooms: req.body.numberOfBathrooms,
    nearbyHospitals: req.body.nearbyHospitals,
    nearbyColleges: req.body.nearbyColleges,
  });

  try {
    await propertyDetails.save();
    res.status(200).json(formatResponse(null, "Property Saved Success"));
  } catch (err) {
    console.error(err);
    res.status(500).json(formatError("Internal Server Error"));
  }
});

// update details of Property
sellerRouter.put("/Property/:propertyid", auth, async (req, res) => {
  if (req.userType === "Buyer")
    return res
      .status(401)
      .json(formatError("User is not authorized to perform this action"));

  const { error } = validatePropertyUpdate(req.body);
  if (error) {
    return res.status(400).json(formatError(error.details[0].message));
  }

  try {
    const property = await Property.findById(req.params.propertyid);
    if (!property) {
      return res.status(404).json(formatError("Property not found"));
    }

    if (property.userId.toString() !== req.user.toString()) {
      return res
        .status(403)
        .json(formatError("User is not authorized to update this Property"));
    }

    Object.assign(property, req.body);

    const updatedProperty = await property.save();
    res
      .status(200)
      .json(formatResponse(updatedProperty, "Property updated Success"));
  } catch (err) {
    console.error(err);
    res.status(500).json(formatError("Internal Server Error"));
  }
});

// delete Property
sellerRouter.delete("/:propertyid", auth, async (req, res) => {
  try {
    if (req.userType === "Buyer")
      return res
        .status(401)
        .json(formatError("User is not authorized to perform this action"));

    const property = await Property.findById(req.params.propertyid);
    if (!property) {
      return res.status(404).json(formatError("Property not found"));
    }

    if (property.userId.toString() !== req.user.toString()) {
      return res
        .status(403)
        .json(formatError("User is not authorized to delete this Property"));
    }

    await Property.findByIdAndDelete(req.params.propertyid);
    res.status(200).json(formatResponse(null, "Property deleted successfully"));
  } catch (error) {
    console.error(error);
    res.status(500).json(formatError("Internal Server Error"));
  }
});

// show intrested customer to seller in seperate page
sellerRouter.get("/interested/customers", auth, async (req, res) => {
  try {
    const interestedCustomers = await Interested.find({ sellerId: req.user })
      .populate("buyerId", "firstname email phonenumber")
      .populate("propertyId", "location rent");

    res.json(formatResponse(interestedCustomers));
  } catch (err) {
    console.error(err);
    res.status(500).json(formatError("Internal Server Error"));
  }
});

// Get all properties for a specific user
sellerRouter.get("/properties/user", auth, async (req, res) => {
  try {
    const userId = req.user;
    const properties = await Property.find({ userId: userId });

    if (properties.length === 0) {
      return res
        .status(404)
        .json(formatError("No properties found for this user"));
    }
    res.status(200).json(formatResponse(properties));
  } catch (err) {
    console.error(err);
    res.status(500).json(formatError("Internal Server Error"));
  }
});

export { sellerRouter };
