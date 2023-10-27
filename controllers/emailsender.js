const response = require("express");
var mongoose = require('mongoose');

const EmailSendList = require("../models/EmailSendList");


function emailsendFunction(email_templete,email_to,locals,email_name,want_to_store,user_id) {
  return new Promise((Resolve, reject) => {



      var json={}
      // console.log(args)
      const nodemailer = require('nodemailer');
      const Email = require('email-templates');


      locals.website_url='https://www.uspowerandtestequipment.com';
      locals.mainfooter='uspowerandtestequipment.com | 2023';
      locals.mainfooter_link='https://www.uspowerandtestequipment.com';
      locals.footer_address1='Oceanside, CA 92057, USA';
      locals.footer_address2='2023';
      locals.footer_unsubscribe=`Don't like these emails`;
      locals.helpemail='uspowerandtest@gmail.com';
      locals.websitename='USPowerAndTestequipment';


      const transporter = nodemailer.createTransport({
        // service: process.env.EMAIL_SERVICE, // hide this for godaddy
        // host: process.env.EMAIL_HOST,
        // secure: false,
        // port: 587
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
          user: 'uspowerandtest@gmail.com',
          pass: 'wjzuuhutuwqbrxwo'
          }
        });
        const email = new Email({
        transport: transporter,
        send: true,
        preview: false,
      });

      // const transporter = nodemailer.createTransport({
      //   host: 'smtp.office365.com', // Office 365 server
      //   port: 587,     // secure SMTP
      //   secure: false,
      //   auth: {
      //     user: process.env.EMAIL_USER,
      //     pass: process.env.EMAIL_PASS
      //   },
      //   tls: {
      //       ciphers: 'SSLv3'
      //   }
      //   });
      //   const email = new Email({
      //   transport: transporter,
      //   send: true,
      //   preview: false,
      // });


      // const transporter = nodemailer.createTransport({
      //   // service: process.env.EMAIL_SERVICE,
      //   host: process.env.EMAIL_HOST,
      //   auth: {
      //     user: process.env.EMAIL_USER,
      //     pass: process.env.EMAIL_PASS
      //     }
      //   });
      //   const email = new Email({
      //   transport: transporter,
      //   send: true,
      //   preview: false,
      // });

       email.send({
            template: email_templete,
            message: {
              from:process.env.EMAIL_FROM+' '+process.env.EMAIL_USER,
              to:email_to,
            },
            locals: locals
        }).then(response=>{
          // console.log(response);

          var email_data={
            email_to:email_to,
            email_from:'uspowerandtest@gmail.com',
            email_subject:response.originalMessage.subject,
            email_body:response.originalMessage.html,
            status:true,
            email_name:email_name
          }
          if(user_id){
            email_data.user_id=user_id
          }

          if(want_to_store){
            EmailSendList.create(email_data)
            .then(dqwd=>{
              console.log('saved_in_db');
            })
          }


          json={
            response:true,
            data:response.originalMessage
          }
          Resolve(json);

        }).catch(err=>{

          var email_data={
            email_to:email_to,
            email_from:process.env.EMAIL_USER,
            email_subject:'-',
            email_body:'-',
            status:false,
            email_name:email_name
          }
          if(user_id){
            email_data.user_id=user_id
          }

          if(want_to_store){
            EmailSendList.create(email_data)
            .then(dqwd=>{
              console.log('saved_in_db');
            })
          }


          json={
            response:false
          }
          Resolve(json);

        })
        return json;



  });
}

module.exports = {
  emailsendFunction: emailsendFunction,
};
