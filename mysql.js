const mysql = require('promise-mysql');
require('dotenv').config();

const DB_HOST = process.env.DB_HOST;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_DATABASE = process.env.DB_DATABASE;

// var connection = mysql.createConnection({
//   host: DB_HOST,
//   user: DB_USERNAME,
//   password: DB_PASSWORD,
//   database: DB_DATABASE,
// });

// connection.connect(function (err) {
//   if (err) {
//     console.error('error connecting: ' + err.stack);
//     return;
//   }

//   console.log('connected as id ' + connection.threadId);
// });

const createWpInsightUnixSocketPool = async (config) => {
  // Establish a connection to the database
  return await mysql.createPool({
    host: DB_HOST,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    ...config,
  });
};

const createDBPool = async () => {
  const config = {
    // [START cloud_sql_mysql_mysql_limit]
    // 'connectionLimit' is the maximum number of connections the pool is allowed
    // to keep at once.
    connectionLimit: 5,
    // [END cloud_sql_mysql_mysql_limit]

    // [START cloud_sql_mysql_mysql_timeout]
    // 'connectTimeout' is the maximum number of milliseconds before a timeout
    // occurs during the initial connection to the database.
    connectTimeout: 10000, // 10 seconds
    // 'acquireTimeout' is the maximum number of milliseconds to wait when
    // checking out a connection from the pool before a timeout error occurs.
    acquireTimeout: 10000, // 10 seconds
    // 'waitForConnections' determines the pool's action when no connections are
    // free. If true, the request will queued and a connection will be presented
    // when ready. If false, the pool will call back with an error.
    waitForConnections: true, // Default: true
    // 'queueLimit' is the maximum number of requests for connections the pool
    // will queue at once before returning an error. If 0, there is no limit.
    queueLimit: 0, // Default: 0
    // [END cloud_sql_mysql_mysql_timeout]

    // [START cloud_sql_mysql_mysql_backoff]
    // The mysql module automatically uses exponential delays between failed
    // connection attempts.
    // [END cloud_sql_mysql_mysql_backoff]
  };

  return await createWpInsightUnixSocketPool(config);
};

module.exports = createDBPool;
