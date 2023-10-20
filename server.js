const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const result = require("dotenv").config();
var paypal = require('paypal-rest-sdk');

const NodeCache = require( "node-cache" );
const myCache = new NodeCache();

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
const Currency = require("./routes/currency");
const SettingsAdmin = require("./routes/settingsadmin");
const RolesAdmin = require("./routes/rolesadmin");
const ShippingRule = require("./routes/shippingrule");



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


app.get("/update_product", function (req, res) {


  const TProduct = require("./models/Product");

  TProduct.update({},{maximum_order: 3},{multi: true})
  .then(as=>{
    res.json({
      response:true
    })
  }).catch((err)=>{
    res.json({
      response:false
    })
  })


});



app.get("/paypal", function (req, res) {

  paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AY10bLMyZLtP3wVNODGh6mdmzGjc1XxBg7m_s61q07kFvEAfVCDYv_16XsX09KytlrAnCx_VTJTnFf-F',
    'client_secret': 'EKFUR80NNpYESG7u5Au6oC-22noDWM7YzuSomDebJgWr61RqQpFA440NdtWqkbTJ_1CuAtXJ9QwGrVFc'
  });

  // paypal.configure({
  //   'mode': 'live', //sandbox or live
  //   'client_id': 'Ab620lyNESUWkl16w4MPK7HrCACSTTWB1Kd83rGeQAEw_fMiJ6BWbTzii2ZeJrLKU8QsA9p-1D-smjk6',
  //   'client_secret': 'ECozQIybzglUgNq5Kb_QyagjS39vjlEFNjskpLUnWrLGZrDrj60a4ed1ZC0WNcyNKlLCDUnxIDIJtP3R'
  // });


    var create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          // "return_url": "http://localhost:3001/payment?seccode=12121221&paypal_code=000022111",
          "return_url": "http://localhost:5000/paypalsuccess",
          "cancel_url": "http://cancel.url"
      },
      "transactions": [{
          "item_list": {
              "items": [{
                  "name": "item",
                  "sku": "item",
                  "price": "1.00",
                  "currency": "USD",
                  "quantity": 1
              }]
          },
          "amount": {
              "currency": "USD",
              "total": "1.00"
          },
          "description": "This is the payment description."
      }]
  };


  paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
          throw error;
          console.log('error',error);
      } else {
          console.log('payment',payment);

          for(let i = 0;i < payment.links.length;i++){
            if(payment.links[i].rel === 'approval_url'){
              res.redirect(payment.links[i].href);
            }
          }


          // res.json({
          //   payment:111
          // })
      }
  });

  // res.json({
  //   response:true
  // })

});




app.get("/paypalsuccess", function (req, res) {

  console.log(req.param("paymentId"))


  res.json({
    response:true
  })

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

//   const legit = require('legit');
//
// legit('validemail@qtonix.com')
//   .then(result => {
//     result.isValid ? console.log('Valid!') : console.log('Invalid!');
//     console.log(JSON.stringify(result));
//   })
//   .catch(err => console.log(err));


  res.send("Server is working");


});






app.get("/test1", async (req, res) => {
  // // https://github.com/mrvautin/expressCart/blob/master/config/payment/config/authorizenet.json
  // var authorizenetConfig ={
  //       "description": "Card payment",
  //       "loginId": "2s4VR56fb3Q",
  //       "transactionKey": "9y2P9nfB6UA5cD9S",
  //       "clientKey": "clientKey",
  //       "mode": "live" //live
  // }
  //
  // // let authorizeUrl = 'https://api.authorize.net/xml/v1/request.api';
  // // if(authorizenetConfig.mode === 'test'){
  //       authorizeUrl = 'https://apitest.authorize.net/xml/v1/request.api';
  // // }
  //
  // const chargeJson = {
  //       createTransactionRequest: {
  //           merchantAuthentication: {
  //               name: authorizenetConfig.loginId,
  //               transactionKey: authorizenetConfig.transactionKey
  //           },
  //           transactionRequest: {
  //               transactionType: 'authCaptureTransaction',
  //               amount: 11,
  //               payment: {
  //                   opaqueData: {
  //                       dataDescriptor: 'Card payment',
  //                       dataValue: 11
  //                   }
  //               }
  //           }
  //       }
  //   };
  //
  //
  //
  //
  //   const axios = require('axios');
  //   axios.post(authorizeUrl, chargeJson, { responseType: 'text' })
  //   .then(async(response) => {
  //
  //       console.log(response);
  //
  //       // res.json({
  //       //   response
  //       // })
  //
  //       // This is crazy but the Authorize.net API returns a string with BOM and totally
  //       // screws the JSON response being parsed. So many hours wasted!
  //       // const txn = JSON.parse(stripBom(response.data)).transactionResponse;
  //       //
  //       // if(!txn){
  //       //     console.log('Declined request payload', chargeJson);
  //       //     console.log('Declined response payload', response.data);
  //       //     res.status(400).json({ err: 'Your payment has declined. Please try again' });
  //       //     return;
  //       // }
  //
  //       // order status if approved
  //       // let orderStatus = 'Paid';
  //       // let approved = true;
  //       // let paymentMessage = 'Your payment was successfully completed';
  //       // if(txn && txn.responseCode !== '1'){
  //       //     console.log('Declined response payload', response.data);
  //       //     paymentMessage = 'Your payment was declined';
  //       //     orderStatus = 'Declined';
  //       //     approved = false;
  //       // }
  //
  //
  //
  //
  //   })
  //   .catch((err) => {
  //       console.log('Error sending payment to API', err);
  //       res.status(400).json({ err: 'Your payment has declined. Please try again' });
  //   });






  const { loginId, transactionKey } = require('./config');
  const ApiContracts = require('authorizenet').APIContracts;
  const ApiControllers = require('authorizenet').APIControllers;
  const SDKConstants = require('authorizenet').Constants;



  // const validationErrors = validateForm(req);
  //
  //   if(validationErrors.length > 0) {
  //       res.json({ errors: validationErrors });
  //       return;
  //   }

    // const { cc, cvv, expire, amount } = req.body;


    const cc='374245455400126';
    const cvv='123';

    const expire='052026';

    const amount='12';




    const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
	merchantAuthenticationType.setName(loginId);
    merchantAuthenticationType.setTransactionKey(transactionKey);

    const creditCard = new ApiContracts.CreditCardType();
	creditCard.setCardNumber(cc);
	creditCard.setExpirationDate(expire);
    creditCard.setCardCode(cvv);

    const paymentType = new ApiContracts.PaymentType();
    paymentType.setCreditCard(creditCard);

    const transactionSetting = new ApiContracts.SettingType();
	transactionSetting.setSettingName('recurringBilling');
    transactionSetting.setSettingValue('false');

    const transactionSettingList = [];
    transactionSettingList.push(transactionSetting);

    const transactionSettings = new ApiContracts.ArrayOfSetting();
	transactionSettings.setSetting(transactionSettingList);

    const transactionRequestType = new ApiContracts.TransactionRequestType();
	transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
	transactionRequestType.setPayment(paymentType);
	transactionRequestType.setAmount(amount);
    transactionRequestType.setTransactionSettings(transactionSettings);

    const createRequest = new ApiContracts.CreateTransactionRequest();
	createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setTransactionRequest(transactionRequestType);

    const ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());

    ctrl.execute(() => {
        const apiResponse = ctrl.getResponse();
        const response = new ApiContracts.CreateTransactionResponse(apiResponse);

        if(response !== null) {
          res.json({ response: response })
            // if(response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
            //     if(response.getTransactionResponse().getMessages() !== null) {
            //         res.json({ success: 'Transaction was successful.' });
            //     } else {
            //         if(response.getTransactionResponse().getErrors() !== null) {
            //             let code = response.getTransactionResponse().getErrors().getError()[0].getErrorCode();
            //             let text = response.getTransactionResponse().getErrors().getError()[0].getErrorText();
            //             res.json({
            //                 error: `${code}: ${text}`
            //             });
            //         } else {
            //             res.json({ error: 'Transaction failed.' });
            //         }
            //     }
            // } else {
            //     if(response.getTransactionResponse() !== null && response.getTransactionResponse().getErrors() !== null){
            //         let code = response.getTransactionResponse().getErrors().getError()[0].getErrorCode();
            //         let text = response.getTransactionResponse().getErrors().getError()[0].getErrorText();
            //         res.json({
            //             error: `${code}: ${text}`
            //         });
            //     } else {
            //         let code = response.getMessages().getMessage()[0].getCode();
            //         let text = response.getMessages().getMessage()[0].getText();
            //         res.json({
            //             error: `${code}: ${text}`
            //         });
            //     }
            // }

        } else {
            res.json({ error: 'No response.' });
        }
    });





  //
  // res.json({
  //   response:true
  // })


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
app.use("/api/currency", Currency);
app.use("/api/settingsadmin", SettingsAdmin);
app.use("/api/rolesadmin", RolesAdmin);
app.use("/api/shippingrule", ShippingRule);




//STATIC FILE
app.use('/themes', express.static('themes'));
app.use('/public', express.static('public'));
