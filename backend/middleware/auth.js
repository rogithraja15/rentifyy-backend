import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { formatError } from "../utils/response.js";

const auth = async (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token)
      return res.status(401).json(formatError("No auth token, access denied"));

    const verified = jwt.verify(token, "passwordKey");
    if (!verified)
      return res
        .status(401)
        .json(formatError("Token verification failed, authorization denied."));
    const userDetail = await User.findById(verified.id);
    if (!userDetail) return res.status(404).json(formatError("User Not Found"));

    req.user = userDetail.id;
    req.token = token;
    req.userType = userDetail.tag;

    next();
  } catch (err) {
    res.status(500).json(formatError(err.message));
  }
};

export { auth };
