const dotenv = require('dotenv');
const fs = require('fs');

const envVars = dotenv.parse(fs.readFileSync('./backend/.env'));

module.exports = { envVars };
