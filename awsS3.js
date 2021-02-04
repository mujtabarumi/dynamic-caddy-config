const AWS = require('aws-sdk');
require('dotenv').config();

const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.AWS_BUCKET;
const AWS_DEFAULT_REGION = process.env.AWS_DEFAULT_REGION;

const s3 = new AWS.S3({
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY,
  endpoint: new AWS.Endpoint(`https://s3.${AWS_DEFAULT_REGION}.amazonaws.com`),
  region: AWS_DEFAULT_REGION,
});

module.exports = { s3, BUCKET_NAME, AWS_DEFAULT_REGION };
