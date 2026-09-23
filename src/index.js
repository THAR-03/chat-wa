import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";

import P from "pino";
import qrcode from "qrcode-terminal";
import { config } from "./config.js";

async function startBot() {
  const { state, saveCreds } =
    await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" }),
    browser: [config.botName, "Chrome", "1.0.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\n📱 Scan QR berikut dari WhatsApp:\n");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("=================================");
      console.log(`🤖 ${config.botName}`);
      console.log("✅ WhatsApp berhasil terhubung");
      console.log(`👤 Owner: ${config.ownerNumber}`);
      console.log("=================================");
    }

    if (connection === "close") {
      const statusCode =
        lastDisconnect?.error?.output?.statusCode;

      if (statusCode === DisconnectReason.loggedOut) {
        console.log("❌ Sesi WhatsApp telah logout.");
        console.log("Hapus folder auth lalu jalankan kembali.");
      } else {
        console.log("⚠️ Koneksi terputus.");
        console.log("🔄 Menghubungkan kembali...");
        startBot();
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      const msg = messages[0];

      if (!msg?.message) return;
      if (msg.key.fromMe) return;

      const remoteJid = msg.key.remoteJid;
      if (!remoteJid) return;

      // Abaikan semua grup.
      if (remoteJid.endsWith("@g.us")) {
        console.log("🚫 Pesan group diabaikan.");
        return;
      }

      // Abaikan WhatsApp Status.
      if (remoteJid === "status@broadcast") return;

      // Hanya owner yang boleh menggunakan bot.
      const senderNumber =
        remoteJid.split("@")[0].replace(/\D/g, "");

      if (
        !config.ownerNumber ||
        senderNumber !== config.ownerNumber
      ) {
        console.log(
          `🚫 Pesan dari ${senderNumber} diabaikan.`
        );
        return;
      }

      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        msg.message.videoMessage?.caption ||
        "";

      const messageText = text.trim();
      if (!messageText) return;

      console.log(`📩 Owner: ${messageText}`);

      const prefix = config.prefix;

      if (messageText === `${prefix}menu`) {
        await sock.sendMessage(remoteJid, {
          text:
`╭───「 ${config.botName} 」───
│
│ 👋 Halo Owner!
│
│ ${prefix}menu
│ ${prefix}ping
│ ${prefix}halo
│
╰────────────────`
        });
        return;
      }

      if (messageText === `${prefix}ping`) {
        await sock.sendMessage(remoteJid, {
          text: "🏓 Pong!"
        });
        return;
      }

      if (messageText === `${prefix}halo`) {
        await sock.sendMessage(remoteJid, {
          text:
            "Halo Owner 👋\nBot aktif dan siap digunakan."
        });
        return;
      }

      const lowerText = messageText.toLowerCase();

      if (
        lowerText === "halo" ||
        lowerText === "hai" ||
        lowerText === "hi"
      ) {
        await sock.sendMessage(remoteJid, {
          text:
            `Halo Owner 👋\n\n` +
            `${config.botName} aktif.\n` +
            `Ketik ${prefix}menu untuk melihat perintah.`
        });
        return;
      }

      await sock.sendMessage(remoteJid, {
        text:
          `📩 Pesan diterima.\n\n` +
          `Kamu mengirim:\n"${messageText}"\n\n` +
          `Ketik ${prefix}menu untuk melihat perintah.`
      });

    } catch (error) {
      console.error("❌ Error:", error);
    }
  });
}

console.log("🚀 Memulai WhatsApp Private Bot...");
startBot().catch((error) => {
  console.error("❌ Gagal menjalankan bot:", error);
});
