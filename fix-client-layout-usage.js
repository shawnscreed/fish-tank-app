// 📄 File: fix-client-layout-usage.js

import fs from "fs";
import path from "path";

const rootDir = "./src/app";
const layoutTagRegex = /<ClientLayout\s+user=\{[^}]+\}>((.|\n)*?)<\/ClientLayout>/gm;

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath, callback);
    } else if (file.endsWith(".tsx")) {
      callback(fullPath);
    }
  });
}

console.log("🔧 Replacing <ClientLayout user={...}> with <ClientLayoutWrapper>...\n");

walkDir(rootDir, (filePath) => {
  let content = fs.readFileSync(filePath, "utf8");

  if (layoutTagRegex.test(content)) {
    console.log(`✅ Updating: ${filePath}`);

    // Replace full layout with wrapper
    content = content.replace(layoutTagRegex, `<ClientLayoutWrapper>$1</ClientLayoutWrapper>`);

    // Remove any existing ClientLayout import
    content = content.replace(
      /import\s+ClientLayout.*?;\n?/g,
      ""
    );

    // Ensure ClientLayoutWrapper is imported
    if (!content.includes("ClientLayoutWrapper")) {
      content = `import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";\n` + content;
    }

    fs.writeFileSync(filePath, content, "utf8");
  }
});
