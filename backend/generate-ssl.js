const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const certDir = path.join(__dirname, "cert");
const keyPath = path.join(certDir, "key.pem");
const certPath = path.join(certDir, "cert.pem");

const CERT_VALIDITY_DAYS = 365;

function certExists() {
  return fs.existsSync(certPath) && fs.existsSync(keyPath);
}

function certExpired() {
  try {
    const expiryStr = execSync(`openssl x509 -enddate -noout -in "${certPath}"`)
      .toString()
      .trim();
    const expiryDate = new Date(expiryStr.replace("notAfter=", ""));
    return expiryDate < new Date();
  } catch {
    return true;
  }
}

function generateCert() {
  console.log("🔑 Generating self-signed SSL certificate...");

  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir);
  }

  execSync(
    `openssl req -x509 -nodes -days ${CERT_VALIDITY_DAYS} -newkey rsa:2048 \
    -keyout "${keyPath}" \
    -out "${certPath}" \
    -subj "/C=US/ST=State/L=City/O=Company/CN=localhost"`,
    { stdio: "inherit" }
  );

  console.log("✅ SSL certificate generated successfully!");
}

function trustCert() {
  const platform = os.platform();

  try {
    if (platform === "darwin") {
      console.log("🔒 Adding certificate to macOS trusted store...");
      execSync(
        `sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain "${certPath}"`,
        { stdio: "inherit" }
      );
      console.log("✅ Certificate trusted on macOS!");
    } else if (platform === "win32") {
      console.log("🔒 Adding certificate to Windows trusted store...");
      execSync(`certutil -addstore -f "Root" "${certPath}"`, { stdio: "inherit" });
      console.log("✅ Certificate trusted on Windows!");
    } else {
      console.log("⚠️ Linux detected — please manually trust the certificate:");
      console.log(`   sudo cp ${certPath} /usr/local/share/ca-certificates/localhost.crt`);
      console.log("   sudo update-ca-certificates");
    }
  } catch {
    console.error("❌ Failed to trust certificate automatically. Run as Administrator or manually trust it.");
  }
}

// ------------------------ MAIN ------------------------
if (!certExists()) {
  generateCert();
  trustCert();
} else if (certExpired()) {
  console.log("⚠️ Existing certificate expired. Regenerating...");
  generateCert();
  trustCert();
} else {
  console.log("✅ Certificate already exists and is valid — skipping generation.");
}
