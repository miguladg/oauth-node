const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');
const axios = require('axios');
const qs = require('querystring');

// Path to the .env file
const envFilePath = path.resolve(__dirname, '.env');

// Load environment variables from the .env file
dotenv.config({ path: envFilePath });

// Generate a code_verifier using base64url encoding
const generateCodeVerifier = () => crypto.randomBytes(32).toString('base64url');

// Function to generate a code_challenge from a code_verifier
const generateCodeChallenge = (codeVerifier) => {
  return crypto.createHash('sha256').update(codeVerifier).digest('base64url');
};

// Function to update or add a variable in the .env file
const updateEnvFile = (key, value) => {
  const envVars = fs.readFileSync(envFilePath, 'utf8').split('\n');
  let updated = false;

  const newEnvVars = envVars.map(line => {
    if (line.startsWith(`${key}=`)) {
      updated = true;
      return `${key}=${value}`;
    }
    return line;
  });

  if (!updated) {
    newEnvVars.push(`${key}=${value}`);
  }

  fs.writeFileSync(envFilePath, newEnvVars.join('\n'));
  console.log(`${key} updated in .env file.`);
};

// Function to validate the existence of the .env file
const validateEnvFile = () => {
  if (!fs.existsSync(envFilePath)) {
    console.error('Error: .env file not found. Please create a .env file in the root directory.');
    process.exit(1);
  } else {
    console.log('.env file found.');
  }
};

// Validate and set the CODE_VERIFIER and CODE_CHALLENGE
const validateAndSetCodeVerifierAndChallenge = () => {
  let codeVerifier = process.env.CODE_VERIFIER;
  let codeChallenge = process.env.CODE_CHALLENGE;

  if (!codeVerifier) {
    codeVerifier = generateCodeVerifier();
    updateEnvFile('CODE_VERIFIER', codeVerifier);
  }

  if (!codeChallenge) {
    codeChallenge = generateCodeChallenge(codeVerifier);
    updateEnvFile('CODE_CHALLENGE', codeChallenge);
  }

  return { codeVerifier, codeChallenge };
};

// Function to get authorization code URL
const getAuthorizationCodeURL = () => {
  const code = process.env.AUTHORIZATION_CODE;

  if (!code) {
    const { codeChallenge } = validateAndSetCodeVerifierAndChallenge();
    const codeUrl = `https://auth.mercadolibre.com.co/authorization?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    console.log('Please visit this URL to get the AUTHORIZATION CODE and then paste it in the .env file:');
    console.log(codeUrl);
    return null;
  }

  return code;
};

// Function to obtain the token for the first time
const getToken = async () => {
  const data = {
    grant_type: 'authorization_code',
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    code: process.env.AUTHORIZATION_CODE,
    redirect_uri: process.env.REDIRECT_URI,
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
    console.error('Error obtaining access token:', error);
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
    console.error('Error refreshing access token:', error);
    throw error;
  }
};

// Function to write tokens to the .env file
const writeEnvFile = (accessToken, refreshToken) => {
  updateEnvFile('ACCESS_TOKEN', accessToken);
  updateEnvFile('REFRESH_TOKEN', refreshToken);
};

// Token management function to handle the token process
const tokenManagement = async () => {
  validateEnvFile(); // Validate if .env file exists
  validateAndSetCodeVerifierAndChallenge(); // Validate and set code_verifier and code_challenge

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

  console.log("Token management process completed.");
};

module.exports = {
  getToken,
  refreshTokenFn,
  writeEnvFile,
  tokenManagement
};
