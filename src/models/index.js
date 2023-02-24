const Sequelize = require("sequelize");
const mysql = require("mysql2/promise");
const chalk = require("chalk");

const dbConfig = require("../../config/config");

const db = {};

(async () => {
	try {
		//db configuration
		const connection = await mysql.createConnection({
			host: dbConfig.HOST,
			user: dbConfig.USER,
			password: dbConfig.PASSWORD,
		});
		console.log("connection ........");
		await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.DB}\`;`);
		// db_create();
		console.log("executing ........");
		//db configuration
		const sequelize = new Sequelize(
			dbConfig.DB,
			dbConfig.USER,
			dbConfig.PASSWORD,
			{
				host: dbConfig.HOST,
				dialect: dbConfig.dialect,
				operatorsAliases: 0,

				pool: {
					max: dbConfig.pool.max,
					min: dbConfig.pool.min,
					acquire: dbConfig.pool.acquire,
					idle: dbConfig.pool.idle,
				},
			}
		);

		sequelize
			.authenticate()
			.then(() => {
				console.log(
					chalk.yellowBright(
						"\nDatabase Connection has been established successfully."
					)
				);
			})
			.catch((err) => {
				console.error(
					chalk.redBright("\nUnable to connect to the database:"),
					err
				);
			});

		sequelize.sync();

		db.Sequelize = Sequelize;
		db.sequelize = sequelize;

		db.Shopify_Auth = require("./shopify_auth.model")(sequelize, Sequelize);
	} catch (error) {
		console.log("DB Creating error: ", error);
	}
})();

module.exports = db;
