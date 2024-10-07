const jwt = require("jsonwebtoken");

const authToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "No Token, Unauthorized!!" });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedToken.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token is not valid!!" });
  }
};

module.exports = authToken;
