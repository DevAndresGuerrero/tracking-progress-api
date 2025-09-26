const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuración de colores para la consola
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Proveedores de base de datos soportados
const SUPPORTED_PROVIDERS = ["sqlite", "postgresql", "mysql"];

function validateProvider(provider) {
  if (!provider) {
    log("❌ No se especificó un provider de base de datos", "red");
    log("Uso: node scripts/setup-database.js <provider>", "yellow");
    log(`Providers soportados: ${SUPPORTED_PROVIDERS.join(", ")}`, "cyan");
    process.exit(1);
  }

  if (!SUPPORTED_PROVIDERS.includes(provider)) {
    log(`❌ Provider "${provider}" no soportado`, "red");
    log(`Providers soportados: ${SUPPORTED_PROVIDERS.join(", ")}`, "cyan");
    process.exit(1);
  }

  return provider;
}

function setupDatabase(provider) {
  log(`🚀 Configurando base de datos para provider: ${provider}`, "blue");

  const prismaDir = path.join(__dirname, "..", "prisma");
  const sourceSchema = path.join(prismaDir, `schema.${provider}.prisma`);
  const targetSchema = path.join(prismaDir, "schema.prisma");

  // Verificar que el archivo de esquema fuente exista
  if (!fs.existsSync(sourceSchema)) {
    log(`❌ No se encontró el archivo de esquema: ${sourceSchema}`, "red");
    process.exit(1);
  }

  try {
    // Copiar el esquema específico del provider al schema.prisma principal
    log(`📋 Copiando ${sourceSchema} a ${targetSchema}`, "yellow");
    fs.copyFileSync(sourceSchema, targetSchema);

    log(`✅ Esquema de ${provider} configurado exitosamente`, "green");

    // Generar el cliente de Prisma
    log("🔧 Generando cliente de Prisma...", "yellow");
    execSync("npx prisma generate", { stdio: "inherit", cwd: path.join(__dirname, "..") });

    log("✅ Cliente de Prisma generado exitosamente", "green");

    // Si es SQLite, verificar que el archivo de base de datos exista
    if (provider === "sqlite") {
      const dbPath = path.join(prismaDir, "dev.db");
      if (!fs.existsSync(dbPath)) {
        log("📁 Creando archivo de base de datos SQLite...", "yellow");
        execSync("npx prisma db push", { stdio: "inherit", cwd: path.join(__dirname, "..") });
        log("✅ Base de datos SQLite creada", "green");
      }
    }

    log(`🎉 Base de datos ${provider} configurada y lista para usar`, "green");
    log("\n📝 Próximos pasos:", "cyan");
    log(`   - Asegúrate de tener la variable de entorno DATABASE_URL configurada para ${provider}`, "yellow");
    log(`   - Ejecuta las migraciones si es necesario: npx prisma migrate dev`, "yellow");
    log(`   - Si es un nuevo proyecto, ejecuta: npx prisma db seed`, "yellow");
  } catch (error) {
    log(`❌ Error durante la configuración: ${error.message}`, "red");
    process.exit(1);
  }
}

function main() {
  const provider = process.argv[2];
  const validatedProvider = validateProvider(provider);
  setupDatabase(validatedProvider);
}

// Ejecutar el script
if (require.main === module) {
  main();
}

module.exports = {
  setupDatabase,
  validateProvider,
  SUPPORTED_PROVIDERS,
};
