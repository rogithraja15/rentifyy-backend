import mongoose from "mongoose";
import Joi from "joi";

const validAmenities = [
  "parking",
  "ac",
  "wifi",
  "refrigerator",
  "almirah",
  "bedsheet",
  "cctv",
  "housekeeping",
  "pillow",
  "drinkingwater",
  "bathroom",
  "wash",
];

const propertyType = ["Family", "Bachelor", "Company"];

const propertySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  propertyType: {
    type: String,
    required: true,
    enum: propertyType,
  },
  location: {
    type: Array,
    required: true,
  },

  amenities: {
    type: Array,
    validate: {
      validator: function (value) {
        return value.every((item) => validAmenities.includes(item));
      },
      message: (props) => `${props.value} is not a valid Amenities Type`,
    },
  },
  rent: {
    type: Number,
    min: 1000,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  image: {
    type: Array,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  numberOfBedrooms: {
    type: Number,
    required: true,
    min: 1,
  },
  numberOfBathrooms: {
    type: Number,
    required: true,
    min: 1,
  },
  nearbyHospitals: {
    type: Array,
    required: true,
    min: 1,
    items: String,
  },
  nearbyColleges: {
    type: Array,
    required: true,
    min: 1,
    items: String,
  },
  likes: {
    type: Number,
    default: 0,
  },
});

const Property = mongoose.model("Property", propertySchema);

function validateProperty(property) {
  const schema = Joi.object({
    propertyType: Joi.string()
      .required()
      .valid(...propertyType),
    location: Joi.array()
      .required()
      .min(1)
      .items(Joi.string().min(2).required()),

    amenities: Joi.array()
      .min(1)
      .items(
        Joi.string()
          .valid(...validAmenities)
          .required()
      ),
    rent: Joi.number().min(1000).required(),
    address: Joi.string().min(20).required(),
    image: Joi.array().required().items(Joi.string().uri().required()),
    numberOfBedrooms: Joi.number().required().min(1),
    numberOfBathrooms: Joi.number().required().min(1),
    nearbyHospitals: Joi.array()
      .required()
      .min(1)
      .items(Joi.string().required()),
    nearbyColleges: Joi.array()
      .required()
      .min(1)
      .items(Joi.string().required()),
  });
  return schema.validate(property);
}

function validatePropertyUpdate(property) {
  const schema = Joi.object({
    propertyType: Joi.string()
      .valid(...propertyType)
      .optional(),
    location: Joi.array()
      .min(1)
      .items(Joi.string().min(2).required())
      .optional(),
    amenities: Joi.array()
      .min(1)
      .items(
        Joi.string()
          .valid(...validAmenities)
          .required()
      )
      .optional(),
    rent: Joi.number().min(1000).optional(),
    address: Joi.string().min(20).optional(),
    image: Joi.array().items(Joi.string().uri().required()).optional(),
    numberOfBedrooms: Joi.number().min(1).optional(),
    numberOfBathrooms: Joi.number().min(1).optional(),
    nearbyHospitals: Joi.array()
      .min(1)
      .items(Joi.string().required())
      .optional(),
    nearbyColleges: Joi.array()
      .min(1)
      .items(Joi.string().required())
      .optional(),
  });
  return schema.validate(property);
}

export { Property, validateProperty, validatePropertyUpdate };
