require("dotenv").config();
const crypto = require("crypto");
const querystring = require("querystring");
const axios = require("axios");
const Shopify = require("shopify-api-node");

const db = require("../models/index");
const chalk = require("chalk");

exports.authTokenReq = async (req, res) => {
	try {
		const scopes = [
			"read_themes",
			"write_themes",
			// "read_users",
			"read_orders",
			"write_orders",
			// "read_all_orders",
		];
		const SHOP = req.query.shop
			? req.query.shop
			: `${process.env.SHOPIFY_APP_NAME}`;
		console.log("Shop", req.query.shop);

		const foundToken = await db.Shopify_Auth.findAll({ raw: true });
		console.log("DB Token founded: ", foundToken);
		if (SHOP) {
			// const state = nonce();
			// console.log("NGROK: ", process.env.BASAE_NGROK_URL);
			//redirect
			const redirect_url = `${process.env.BASAE_NGROK_URL}/auth/callback`;
			// console.log(chalk.bgCyanBright("redirect_URI"), redirect_url);
			//installing url
			const shopify_url = `https://${SHOP}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${scopes}&redirect_uri=${redirect_url}`;

			// res.cookie("state", state);

			return res.redirect(shopify_url);
		} else {
			return res.status(400).send("Missing “Shop Name” parameter!! please add");
		}
	} catch (error) {
		if (error.statusCode === 400) {
			return res.status(400).json({
				message: error.message || "Missing Error!",
			});
		}
		return res.status(500).json({
			message: error.message || "Shopify cannot be accessed!",
		});
	}
};

exports.accessTokenSecret = async (req, res) => {
	try {
		// console.log("callback: ", req.query);
		const { shop, hmac, code, shopState } = req.query;
		let securityPass = false;

		const regex = /^[a-z\d_.-]+[.]myshopify[.]com$/;

		if (shop.match(regex)) {
			console.log("regex is ok");
			securityPass = true;
		} else {
			//exit
			securityPass = false;
		}

		if (securityPass === true && regex && shop && hmac && code) {
			// console.log("shop && hmac && code...1");
			const Map = Object.assign({}, req.query);
			delete Map["hmac"];
			// console.log("shop && hmac && code...1 deleted MAP['hmac']");
			const message = querystring.stringify(Map);
			const generatehmac = crypto
				.createHmac("sha256", process.env.SHOPIFY_API_SECRET)
				.update(message)
				.digest("hex");

			// console.log("generate HMAC", generatehmac);

			if (generatehmac !== hmac) {
				return res.status(403).send("validation failed");
			}

			const accessTokenRequestUrl = `https://${shop}/admin/oauth/access_token`;
			// console.log("shop && hmac && code...2: ", accessTokenRequestUrl);
			const accessTokenPayload = {
				client_id: process.env.SHOPIFY_API_KEY,
				client_secret: process.env.SHOPIFY_API_SECRET,
				code,
			};

			// console.log("shop && hmac && code...3: ", accessTokenPayload);
			const token_get = await axios.post(
				accessTokenRequestUrl,
				accessTokenPayload
			);
			// console.log(chalk.bgCyanBright("Token>> "), token_get.data);

			// saving token into db
			const token_data = {
				shopif_token: token_get.data.access_token,
				scope: JSON.stringify(token_get.data.scope),
				is_enable: 1,
			};

			const access_token = token_get.data.access_token;

			//redirect to get shop/store detail

			const apiRequestURL = `https://${shop}/admin/shop.json`;
			const apiRequestHeaders = {
				"X-Shopify-Access-Token": access_token,
			};

			// console.log("URL and Headers: >> ", apiRequestURL, apiRequestHeaders);

			const apiResponse = await axios.get(apiRequestURL, {
				headers: apiRequestHeaders,
			});
			// console.log("apiResponse: ", apiResponse.data.shop);
			// res.status(200).send(apiResponse.data);

			const created = await db.Shopify_Auth.create(token_data, {
				ignoreDuplicates: true,
			});
			// console.log(chalk.bgCyanBright("Result from db: >> "), created);

			if (!created) {
				return res.status(404).json({
					message: "Result not found or not saved properly!",
				});
			}

			// res.redirect(`/shopify/app?shop=${shop}`);
			return res.status(201).send({
				// created: created,
				message: "Data saved successfuly!",
			});
		}
	} catch (error) {
		if (error.status === 404) {
			return error;
		}
		return res.status(500).json({
			message: error.message || "Shopify token cannot be saved!",
		});
	}
};

exports.addProduct = async (req, res) => {
	try {
		const token = await db.Shopify_Auth.findOne({
			raw: true,
		});

		const shopify = new Shopify({
			shopName: process.env.SHOPIFY_APP_NAME,
			accessToken: token.shopif_token,
		});

		const posted_data = await shopify.product.create({
			title: req.title,
			description: req.description,
			media: req.media,
			price: req.price,
		});

		console.log("Posted data: ", posted_data);
	} catch (error) {
		return res.status(500).json({
			message: error.message || "Product cannot be saved!",
		});
	}
};
