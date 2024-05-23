'use strict';

import express from 'express';
import 'dotenv/config';

// Import the products object from the products.js file
import { products } from './products.js';
import pkg from 'nodemailer';
const nodemailer = pkg;
const PORT = process.env.PORT;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


// HTML TEMPLATE -------------------------------------
let htmlTop = `
   <!doctype html>
   <html lang="en">
   <head>
   <meta charset="UTF-8">
   <meta http-equiv="X-UA-Compatible" content="IE=edge">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <meta name="robots" content="noindex,noarchive,nofollow">
   <title>Rachel Higgins</title>
   <link rel='stylesheet' type='text/css' media='screen' href='main.css'>
   <script src='main.js'></script>
   <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
   <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
   <link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">
   <link rel="manifest" href="site.webmanifest">
   <link rel="icon" type="image/png" sizes="512x512" href="android-chrome-512x512.png">
   <link rel="icon" type="image/png" sizes="192x192" href="android-chrome-192x192.png">
   <link rel="stylesheet" href="main.css" />
</head>

<body>
    <header>
        <h1>Rachel Higgins</h1>
        <img src="android-chrome-192x192.png" alt="Rachel Higgins">
    </header>
    <nav>
        <a href="index.html">Home</a>
        <a href="contact.html">Contact</a>
        <a href="order.html">Order</a>
        <a href="gallery.html">Gallery</a>
        <a href="staff.html">Staff</a>
    </nav>
         <main>
               <section>

`;

let htmlBottom = `
               </section>
      </main>
        <footer>
            <p><span>&#169;</span> 2024 Rachel Higgins</p>
        </footer>
    </body>
    </html>
`;


// ORDER FORM -------------------------------------

function CompareInventoryData(productChoice) {
   for (const item of products) {
      if (item.product === productChoice) {
         return item;
      }
   }
}

app.post('/order_response.html', (req, res) => {
   const { name, email, streetAddress, city, state, zip, deliveryNote, productChoice, qty } = req.body;

   const deliveryAddress = `${streetAddress}, ${city}, ${state} ${zip}`;
   const choice = CompareInventoryData(productChoice);
   const itemPrice = choice.price;
   const itemPriceString = choice.price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
   const totalAmount = qty * itemPrice;
   const totalAmountString = totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
   const deliveryInstructions = `${deliveryNote}`;

   let orderResponseHTML = `
        ${htmlTop}
            <h2>Order Confirmation</h2>
               <article>
                  <h3>Thank you for your order!</h3>
                     <p><strong>${name}</strong>,</p>
                     <p>You are purchasing 
                     <strong>${qty}</strong> 
                     <strong>${choice.product}s</strong> from 
                     <strong>${choice.company}</strong>. 
                     The price of one is 
                     <strong>${itemPriceString}</strong> and the total price for your order is
                     <span class="numeric"><strong>${totalAmountString}</strong></span>.</p>
                     <p>Your order will be delivered to
                     <strong>${deliveryAddress}</strong> with the following instructions: 
                     <strong>${deliveryInstructions}</strong></p>
                     <p>A confirmation email and receipt has been sent to <strong>${email}</strong>.</p>
                     <p>Thank you again for your purchase!</p>
               </article>
        ${htmlBottom}`;

   res.send(orderResponseHTML);
});

// CONTACT FORM -------------------------------------

app.post('/contact_response.html', (req, res) => {
   const { name, email, message, inquiryType, contactPreference, language } = req.body;

   let formResponsePlain = `
        Name: ${name}
        Email: ${email}
        Inquiry Type: ${inquiryType}
        Contact Preference: ${contactPreference}
        Programming Language(s): ${language}
        Message: ${message}`;

   let formResponseHTML = `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Inquiry Type:</strong> ${inquiryType}</p>
        <p><strong>Contact Preference:</strong> ${contactPreference}</p>
        <p><strong>Programming Language(s):</strong> ${language}</p>
        <p><strong>Message:</strong> ${message}</p>`;

   let responseHTML = `
        ${htmlTop}
         <h2>Thank You!</h2>
         <p><strong>Your message has been received:</strong></p>
         ${formResponseHTML}
        ${htmlBottom}`;

   res.send(responseHTML);

   // Sending the email
   nodemailer.createTestAccount((err, account) => {
      if (err) {
         console.error('Failed to create a testing account. ' + err.message);
         return process.exit(1);
      }

      let transporter = nodemailer.createTransport({
         host: account.smtp.host,
         port: account.smtp.port,
         secure: account.smtp.secure,
         auth: {
            user: account.user,
            pass: account.pass
         }
      });

      let message = {
         from: `Sender Name <${email}>`,
         to: `Recipient <rachelkhiggins.v@icloud.com>`,
         subject: `[Contact from my Portfolio Website]`,
         text: `
                Hello, Rachel! 
                ${name} has filled out your portfolio contact form. 
                ${formResponsePlain}`,
         html: `
                <h2><strong>Hello, Rachel!</strong></h2>
                <p>${name} has filled out your portfolio contact form.</p><b><br>
                ${formResponseHTML}`
      };

      transporter.sendMail(message, (err, info) => {
         if (err) {
            console.log('Error occurred. ' + err.message);
            return process.exit(1);
         }

         console.log('Message sent: %s', info.messageId);
         console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      });
   });
});


app.listen(PORT, () => {
   console.log(`Server listening on port ${PORT}...`);
});
