import { UnauthenticatedError, UnauthorizedError } from "../errors/index.js";
import { isTokenValid } from "../utils/index.js";

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) {
    return res.status(401).json({ msg: "Authentication Invalid!" });
  }

  try {
    const payload = isTokenValid({ token });
    const { name, userId } = payload.payload;
    req.user = { name, userId };
    next();
  } catch (error) {
    return res.status(401).json({ msg: "Authentication Invalid!" });
  }
};

export default authenticateUser;
