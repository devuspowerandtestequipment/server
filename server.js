const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const result = require("dotenv").config();
var paypal = require('paypal-rest-sdk');

// FOR IMAGEKIT AUTH
const ImageKit = require("imagekit");
var imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLICKEY,
  privateKey: process.env.IMAGEKIT_PRIVATEKEY,
  urlEndpoint: process.env.IMAGEKIT_URLENDPOINTKEY,
});
// FOR IMAGEKIT AUTH

// ===DATABASE CONNECTION===
mongoose.connect(process.env.MONGODB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (err) => {
  console.log("Failed to connect");
  console.log(err);
});
db.once("open", () => {
  console.log("Successfully Connected");
});
// ===DATABASE CONNECTION===
const StaticData = require("./routes/webstaticdata");
const User = require("./routes/user");
const Brand = require("./routes/brand");
const Category = require("./routes/category");
const SubCategory = require("./routes/subcategory");
const ChildCategory = require("./routes/childcategory");
const Attribute = require("./routes/attribute");
const Product = require("./routes/product");
const Tax = require("./routes/tax");
const Coupon = require("./routes/coupon");
const Shipping = require("./routes/shipping");
const Dashboard = require("./routes/dashboard");
const Cart = require("./routes/cart");
const Seo = require("./routes/seo");
const Order = require("./routes/order");
const Countrystatecity = require("./routes/countrystatecity");
const Courier = require("./routes/courier");
const Contact = require("./routes/contact");
const Image = require("./routes/image");
const Blog = require("./routes/blog");
const SettingsAdmin = require("./routes/settingsadmin");


const app = express();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "50mb",
    parameterLimit: 100000,
  })
);

app.use(
  bodyParser.json({
    limit: "50mb",
    parameterLimit: 100000,
  })
);

app.use(morgan("dev"));
app.use(cors());

// app.use(express.static(path.join(__dirname, "../renderer/out")));

app.get("/api/imagekitauth", function (req, res) {
  const result = imagekit.getAuthenticationParameters();
  res.send(result);
});



///////////////////////////////
const { Resolver } = require("dns").promises;

const isValidRegexEmail = (email) =>
  /[^@\s]+@[^@\s]+\.[^@\s]+/.test(email) && !/\s/.test(email.trim());

const dnsServers = [
  "1.1.1.1", // Cloudflare
  "1.0.0.1", // Cloudflare
  "8.8.8.8", // Google
  "8.8.4.4", // Google
  "208.67.222.222", // OpenDNS
  "208.67.220.220", // OpenDNS
];

const resolverOptions = {
  timeout: 3000,
  tries: Math.min(4, dnsServers.length),
};

const resolveDNS = async ({ type, value }) => {
  try {
    const resolver = new Resolver(resolverOptions);
    resolver.setServers(dnsServers);

    let addresses;
    switch (type) {
      case "mx":
        addresses = await resolver.resolveMx(value);
        break;
      case "lookup":
        addresses = await resolver.resolve(value);
        break;
      case "ns":
        addresses = await resolver.resolveNs(value);
        break;
      default:
        throw new Error(`Unknown DNS resolve type: ${type}`);
    }

    if (Array.isArray(addresses) && addresses.length > 0) {
      return { isValid: true, addresses };
    } else {
      return { isValid: false, addresses: [] };
    }
  } catch (error) {
    if (["ECONNREFUSED", "ENOTFOUND"].includes(error.code)) {
      return { isValid: false, addresses: [] };
    } else {
      return { isValid: false, addresses: [], error: error };
    }
  }
};

const isValidMxEmail = async (emailAddress = "") => {
  if (typeof emailAddress !== "string") return false;

  emailAddress = emailAddress.toLowerCase();

  if (!isValidRegexEmail(emailAddress)) return false;

  const [, domain] = emailAddress.split("@");
  const { isValid, addresses = [] } = await resolveDNS({
    type: "mx",
    value: domain,
  });

  const hasAddress = addresses.every(({ exchange }) => !!exchange);
  if (!hasAddress) return false;

  return isValid;
};
////////////////////////////////////////////





app.get("/", async (req, res) => {
  res.send("Server is working");
});





app.get("/sendemail", (req, res) => {
  const nodemailer = require('nodemailer');
  const Email = require('email-templates');

  const transporter = nodemailer.createTransport({
    // service: process.env.EMAIL_SERVICE, // hide this for godaddy
    host: process.env.EMAIL_HOST,
    // secure: false,
    // port: 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
      }
    });
    const email = new Email({
    transport: transporter,
    send: true,
    preview: false,
  });

   email.send({
        template: 'testemail',
        message: {
          from:process.env.EMAIL_FROM+' '+process.env.EMAIL_USER,
          to:'biswanathprasadsingh9@gmail.com',
        },
        locals: {
          name:'John Doe',
        }
    }).then(response=>{
      res.json({
        response:true,
        message:'send',
        res:response
      })
    }).catch(err=>{
      console.log(err)
      res.json({
        response:false,
      })
    })
});









app.listen(process.env.PORT || 5000, function () {
  console.log(
    "USER Express server listening on port %d in %s mode",
    this.address().port,
    app.settings.env
  );
});

app.use("/api/static", StaticData);
app.use("/api/user", User);
app.use("/api/brand", Brand);
app.use("/api/category", Category);
app.use("/api/subcategory", SubCategory);
app.use("/api/childcategory", ChildCategory);
app.use("/api/attribute", Attribute);
app.use("/api/product", Product);
app.use("/api/tax", Tax);
app.use("/api/coupon", Coupon);
app.use("/api/shipping", Shipping);
app.use("/api/dashboard", Dashboard);
app.use("/api/cart", Cart);
app.use("/api/seo", Seo);
app.use("/api/order", Order);
app.use("/api/countrystatecity", Countrystatecity);
app.use("/api/courier", Courier);
app.use("/api/contact", Contact);
app.use("/api/image", Image);
app.use("/api/blog", Blog);
app.use("/api/settingsadmin", SettingsAdmin);


//STATIC FILE
app.use('/themes', express.static('themes'));
app.use('/public', express.static('public'));
