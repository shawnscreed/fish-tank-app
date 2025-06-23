// scripts/generateSQLTable.js
const fs = require('fs');
const path = require('path');

const resourceName = process.argv[2];
if (!resourceName) {
  console.error('❌ Please provide a resource name. Usage: node scripts/generateSQLTable.js <resourceName>');
  process.exit(1);
}

const interfacePath = path.join(__dirname, '..', 'src', 'types', `${resourceName}.ts`);
if (!fs.existsSync(interfacePath)) {
  console.error(`❌ TypeScript interface not found at: ${interfacePath}`);
  process.exit(1);
}

const content = fs.readFileSync(interfacePath, 'utf8');
const match = content.match(/export interface (\w+) \{([\s\S]*?)\}/);

if (!match) {
  console.error('❌ Could not parse interface.');
  process.exit(1);
}

const fieldsBlock = match[2].trim();

const typeMap = {
  string: 'TEXT',
  number: 'NUMERIC',
  boolean: 'BOOLEAN'
};

const excludedFields = ['id']; // id can be added manually or by convention
const lines = fieldsBlock.split('\n').filter(line => {
  const name = line.split(':')[0].replace('?', '').trim();
  return !excludedFields.includes(name);
});

const sqlFields = lines.map(line => {
  const [rawName, rawType] = line.replace(';', '').split(':');
  const name = rawName.replace('?', '').trim();
  const tsType = rawType.trim();
  const sqlType = typeMap[tsType] || 'TEXT';
  return `  ${name} ${sqlType}`;
});

const sqlContent = [
  `CREATE TABLE "${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}" (`,
  `  id SERIAL PRIMARY KEY,`,
  ...sqlFields,
  `  ,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
  `);`
].join('\n');

const outputPath = path.join(__dirname, '..', 'migrations', `${resourceName}.sql`);
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, sqlContent, 'utf8');

console.log(`✅ SQL file generated: migrations/${resourceName}.sql`);