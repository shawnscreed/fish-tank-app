// hash.js
const bcrypt = require('bcrypt');

async function run() {
  const hash = await bcrypt.hash("changeme", 10);
  console.log("Hashed password:", hash);
}

run();

