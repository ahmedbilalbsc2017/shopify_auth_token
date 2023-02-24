const { Router } = require("express");

const {
	authTokenReq,
	accessTokenSecret,
	addProduct,
} = require("../controllers/shopify_auth.controller");

const router = Router();

//routes
router.get("/", authTokenReq);

router.get("/callback", accessTokenSecret);

router.post("/addProduct", addProduct);

module.exports = router;
