const express = require('express');
const bodyParser = require('body-parser');
const schedule = require('schedule');
const RSS = require('rss-parser');
const nodemailer = require('nodemailer');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 3000; // Use environment variable for port
const existingFeeds = []
// Replace with your actual email details
const emailSettings = {
  service: 'gmail',
    auth: {
        user: process.env.USER,
        pass: process.env.PASS,
    },
}
;

const rssFeedUrl = process.env.RSS_URL; 

console.log(rssFeedUrl);
console.log(process.env.SENDER);
console.log(process.env.RECEIVER);
console.log(process.env.USER);
console.log(process.env.PASS);

const transporter = nodemailer.createTransport(emailSettings);

function sendNotificationEmail(feedItem) {
  const emailBody = `
   
    <h1>
       <a href="${feedItem.link}">${feedItem.title}</a>
    </h1> 
    <p>
      ${feedItem.content}
    </p>
  `;

  const mailOptions = {
    from: process.env.SENDER, // Replace with your email address
    to: process.env.RECEIVER, // Replace with recipient's email address
    subject: Math.random()*50 ,
    html: emailBody
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent: ', info.response);
    }
  });
}



async function checkForNewItems() {
  try {
    const feed = new RSS();

    const parsedFeed = await feed.parseURL(rssFeedUrl);
    const newItems = parsedFeed.items.filter(item=> !existingFeeds.includes(item.guid)); 

    if (newItems.length > 0) {
        console.log("new items was found");
        newItems.forEach(feedItem => sendNotificationEmail(feedItem))
        existingFeeds.splice(0 , newItems.length);
        existingFeeds.push(...newItems.map(item => item.guid));
    } else {
      console.log('No new items found.');
    }

  } catch (error) {
    console.error('Error fetching or parsing RSS feed:', error);
  }
}

// Schedule task to check for new items periodically (e.g., every hour)
setInterval(()=>{
    checkForNewItems();
} , 60*1000)

// Start the Express server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
