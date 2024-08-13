const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();
const axios = require('axios');
const qs = require('querystring');

// Path to the .env file
const envFilePath = path.resolve(__dirname, '.env'); // We need to create varible for de user put in the index code

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

// Function to validate the existence of the .env file
const validateEnvFile = () => {
  if (!fs.existsSync(envFilePath)) {
    console.error('Error: .env file not found. Please create a .env file in the root directory.');
    process.exit(1);  // Terminate the program due to missing .env file
  } else {
    console.log('.env file found.');
  }
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
    const response = await axios.post('https://api.mercadolibre.com/oauth/token', qs.stringify(data), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token
    };
  } catch (error) {
    if (error.response) {
      console.error('Error obtaining access token:', error.response.data);
    } else {
      console.error('Error obtaining access token:', error.message);
    }
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
    const response = await axios.post('https://api.mercadolibre.com/oauth/token', qs.stringify(data), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token
    };
  } catch (error) {
    if (error.response) {
      console.error('Error obtaining access token:', error.response.data);
    } else {
      console.error('Error obtaining access token:', error.message);
    }
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

// tokenManagement function to handle the token process
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
    validateEnvFile(); // Validate if .env file exists
    validateAndAddCodeVerifier(); // Add code_verifier if needed
    console.error('Error in the main process:', error);
  }
  console.log("Token is ready for work");
};

tokenManagement();

module.exports = {
  getToken,
  refreshTokenFn,
  writeEnvFile,
  tokenManagement
};

