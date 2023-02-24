const jwt = require("jsonwebtoken");

const tokenData = require("../../config/authConfig");

const accessTokenSecret = tokenData.secret;
const authenticateJWT = (req, res, next) => {
	const jwtToken = req.headers["auth-token"];

	if (jwtToken) {
		jwt.verify(jwtToken, accessTokenSecret, (err, user) => {
			if (err) {
				return res.sendStatus(403);
			}

			next();
		});
	} else {
		res.status(401).send({
			message: "Unauthorized",
		});
	}
};
exports.authenticateJWT = authenticateJWT;
