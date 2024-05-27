import { Property } from "../models/property.js";
import express from "express";
import { auth } from "../middleware/auth.js";
import Interested from "../models/intrestModel.js";
import { formatError, formatResponse } from "../utils/response.js";

const buyerRouter = express.Router();

// Express interest in a Property
buyerRouter.post("/property/interested/:propertyid", auth, async (req, res) => {
  try {
    if (req.userType !== "Buyer") {
      return res
        .status(401)
        .json(formatError("Only buyers can express interest"));
    }

    const property = await Property.findById(req.params.propertyid).populate(
      "userId",
      "firstname email phonenumber"
    );
    if (!property) {
      return res.status(404).json(formatError("Property not found"));
    }

    const existingInterest = await Interested.findOne({
      propertyId: property._id,
      buyerId: req.user,
    });
    if (existingInterest) {
      return res.status(400).json(
        formatResponse(
          {
            sellerDetails: {
              name: property.userId.firstname,
              email: property.userId.email,
              phone: property.userId.phonenumber,
            },
          },
          "Interest already expressed for this property"
        )
      );
    }

    const interested = new Interested({
      propertyId: property._id,
      buyerId: req.user,
      sellerId: property.userId,
    });

    await interested.save();

    res.status(200).json(
      formatResponse(
        {
          sellerDetails: {
            name: property.userId.firstname,
            email: property.userId.email,
            phone: property.userId.phonenumber,
          },
        },
        "Interest expressed successfully"
      )
    );
  } catch (err) {
    console.error(err);
    res.status(500).json(formatError("Internal Server Error"));
  }
});

// show the seller detils in a seperate ui to the customer to keep track of information
buyerRouter.get("/seller/details", auth, async (req, res) => {
  try {
    const interestedProperty = await Interested.findOne({ buyerId: req.user })
      .populate("sellerId", "firstname email phonenumber")
      .populate("propertyId", "location rent");

    if (!interestedProperty) {
      return res
        .status(404)
        .json(formatError("No interested property found for this buyer"));
    }

    res.status(200).json(formatResponse(interestedProperty));
  } catch (err) {
    console.error(err);
    res.status(500).json(formatError("Internal Server Error"));
  }
});

export { buyerRouter };
