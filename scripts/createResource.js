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

const baseDir = path.join(__dirname, '..', 'src', 'app', resourceName);
const apiDir = path.join(__dirname, '..', 'src', 'app', 'api', resourceName);
const detailDir = path.join(baseDir, '[id]');
const apiDetailDir = path.join(apiDir, '[id]');

const files = [
// POST /api/[resource] (create)
{
  path: path.join(apiDir, 'create.ts'),
  content: `import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const keys = Object.keys(body);
  const values = Object.values(body);

  if (!keys.length) {
    return NextResponse.json({ error: 'No data provided' }, { status: 400 });
  }

  const columns = keys.join(', ');
  const placeholders = keys.map((_, i) => '$' + (i + 1)).join(', ');

  try {
    const result = await pool.query(
      \`INSERT INTO ${resourceName} (\${columns}) VALUES (\${placeholders}) RETURNING *\`,
      values
    );
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}`
},
// DELETE /api/[resource]/[id]
{
  path: path.join(apiDetailDir, 'delete.ts'),
  content: `import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await pool.query('DELETE FROM ${resourceName} WHERE id = $1', [params.id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}`
},

  {
    path: path.join(baseDir, 'page.tsx'),
    content: `"use client";
import { useEffect, useState } from 'react';

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
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ${pascalCase}DetailPage({ params }: { params: { id: string } }) {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/${resourceName}/" + params.id)
      .then((res) => res.json())
      .then((data) => {
        reset(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id, reset]);

  const onSubmit = async (formData: any) => {
    const res = await fetch("/api/${resourceName}/" + params.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      router.refresh();
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">${pascalCase} Detail</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 max-w-xl">
        {Object.keys(register()).length === 0 && <p>No editable fields available.</p>}
        {Object.keys(register()).length > 0 &&
          Object.keys(register()).map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1">{key}</label>
              <input
                {...register(key)}
                className="border rounded w-full p-2"
                placeholder={key}
              />
            </div>
          ))}

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mt-2">
          Save Changes
        </button>
      </form>
    </div>
  );
}`
  }
];

files.forEach(file => {
  fs.mkdirSync(path.dirname(file.path), { recursive: true });
  fs.writeFileSync(file.path, file.content, 'utf8');
});

// --- Update the sidebar in ClientLayout.tsx ---
const layoutPath = path.join(__dirname, '..', 'src', 'app', 'ClientLayout.tsx');
const newMenuItem = `  { name: '${pascalCase}', href: '/${resourceName}' },`;

if (!fs.existsSync(layoutPath)) {
  console.error('❌ ClientLayout.tsx not found. Sidebar not updated.');
  process.exit(1);
}

let layoutContent = fs.readFileSync(layoutPath, 'utf8');

// Matches: const menuItems = [ or const menuItems: MenuItem[] = [
const menuRegex = /const menuItems.*=\s*\[\s*([\s\S]*?)\s*\]/m;

if (menuRegex.test(layoutContent) && !layoutContent.includes(newMenuItem)) {
  layoutContent = layoutContent.replace(menuRegex, (match, items) => {
    const updatedItems = items.trimEnd().replace(/,\s*$/, '');
    return match.replace(items, `${updatedItems},\n${newMenuItem}`);
  });

  fs.writeFileSync(layoutPath, layoutContent, 'utf8');
  console.log(`✅ Injected '${pascalCase}' into ClientLayout.tsx sidebar.`);
} else {
  console.log(`ℹ️ '${pascalCase}' already exists in ClientLayout or menu not found.`);
}