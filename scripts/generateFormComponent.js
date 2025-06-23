// scripts/generateFormComponent.js
const fs = require('fs');
const path = require('path');

const tableName = process.argv[2];
if (!tableName) {
  console.error('❌ Please provide a resource name. Usage: node scripts/generateFormComponent.js <resourceName>');
  process.exit(1);
}

const interfacePath = path.join(__dirname, '..', 'src', 'types', `${tableName}.ts`);
if (!fs.existsSync(interfacePath)) {
  console.error(`❌ TypeScript interface not found at: ${interfacePath}`);
  process.exit(1);
}

const content = fs.readFileSync(interfacePath, 'utf8');
const match = content.match(/export interface (\\w+) \\{([\\s\\S]*?)\\}/);

if (!match) {
  console.error('❌ Could not parse interface.');
  process.exit(1);
}

const interfaceName = match[1];
const fieldsBlock = match[2].trim();

const excludedFields = ['id', 'created_at', 'updated_at'];
const fieldLines = fieldsBlock.split('\n').filter(line => {
  const fieldName = line.trim().split(':')[0].replace('?', '').trim();
  return !excludedFields.includes(fieldName);
});

const inputFields = fieldLines.map(line => {
  const [rawName, rawType] = line.trim().replace(';', '').split(':');
  const name = rawName.replace('?', '').trim();
  const type = rawType.trim();
  const inputType = type === 'number' ? 'number' : 'text';
  return `        <div>
          <label className="block text-sm font-medium mb-1">${name}</label>
          <input
            type="${inputType}"
            {...register("${name}")}
            className="border rounded w-full p-2"
          />
        </div>`;
}).join('\n');

const formComponent = `
import { useForm } from "react-hook-form";
import { ${interfaceName} } from "@/types/${tableName}";

export default function ${interfaceName}Form({
  defaultValues,
  onSubmit
}: {
  defaultValues?: Partial<${interfaceName}>;
  onSubmit: (data: ${interfaceName}) => void;
}) {
  const { register, handleSubmit } = useForm<${interfaceName}>({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
${inputFields}

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mt-2">
        Submit
      </button>
    </form>
  );
}
`.trim();

const outputPath = path.join(__dirname, '..', 'src', 'components', `${interfaceName}Form.tsx`);
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, formComponent, 'utf8');
console.log(`✅ Generated: src/components/${interfaceName}Form.tsx`);
