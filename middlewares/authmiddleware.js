const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || ( req.cookies && req.cookies.token) ;
  if (!authHeader) {
    return res.status(401).json({ message: "No token" });
  }

let token = authHeader;

  if(authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1]
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
