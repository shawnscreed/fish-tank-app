// scripts/generateTypes.js
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const tableName = process.argv[2];
if (!tableName) {
  console.error('❌ Please provide a table name. Usage: node scripts/generateTypes.js <tableName>');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const typeMap = {
  'integer': 'number',
  'bigint': 'number',
  'smallint': 'number',
  'numeric': 'number',
  'real': 'number',
  'double precision': 'number',
  'text': 'string',
  'character varying': 'string',
  'varchar': 'string',
  'boolean': 'boolean',
  'timestamp without time zone': 'string',
  'timestamp with time zone': 'string',
  'date': 'string',
};

async function generateInterface() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);

    if (result.rows.length === 0) {
      console.error('❌ Table not found or has no columns.');
      process.exit(1);
    }

    const interfaceName = tableName
      .split(/[^a-zA-Z0-9]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');

    const fields = result.rows.map((col) => {
      const tsType = typeMap[col.data_type] || 'any';
      const optional = col.is_nullable === 'YES' ? '?' : '';
      return `  ${col.column_name}${optional}: ${tsType};`;
    });

    const content = `
export interface ${interfaceName} {
${fields.join('\n')}
}
`.trim();

    const outDir = path.join(__dirname, '..', 'src', 'types');
    const outPath = path.join(outDir, `${tableName}.ts`);

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outPath, content, 'utf8');

    console.log(`✅ Generated: src/types/${tableName}.ts`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error generating interface:', err.message);
    process.exit(1);
  }
}

generateInterface();
