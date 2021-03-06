/** @format */

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
// const cors = require("cors");
const methodOverride = require("method-override");
const connectDB = require("./config/db");
const passport = require("passport");
const session = require("express-session");
const fs = require("fs");
const { Mongoose } = require("mongoose");
const MongoStore = require("connect-mongo")(session);

// load config
dotenv.config({ path: "./config/config.env" });

require("./config/passport")(passport);

connectDB();

const app = express();

// body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// app.use(express.static(__dirname));

// app.use(express.static(path.join(__dirname, "app/app")));
// method override
app.use(
	methodOverride(function (req, res) {
		if (req.body && typeof req.body === "object" && "_method" in req.body) {
			// look in urlencoded POST bodies and delete it
			let method = req.body._method;
			delete req.body._method;
			return method;
		}
	}),
);

// app.use(cors());

// loging
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}
// handlebars Helpers
const {
	formatDate,
	stripTags,
	truncate,
	editIcon,
	select,
} = require("./helpers/hbs");

// handlebarsF
app.engine(
	".hbs",
	exphbs({
		helpers: {
			formatDate,
			stripTags,
			truncate,
			editIcon,
			select,
		},
		layoutsDir: "./views/layouts",
		defaultLayout: "main",
		extname: ".hbs",
		partialsDir: ["./views/partials"],
	}),
);

app.set("view engine", ".hbs");

// Sessions
app.use(
	session({
		secret: "keyboard cat",
		resave: false,
		saveUninitialized: false,
		store: new MongoStore({ mongooseConnection: mongoose.connection }),
	}),
);

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// set global variabl

app.use(function (req, res, next) {
	res.locals.user = req.user || null;
	next();
});

// static folder
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/stories", require("./routes/stories"));

const directoryPath = __dirname + "/views/layouts";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(`server running in production mode on port ${PORT}`);
	//passsing directoryPath and callback function
	console.log(__dirname);
	console.log("##################   this is Dir   #################");

	fs.readdir(directoryPath, function (err, files) {
		//handling error
		if (err) {
			return console.log("Unable to scan directory: " + err);
		}
		//listing all files using forEach
		files.forEach(function (file) {
			// Do whatever you want to do with the file
			console.log(file);
		});
	});
});
