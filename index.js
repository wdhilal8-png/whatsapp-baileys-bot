import express from "express";
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";
import P from "pino";

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
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
    browser: ["Ubuntu", "Chrome", "22.0.0"],
    printQRInTerminal: false,
    syncFullHistory: false
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("✅ WhatsApp Connected");
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      console.log("❌ Connection Closed");

      if (shouldReconnect) {
        startBot();
      }
    }
  });
  if (!state.creds.registered) {
    const phone = "249125270800"; // ضع رقمك بصيغة 249XXXXXXXXX

    try {
      const code = await sock.requestPairingCode(phone);

      console.log("================================");
      console.log("PAIRING CODE:", code);
      console.log("================================");
    } catch (err) {
      console.error("Failed to get Pairing Code:", err);
    }
  }
}

startBot();
