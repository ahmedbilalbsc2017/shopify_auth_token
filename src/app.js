require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const chalk = require("chalk");

const app = express();

var allowedOrigins = ["http://localhost:3000", "http://localhost:5000"];

app.use(
	cors({
		credentials: true,
		origin: function (origin, callback) {
			// allow requests with no origin
			// (like mobile apps or curl requests)
			if (!origin) return callback(null, true);
			if (allowedOrigins.indexOf(origin) === -1) {
				var msg =
					"The CORS policy for this site does not " +
					"allow access from the specified Origin.";
				return callback(new Error(chalk.red(msg)), false);
			}
			return callback(null, true);
		},
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

app.use(helmet());

// simple route
app.get("/", (req, res) => {
	res.send("Welcome to BIZ-PROTECTION");
});

/* Routes */

const SHOPIFY_AUTH = require("./routes/shopify_auth.route");

app.use("/auth", SHOPIFY_AUTH);

module.exports = app;
