const fs = require("fs");
const path = require("path");

console.log("🔍 Verificando configuración de providers dinámicos...\n");

// Verificar que los archivos de esquema existan
const schemaFiles = ["schema.sqlite.prisma", "schema.postgresql.prisma", "schema.mysql.prisma"];

console.log("📁 Verificando archivos de esquema:");
schemaFiles.forEach((file) => {
  const filePath = path.join(__dirname, "..", "prisma", file);
  const exists = fs.existsSync(filePath);
  console.log(`  ${exists ? "✅" : "❌"} ${file}`);
});

// Verificar el schema.prisma actual
const currentSchema = path.join(__dirname, "..", "prisma", "schema.prisma");
if (fs.existsSync(currentSchema)) {
  const content = fs.readFileSync(currentSchema, "utf8");
  const providerMatch = content.match(/provider = "(\w+)"/);

  if (providerMatch) {
    console.log(`\n🎯 Provider actual: ${providerMatch[1]}`);
  }
}

// Verificar scripts en package.json
const packageJson = path.join(__dirname, "..", "package.json");
if (fs.existsSync(packageJson)) {
  const packageContent = JSON.parse(fs.readFileSync(packageJson, "utf8"));
  const scripts = packageContent.scripts;

  console.log("\n🔧 Scripts disponibles:");
  const dbScripts = Object.keys(scripts).filter((key) => key.startsWith("db:"));
  dbScripts.forEach((script) => {
    console.log(`  ✅ ${script}`);
  });
}

console.log("\n🎉 Verificación completada!");
