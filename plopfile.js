// plopfile.js
const path = require('path');
const fs = require('fs');

module.exports = function (plop) {
  // 🔧 Resource Generator
  plop.setGenerator('resource', {
    description: 'Generate a resource (list + detail + API routes)',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Resource name (e.g., fish):'
      }
    ],
    actions: function (data) {
      const exec = require('child_process').execSync;
      try {
        exec(`node scripts/createResource.js ${data.name}`, { stdio: 'inherit' });
        return [`✅ Resource "${data.name}" generated using your script.`];
      } catch (err) {
        return [`❌ Error running scaffold script: ${err.message}`];
      }
    }
  });

  // 🔁 Regenerator
  plop.setGenerator('regen', {
    description: 'Regenerate resource files',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Resource name (e.g., fish):'
      },
      {
        type: 'checkbox',
        name: 'parts',
        message: 'What would you like to regenerate?',
        choices: [
          { name: 'List page', value: 'list' },
          { name: 'Detail page', value: 'detail' },
          { name: 'API routes', value: 'api' },
          { name: 'Type interface', value: 'types' },
          { name: 'Form component', value: 'form' },
          { name: 'SQL table file', value: 'sql' }
        ]
      }
    ],
    actions: function (data) {
      const { execSync } = require('child_process');
      const actions = [];

      if (data.parts.includes('list') || data.parts.includes('detail') || data.parts.includes('api')) {
        actions.push(() => {
          try {
            execSync(`node scripts/createResource.js ${data.name}`, { stdio: 'inherit' });
            return '✅ Core scaffold regenerated';
          } catch (err) {
            return '❌ Failed to run createResource.js';
          }
        });
      }

      if (data.parts.includes('types')) {
        actions.push(() => {
          try {
            execSync(`node scripts/generateTypes.js ${data.name}`, { stdio: 'inherit' });
            return '✅ Types regenerated';
          } catch (err) {
            return '❌ Failed to regenerate types';
          }
        });
      }

      if (data.parts.includes('form')) {
        actions.push(() => {
          try {
            execSync(`node scripts/generateFormComponent.js ${data.name}`, { stdio: 'inherit' });
            return '✅ Form component regenerated';
          } catch (err) {
            return '❌ Failed to regenerate form';
          }
        });
      }

      if (data.parts.includes('sql')) {
        actions.push(() => {
          try {
            execSync(`node scripts/generateSQLTable.js ${data.name}`, { stdio: 'inherit' });
            return '✅ SQL file regenerated';
          } catch (err) {
            return '❌ Failed to regenerate SQL';
          }
        });
      }

      return actions;
    }
  });

  // 🔐 Admin Tool Generator
  plop.setGenerator("admin-tool", {
    description: "Generate an admin-only tool page and API route",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Admin tool name (e.g., referral-codes):",
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/app/admin/{{dashCase name}}/page.tsx",
        templateFile: "plop-templates/admin-page.tsx.hbs",
      },
      {
        type: "add",
        path: "src/app/api/admin/{{dashCase name}}/route.ts",
        templateFile: "plop-templates/admin-api.ts.hbs",
      },
    ],
  });
};
