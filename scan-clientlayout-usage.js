// 📄 File: scan-clientlayout-usage.js
import fs from "fs";
import path from "path";

const rootDir = "./src";
const searchTag = "<ClientLayout";
const wrapperComponentName = "ClientLayoutWrapper";
const clientLayoutImport = 'from "@/components/ClientLayout"';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath, callback);
    } else {
      callback(fullPath);
    }
  });
}

console.log("🔍 Scanning for incorrect <ClientLayout user={...}> usage...\n");

walkDir(rootDir, (filePath) => {
  if (filePath.endsWith(".tsx")) {
    const content = fs.readFileSync(filePath, "utf8");

    const isUsingClientLayoutJSX = content.includes(searchTag) && content.includes("user={");
    const isImportingClientLayout = content.includes(clientLayoutImport);
    const isUsingWrapper = content.includes(wrapperComponentName);

    if (isUsingClientLayoutJSX && isImportingClientLayout && !isUsingWrapper) {
      console.warn(`❌ Invalid usage in: ${filePath}`);
    }
  }
});
