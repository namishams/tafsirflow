// pm2 start ecosystem.config.cjs   (run as user "tafsir"; loads DATABASE_URL from /srv/tafsirflow/.env.db)
const fs = require("fs");
const env = {};
try {
  for (const l of fs.readFileSync("/srv/tafsirflow/.env.db", "utf8").split("\n")) {
    const m = l.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2];
  }
} catch {}
module.exports = {
  apps: [{
    name: "tafsirflow",
    script: "npm",
    args: "start",
    cwd: "/srv/tafsirflow/app",
    env: {
      NODE_ENV: "production",
      // The account with this e-mail is always admin. Register it yourself right after deploying.
      ADMIN_EMAIL: "contact@namishams.com",
      // Sign-in over plain HTTP is refused (passwords would travel unencrypted). For short tests only: "1".
      ALLOW_INSECURE_AUTH: "0",
      ...env,
    },
  }],
};
