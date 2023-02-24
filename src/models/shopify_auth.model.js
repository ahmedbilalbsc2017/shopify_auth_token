const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
	return sequelize.define(
		"Shopify_Auth",
		{
			id: {
				autoIncrement: true,
				type: DataTypes.BIGINT,
				allowNull: false,
				primaryKey: true,
			},
			shopif_token: {
				type: DataTypes.STRING(500),
				allowNull: false,
				unique: "shopify_token",
			},
			scope: {
				type: DataTypes.STRING(1000),
				allowNull: false,
			},
			is_enable: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
			},
		},
		{
			sequelize,
			tableName: "Shopify_Auth",
			freezeTableName: true,
			timestamps: true,
			indexes: [
				{
					name: "PRIMARY",
					unique: true,
					using: "BTREE",
					fields: [
						{
							name: "id",
						},
					],
				},
			],
		}
	);
};
