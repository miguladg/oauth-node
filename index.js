const axios = require('axios');
const qs = require('querystring');
const fs = require('fs');
require('dotenv').config();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;
const authorizationCode = process.env.AUTHORIZATION_CODE;
const codeVerifier = process.env.CODE_VERIFIER;
const tokenUrl = 'https://api.mercadolibre.com/oauth/token';

// Función para obtener el token de acceso utilizando el código de autorización
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

// Función para actualizar el token utilizando el refresh token
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
      console.error('Error al obtener el nuevo token de acceso:', error.response.data);
    } else {
      console.error('Error al obtener el nuevo token de acceso:', error.message);
    }
    throw error;
  }
};

// Función para escribir tokens en el archivo .env
const writeEnvFile = (accessToken, refreshToken) => {
  // Leer el contenido actual del archivo .env
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

  // Verificar si las variables no existen y agregarlas
  if (!envVars.some(line => line.startsWith('ACCESS_TOKEN='))) {
    newEnvVars.push(`ACCESS_TOKEN=${accessToken}`);
  }
  if (!envVars.some(line => line.startsWith('REFRESH_TOKEN='))) {
    newEnvVars.push(`REFRESH_TOKEN=${refreshToken}`);
  }

  // Escribir el contenido actualizado en el archivo .env
  fs.writeFileSync(envFilePath, newEnvVars.join('\n'), (err) => {
    if (err) {
      console.error('Error al escribir el archivo .env:', err);
    } else {
      console.log('Archivo .env actualizado exitosamente');
    }
  });
};

// Función principal para obtener y actualizar tokens
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
    console.error('Error en el proceso principal:', error);
  }
  console.log("token is ready for work");
};

module.exports = main;