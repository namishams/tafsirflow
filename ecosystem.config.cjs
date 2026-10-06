// pm2 startOrReload ecosystem.config.cjs --update-env   (run as user "tafsir"; scripts/deploy.sh does this)
// Settings live OUTSIDE git, in two files on the server:
//   /srv/tafsirflow/.env.db   DATABASE_URL (written by scripts/server-setup.sh)
//   /srv/tafsirflow/.env.app  SITE_URL, ADMIN_EMAIL, ALLOW_INDEXING, SMTP_* (template created by scripts/deploy.sh)
const fs = require("fs");

function load(file) {
  const out = {};
  try {
    for (const l of fs.readFileSync(file, "utf8").split("\n")) {
      const m = l.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (m && !l.trim().startsWith("#")) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
  return out;
}

module.exports = {
  apps: [{
    name: "tafsirflow",
    script: "npm",
    args: "start",
    cwd: "/srv/tafsirflow/app",
    env: {
      NODE_ENV: "production",
      ADMIN_EMAIL: "contact@namishams.com",   // always admin once the address is confirmed
      ALLOW_INDEXING: "0",                    // "1" invites search engines (set in .env.app when the domain is live)
      ALLOW_INSECURE_AUTH: "0",               // sign-in over plain HTTP is refused; "1" only for short tests
      ...load("/srv/tafsirflow/.env.db"),
      ...load("/srv/tafsirflow/.env.app"),
    },
  }],
};
