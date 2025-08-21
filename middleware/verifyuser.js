const jwt = require(`jsonwebtoken`);

const verifyUser = (req, res, rest) => {
    const token = req.header.authorization;
    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
            if (err) res.status(403).json({ message: "Invalid token" })
            req.user = user;
            next();
        })
    }
}

module.exports = verifyUser;