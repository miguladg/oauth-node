const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');
require('dotenv').config();

// Path to the .env file
const envFilePath = path.resolve(__dirname, '.env');

// Function to generate a code_verifier
const generateCodeVerifier = () => {
  return crypto.randomBytes(32).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
};

// Function to validate the existence of the .env file and add code_verifier if it doesn't exist
const validateAndAddCodeVerifier = () => {
  if (!fs.existsSync(envFilePath)) {
    console.error('Error: .env file not found. Please create a .env file in the root directory.');
    process.exit(1);
  }
  
  // Read the current content of the .env file
  const envVars = fs.readFileSync(envFilePath, 'utf8').split('\n');
  
  // Check if the code_verifier already exists
  let codeVerifier = envVars.find(line => line.startsWith('CODE_VERIFIER='));
  if (!codeVerifier) {
    // Generate a new code_verifier and add it to the .env file
    codeVerifier = `CODE_VERIFIER=${generateCodeVerifier()}`;
    fs.appendFileSync(envFilePath, `\n${codeVerifier}`);
    console.log('CODE_VERIFIER added to .env file.');
  } else {
    console.log('CODE_VERIFIER already exists in .env file.');
  }

  // Reload the environment variables
  require('dotenv').config();
};

// Function to serialize an object into application/x-www-form-urlencoded format
const serializeData = (data) => {
  return Object.keys(data).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`).join('&');
};

// Function to make an HTTPS POST request
const makePostRequest = (url, data) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = serializeData(data);

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Request failed with status code ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

// Function to obtain the token for the first time
const getToken = async () => {
  const data = {
    grant_type: 'authorization_code',
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uri: process.env.REDIRECT_URI,
    code: process.env.AUTHORIZATION_CODE,
    code_verifier: process.env.CODE_VERIFIER
  };

  try {
    const response = await makePostRequest('https://api.mercadolibre.com/oauth/token', data);
    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token
    };
  } catch (error) {
    console.error('Error obtaining access token:', error.message);
    throw error;
  }
};

// Function to refresh the token
const refreshTokenFn = async (refreshToken) => {
  const data = {
    grant_type: 'refresh_token',
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    refresh_token: refreshToken
  };

  try {
    const response = await makePostRequest('https://api.mercadolibre.com/oauth/token', data);
    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token
    };
  } catch (error) {
    console.error('Error obtaining access token:', error.message);
    throw error;
  }
};

// Function to write the tokens to the .env file
const writeEnvFile = (accessToken, refreshToken) => {
  const envVars = fs.readFileSync(envFilePath, 'utf8').split('\n');
  const newEnvVars = envVars.map(line => {
    if (line.startsWith('ACCESS_TOKEN=')) {
      return `ACCESS_TOKEN=${accessToken}`;
    }
    if (line.startsWith('REFRESH_TOKEN=')) {
      return `REFRESH_TOKEN=${refreshToken}`;
    }
    return line;
  });

  if (!envVars.some(line => line.startsWith('ACCESS_TOKEN='))) {
    newEnvVars.push(`ACCESS_TOKEN=${accessToken}`);
  }
  if (!envVars.some(line => line.startsWith('REFRESH_TOKEN='))) {
    newEnvVars.push(`REFRESH_TOKEN=${refreshToken}`);
  }

  fs.writeFileSync(envFilePath, newEnvVars.join('\n'), (err) => {
    if (err) {
      console.error('Error writing the .env file:', err);
    } else {
      console.log('.env file updated successfully.');
    }
  });
};

// Function to manage tokens
const tokenManagement = async () => {
  try {
    let accessToken, refreshToken;
    if (!process.env.REFRESH_TOKEN) {
      const tokens = await getToken();
      accessToken = tokens.accessToken;
      refreshToken = tokens.refreshToken;
    } else {
      const tokens = await refreshTokenFn(process.env.REFRESH_TOKEN);
      accessToken = tokens.accessToken;
      refreshToken = tokens.refreshToken;
    }
    writeEnvFile(accessToken, refreshToken);
  } catch (error) {
    console.error('Error in the token management process:', error);
  }
  console.log("Token is ready for work");
};

tokenManagement()

module.exports = {
  getToken,
  refreshTokenFn,
  writeEnvFile,
  tokenManagement
};
