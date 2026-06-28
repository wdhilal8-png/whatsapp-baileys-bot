import express from "express";
import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";
import P from "pino";

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (_, res) => {
  res.send("WhatsApp Pairing Bot Running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: P({ level: "silent" }),
    printQRInTerminal: false
  });

  sock.ev.on("creds.update", saveCreds);

  if (!sock.authState.creds.registered) {
    const phone = "249125270800"; // اكتب رقمك هنا بصيغة 249xxxxxxxxx

    const code = await sock.requestPairingCode(phone);

    console.log("===========================");
    console.log("PAIRING CODE:", code);
    console.log("===========================");
  }

  sock.ev.on("connection.update", ({ connection }) => {
    if (connection === "open") {
      console.log("✅ WhatsApp Connected");
    }

    if (connection === "close") {
      console.log("❌ Connection Closed");
      startBot();
    }
  });
}

startBot();
