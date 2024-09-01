const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();
const axios = require('axios');
const qs = require('querystring');
const { response } = require('express');



// Path to the .env file
const envFilePath = path.resolve(__dirname, '.env'); // We need to create varible for de user put in the index code

// Function to validate the existence of the .env file and add code_verifier if it doesn't exist
const validateAndAddCodeVerifier = () => {
  // Check if the .env file exists
  if (!fs.existsSync(envFilePath)) {
    console.error('Error: .env file not found. Please create a .env file in the root directory.');
    process.exit(1);
  }

// Function to generate a code_verifier
const generateCodeVerifier = () => {
  return crypto.randomBytes(32).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
};

  // Load environment variables from the .env file
  require('dotenv').config({ path: envFilePath });


  function validateAndAddCodeVerifier (codeVerifierGenerator) {

    const codeVerifier = process.env.CODE_VERIFIER;

    if (!codeVerifier) {
        console.error('Error: CODE_VERIFIER is missing or empty. Please add a valid CODE_VERIFIER to your .env file.');
        const newCodeVerifier = generateCodeVerifier();

        // Cargar el archivo .env
        const envConfig = dotenv.config({ path: '.env' }).parsed;

        // Agregar o actualizar CODE_VERIFIER
        envConfig['CODE_VERIFIER'] = newCodeVerifier;

        // Crear contenido actualizado del archivo .env
        const updatedEnvContent = Object.keys(envConfig)
            .map(key => `${key}=${envConfig[key]}`)
            .join('\n');

        // Escribir el contenido actualizado al archivo .env
        fs.writeFile('.env', updatedEnvContent, (err) => {
            if (err) {
                console.error('Ocurrió un error al actualizar el archivo .env:', err);
            } else {
                console.log('CODE_VERIFIER ha sido agregado exitosamente al archivo .env.');
            }
        });

        return newCodeVerifier;
    }

    return codeVerifier;

  }

  // Check if CODE_VERIFIER exists and has a non-empty value
  const codeVerifierGenerator = validateAndAddCodeVerifier();
  
  console.log(codeVerifierGenerator, "hola")

//   // Print the function code and a sample generated value
// console.log("Sample generated value:");
// console.log(generateCodeVerifier());

  // Read the current content of the .env file
  const envVars = fs.readFileSync(envFilePath, 'utf8').split('\n');

  // Check if CODE_VERIFIER already exists in the .env file
  const existingCodeVerifier = envVars.find(line => line.startsWith('CODE_VERIFIER='));
  if (!existingCodeVerifier) {
    // Generate a new CODE_VERIFIER and add it to the .env file
    const newCodeVerifier = `CODE_VERIFIER=${generateCodeVerifier()}`;
    fs.appendFileSync(envFilePath, `\n${newCodeVerifier}`);
    console.log('CODE_VERIFIER added to .env file.');
  } else {
    console.log('CODE_VERIFIER already exists in .env file.');
  }

  console.log('CODE_VERIFIER is valid:', codeVerifier);

  // Reload the environment variables
  require('dotenv').config();
};

const client_id = process.env.CLIENT_ID
const client_secret = process.env.CLIENT_SECRET
const redirect_uri = process.env.REDIRECT_URI
const code_verifier = process.env.CODE_VERIFIER
// CODE_CHALLENGE
const method = 'S256'
const codeUrl = `https://auth.mercadolibre.com.co/authorization?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&code_challenge=${code_verifier}&code_challenge_method=${method}`

console.log(codeUrl)

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
      console.error('Error obtaining access token 1:', error.response.data);
    } else {
      console.error('Error obtaining access token:');
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
      console.error('Error obtaining access token:', response.statusMessage.data);
    } else {
      console.error('Error obtaining access token:');
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
      console.error('Error writing the .env file:');
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
    console.error('Error in the main process:');
  }
  // console.log("Token is ready for work");
};

validateAndAddCodeVerifier();

module.exports = {
  getToken: getToken,
  refreshTokenFn: refreshTokenFn, // Cambié aquí de getToken a refreshTokenFn
  writeEnvFile: writeEnvFile, // Cambié aquí de getToken a writeEnvFile
  tokenManagement: tokenManagement // Asegúrate de exportar la función correcta
};