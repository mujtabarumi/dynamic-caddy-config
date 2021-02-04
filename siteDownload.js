const { s3, BUCKET_NAME, AWS_DEFAULT_REGION } = require('./awsS3');
const fs = require('fs');
const mysql = require('./mysql');
const join = require('path').join;

const util = require('util');
const writeFile = util.promisify(fs.writeFile);

const cmd = require('node-cmd');

const http = require('http');
const curl = require('curl-cmd');

const downloadSites = async (public_ip) => {
  try {
    const DbPool = await mysql();
    const nginx_server_ip = public_ip;
    const nginx_server_info = await findNginx_server(DbPool, nginx_server_ip);
    if (
      !nginx_server_info ||
      (nginx_server_info && nginx_server_info.length <= 0)
    ) {
      console.log('nginx server not found');
    }
    const load_balancer_info = await findLoad_balancer(
      DbPool,
      nginx_server_info[0].load_balancer_id
    );
    if (
      !load_balancer_info ||
      (load_balancer_info && load_balancer_info.length <= 0)
    ) {
      console.log('load balancer not found');
    }
    const sites = await findSites(DbPool, load_balancer_info[0].id);

    if (!sites || (sites && sites.length <= 0)) {
      console.log('no sites found');
    }

    // await createDirectories('../sites1/');

    let serversObj = new Map();
    let port = 3000;

    sites.forEach(async (site, i, sites) => {
      let folder = site.id;
      const params = {
        Bucket: BUCKET_NAME,
        Prefix: folder,
      };
      const data = await s3.listObjects(params).promise();
      for (let index = 0; index < data['Contents'].length; index++) {
        if (data['Contents'][index]['Size'] > 0) {
          let site_url_info = new URL(site.url);
          let folderName = site_url_info.hostname;
          let name = data['Contents'][index]['Key'].split('/');
          let fileName = name[name.length - 1];
          let folderPath =
            './sites/' + data['Contents'][index]['Key'].replace(fileName, '');
          folderPath = folderPath.replace(name[0], folderName);

          if (!fs.existsSync(`${folderPath}`)) {
            fs.mkdir(folderPath, { recursive: true }, (e) => {
              if (e) {
                console.error(e);
              } else {
                fs.chmodSync(folderPath, 0777);
              }
            });
          }

          let option = {
            Bucket: BUCKET_NAME,
            Key: data['Contents'][index]['Key'],
          };
          s3.getObject(option)
            .promise()
            .then((data1) => {
              writeFile(`${folderPath}/${fileName}`, data1.Body);
            })
            .catch((err) => {
              throw err;
            });

          addToHostFile(folderName);

          let serverData = {
            listen: [`:${port++}`],
            routes: [
              {
                handle: [
                  {
                    handler: 'file_server',
                    root: '/Users/rumi/Code/pagebulb-works/sites',
                  },
                ],
              },
            ],
          };

          serversObj.set(folderName, serverData);

          if (i === sites.length - 1) {
            writeCaddyJson(serversObj);
            console.log(folderName, serversObj);
            // addConfigToCaddy();
          }
        }
      }
    });

    const nginx_server = DbPool.end(() => console.log('Connection ended'));
  } catch (error) {
    console.log(error);
  }
};

const findNginx_server = async (DbPool, ip) => {
  try {
    const data = await DbPool.query(
      `SELECT * FROM nginx_server WHERE public_ip="${ip}"`
    );
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};
const addToHostFile = (folderName) => {
  cmd.runSync('sudo sh addHost.sh ' + folderName);
};
const addConfigToCaddy = () => {
  curl.cmd(
    {
      host: 'localhost',
      port: 8080,
      method: 'POST',
      path: '/',
      headers: { 'User-Agent': 'Internet Explorer' },
      auth: 'dave:secret',
    },
    { ssl: true, verbose: true }
  );
  ('curl localhost:2019/load -X POST -H Content-Type: application/json -d @/Users/rumi/Code/pagebulb-works/caddy.json');
};

const writeCaddyJson = (serversObj) => {
  const obj = {};
  for (let [key, value] of serversObj) {
    obj[key] = value;
  }

  const newObj = {
    apps: {
      http: {
        servers: obj,
      },
    },
  };
  const jsonString = JSON.stringify(newObj);
  fs.writeFileSync('caddy.json', jsonString);
};
const findLoad_balancer = async (DbPool, id) => {
  try {
    const data = await DbPool.query(
      `SELECT * FROM load_balancer WHERE id="${id}"`
    );
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};
const findSites = async (DbPool, id) => {
  try {
    const data = await DbPool.query(
      `SELECT * FROM sites WHERE server_id="${id}"`
    );
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// async function createDirectories(pathname) {
//   // const newPathname = pathname.replace(/^\.*\/|\/?[^\/]+\.[a-z]+|\/$/g, '');
//   const newPathname = pathname;
//   console.log(newPathname);
//   fs.mkdir(newPathname, { recursive: true }, (e) => {
//     if (e) {
//       console.error(e);
//     } else {
//       fs.chmodSync(newPathname, 0777);
//       console.log('Success');
//     }
//   });
// }

downloadSites('124.90.97.255');
