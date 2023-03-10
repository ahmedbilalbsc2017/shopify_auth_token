require("dotenv").config();
const chalk = require("chalk");

const app = require("./src/app");

app.set("port", process.env.PORT);
app.set("message", process.env.MESSAGE);

const port = app.get("port");
const message = app.get("message");

app.listen(port, () => {
	console.log(chalk.blue(`${message} ${port}`));
});
