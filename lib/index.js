const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

// Ruta del archivo .env
const envFilePath = path.resolve(__dirname, '.env');

const generateCodeVerifier = () => {
  return crypto.randomBytes(32).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
};

// Función para validar la existencia del archivo .env y agregar code_verifier si no existe
const validateAndAddCodeVerifier = () => {
  if (!fs.existsSync(envFilePath)) {
    console.error('Error: .env file not found. Please create a .env file in the root directory.');
    process.exit(1);
  }

  // Leer el contenido actual del archivo .env
  const envVars = fs.readFileSync(envFilePath, 'utf8').split('\n');
  
  // Verificar si el code_verifier ya existe
  let codeVerifier = envVars.find(line => line.startsWith('CODE_VERIFIER='));
  if (!codeVerifier) {
    // Generar un nuevo code_verifier y agregarlo al archivo .env
    codeVerifier = `CODE_VERIFIER=${generateCodeVerifier()}`;
    fs.appendFileSync(envFilePath, `\n${codeVerifier}`);
    console.log('CODE_VERIFIER added to .env file.');
  } else {
    console.log('CODE_VERIFIER already exists in .env file.');
  }

  // Recargar las variables de entorno
  require('dotenv').config();
};

// Llamar a la función para validar y agregar code_verifier
validateAndAddCodeVerifier();

// Continuar con el resto del código
const axios = require('axios');
const qs = require('querystring');

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;
const authorizationCode = process.env.AUTHORIZATION_CODE;
const codeVerifier = process.env.CODE_VERIFIER;
const tokenUrl = 'https://api.myApp.com/oauth/token';

// get token for first time
const getToken = async () => {
  const data = {
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code: authorizationCode,
    code_verifier: codeVerifier
  };

  try {
    const response = await axios.post(tokenUrl, qs.stringify(data), {
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
      console.error('Error al obtener el token de acceso:', error.response.data);
    } else {
      console.error('Error al obtener el token de acceso:', error.message);
    }
    throw error;
  }
};

// secon time
const refreshTokenFn = async (refreshToken) => {
  const data = {
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken
  };

  try {
    const response = await axios.post(tokenUrl, qs.stringify(data), {
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

const writeEnvFile = (accessToken, refreshToken) => {
  const envFilePath = '.env';
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
      console.error('Error al escribir el archivo .env:', err);
    } else {
      console.log('Archivo .env actualizado exitosamente');
    }
  });
};

const main = async () => {
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
    validateEnvFile(); // Validate if existe .env
    console.error('Error in main process:');
  }
  console.log("Token is ready for work");
};
module.exports = main;

main();
