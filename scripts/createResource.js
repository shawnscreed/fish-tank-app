

// scripts/createResource.js
const fs = require('fs');
const path = require('path');
require('dotenv').config(); 

const resourceName = process.argv[2];

if (!resourceName) {
  console.error('❌ Please provide a resource name. Usage: node scripts/createResource.js <resourceName>');
  process.exit(1);
}

const pascalCase = resourceName
  .split(/[^a-zA-Z0-9]/)
  .map(part => part.charAt(0).toUpperCase() + part.slice(1))
  .join('');

const { Pool } = require('pg');

// Read from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function getPostgresTables() {
  const result = await db.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
  `);
  return result.rows.map(row => row.table_name);
}

function getExistingPages() {
  const appPath = path.join(__dirname, '..', 'src', 'app');
  const entries = fs.readdirSync(appPath, { withFileTypes: true });
  return entries
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

async function scaffoldMissingTables() {
  const tables = await getPostgresTables();
  const pages = getExistingPages();
  const missing = tables.filter(name => !pages.includes(name));

  for (const table of missing) {
    console.log(`📦 Scaffolding missing table: ${table}`);
    const { execSync } = require('child_process');
    execSync(`node scripts/createResource.js ${table}`, { stdio: 'inherit' });
  }
}

// --- Create page and API directories ---
const baseDir = path.join(__dirname, '..', 'src', 'app', resourceName);
const apiDir = path.join(__dirname, '..', 'src', 'app', 'api', resourceName);
const detailDir = path.join(baseDir, '[id]');
const apiDetailDir = path.join(apiDir, '[id]');

// --- Create the files ---
const files = [
  {
    path: path.join(baseDir, 'page.tsx'),
    content: `"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ${pascalCase}Page() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/${resourceName}')
      .then(res => res.json())
      .then(setItems)
      .catch(console.error);
  }, []);

  if (!items.length) return <p>No ${pascalCase} found.</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">${pascalCase}</h1>
      <table className="table-auto border w-full">
        <thead>
          <tr>
            {Object.keys(items[0]).map(key => (
              <th key={key} className="border px-2 py-1 text-left">{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} className="hover:bg-gray-100 cursor-pointer" onClick={() => window.location.href = '/${resourceName}/' + item.id}>
              {Object.values(item).map((val, i) => (
                <td key={i} className="border px-2 py-1">{String(val)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}`
  },
  {
    path: path.join(detailDir, 'page.tsx'),
    content: `"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ${pascalCase}DetailPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    fetch('/api/${resourceName}/' + params.id)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setForm(data);
      });
  }, [params.id]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const res = await fetch('/api/${resourceName}/' + params.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) router.refresh();
  };

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">${pascalCase} Detail</h1>
      <div className="grid gap-2">
        {Object.entries(form).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium">{key}</label>
            <input
              name={key}
              value={value || ''}
              onChange={handleChange}
              className="border px-2 py-1 w-full"
            />
          </div>
        ))}
        <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded mt-4">
          Save Changes
        </button>
      </div>
    </div>
  );
}`
  },
 // route.ts (collection GET)
{
  path: path.join(apiDir, 'route.ts'),
  content: `import { NextResponse } from 'next/server';
import pool from '../../../lib/db';


export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM ${resourceName} ORDER BY created_at DESC LIMIT 50');
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}`
},
  {
    path: path.join(detailDir, 'page.tsx'),
    content: `export default function ${pascalCase}DetailPage({ params }: { params: { id: string } }) {
  return <div>${pascalCase} Detail for ID: {params.id}</div>;
}`
  },
// [id]/route.ts (GET and PUT by ID)
{
  path: path.join(apiDetailDir, 'route.ts'),
  content: `import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await pool.query('SELECT * FROM ${resourceName} WHERE id = $1', [params.id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: '${pascalCase} not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  const allowedList = ${
    JSON.stringify({
      users: ['name', 'email', 'status'],
      agents: ['name', 'license_number', 'email'],
      orders: ['address', 'status', 'delivery_date'],
      clients: ['first', 'last', 'email', 'mobilephone'],
   }['${resourceName}'] || [])};

  const allowedFields = Object.keys(body).filter(key => allowedList.includes(key));

  if (allowedFields.length === 0) {
    return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
  }

  const updates = allowedFields.map((key, idx) => \\\`\${key} = \\\$\{idx + 1}\\\`).join(', ');

  const values = allowedFields.map((key) => body[key]);

  try {
    await pool.query(
     \`UPDATE ${resourceName} SET \\\${updates} WHERE id = \\\${allowedFields.length + 1}\`

      [...values, params.id]
    );
    return NextResponse.json({ message: '${pascalCase} updated' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}`
}

];

// --- Write the files ---
files.forEach(file => {
  fs.mkdirSync(path.dirname(file.path), { recursive: true });
  fs.writeFileSync(file.path, file.content, 'utf8');
});

// --- Update the sidebar in ClientLayout.tsx ---
const layoutPath = path.join(__dirname, '..', 'src', 'app', 'ClientLayout.tsx');
const newMenuItem = `  { label: '${pascalCase}', path: '/${resourceName}' },`;

if (!fs.existsSync(layoutPath)) {
  console.error('❌ ClientLayout.tsx not found. Sidebar not updated.');
  process.exit(1);
}

let layoutContent = fs.readFileSync(layoutPath, 'utf8');


// Only add if it doesn't already exist
const menuRegex = /const menuItems\s*=\s*\[\s*([\s\S]*?)\s*\]/m;

if (menuRegex.test(layoutContent) && !layoutContent.includes(newMenuItem.trim())) {

if (menuRegex.test(layoutContent) && !layoutContent.includes(newMenuItem)) {
  layoutContent = layoutContent.replace(menuRegex, (match, items) => {
    const updatedItems = items.trimEnd().replace(/,\s*$/, ''); // remove trailing comma
    return `const menuItems = [\n${updatedItems},\n${newMenuItem}\n]`;
  });

  fs.writeFileSync(layoutPath, layoutContent, 'utf8');
  console.log(`✅ Added '${pascalCase}' to ClientLayout sidebar.`);
} else {
  console.log(`ℹ️ '${pascalCase}' already exists in ClientLayout or menu not found.`);
}
if (resourceName === '--all') {
  scaffoldMissingTables();
  return;
}
}