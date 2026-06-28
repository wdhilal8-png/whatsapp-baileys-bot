import express from "express";
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";
import P from "pino";

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (_, res) => {
  res.send("WhatsApp Bot Running");
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: P({ level: "silent" }),
    browser: ["Ubuntu", "Chrome", "22.0.0"],
    printQRInTerminal: false
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection }) => {

    if (connection === "connecting") {

      const code = await sock.requestPairingCode("249125270800");

      console.log("=================================");
      console.log("PAIRING CODE:", code);
      console.log("=================================");
    }

    if (connection === "close") {
      startBot();
    }

    if (connection === "open") {
      console.log("✅ WhatsApp Connected");
    }
  });
}

startBot();
