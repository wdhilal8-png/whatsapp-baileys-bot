import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";

import pino from "pino";

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      console.log("✅ WhatsApp Connected");
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      console.log("❌ Connection Closed");

      if (shouldReconnect) {
        console.log("🔄 Reconnecting...");
        startBot();
      }
    }
  });

  if (!sock.authState.creds.registered) {
    const phone = "249125270800"; // اكتب رقمك بدون +
    const code = await sock.requestPairingCode(phone);

    console.log("=================================");
    console.log("PAIRING CODE:", code);
    console.log("=================================");
  }
}

startBot();
