const fs = require('fs');
const path = require('path');

// Ruta del archivo JSON descargado desde Firebase
const filePath = path.join(__dirname, 'firebase-service-account.json');

// Leer y parsear el archivo original
const raw = fs.readFileSync(filePath, 'utf8');
const json = JSON.parse(raw);

// Escapar saltos de línea del private_key
json.private_key = json.private_key.replace(/\n/g, '\\n');

// Imprimir string final para usar en .env
console.log('FIREBASE_SERVICE_ACCOUNT_KEY=' + JSON.stringify(json));
