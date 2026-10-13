# SmartBali – Übergabe (nicht Teil von TafsirFlow)

Diese Datei sichert das Projekt **SmartBali** (smartbali.com), bis es ein eigenes Repo hat.
Sie hat nichts mit TafsirFlow zu tun und kann gelöscht werden, sobald `namishams/smartbali` existiert.

## Wiederherstellen
```bash
git clone smartbali-handoff/smartbali.bundle smartbali
cd smartbali   # CLAUDE.md + README.md erklären alles
```

## Offener Schritt: Deploy auf srv1733431.hstgr.cloud (62.72.32.76)
Der Server läuft zusammen mit OBC/LeadHero, deshalb nur ergänzend einrichten (siehe `deploy/server-setup.sh`).
1. Bundle per SFTP nach `/srv/smartbali/smartbali.bundle` hochladen.
2. Als root den Nutzer anlegen: `adduser --system --group --home /srv/smartbali --shell /bin/bash smartbali`
3. Klonen: `sudo -u smartbali -H git clone /srv/smartbali/smartbali.bundle /srv/smartbali/app`
4. Setup starten: `bash /srv/smartbali/app/deploy/server-setup.sh`. Das Skript holt auch das Let's-Encrypt-Zertifikat.
5. In `/srv/smartbali/app/.env` Telegram-Token (@namishams_bot), Telegram-ID und Anthropic-Key eintragen. Danach `deploy.sh` und `npm run telegram:set-webhook` ausführen.
