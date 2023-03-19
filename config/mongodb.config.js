const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI,
  function(err) {
    if (err) {
      console.log('Database connection is failed. exiting now...');
      console.log('Check internet connection stable or not');
      console.log('Check mongodb URL in .env and make sure it is not wrong');
    }
    console.log('Successfully connected to mongodb database');
  }
)
