import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";
import pino from "pino";

const startBot = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection }) => {
    if (connection === "open") {
      console.log("✅ WhatsApp Connected");
    }
  });

  if (!sock.authState.creds.registered) {
    const phone = "249125764580"; // ضع رقمك مع رمز السودان
    const code = await sock.requestPairingCode(phone);
    console.log("================================");
    console.log("PAIRING CODE:", code);
    console.log("================================");
  }
};

startBot();
