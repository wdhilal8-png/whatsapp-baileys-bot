import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";

const { state, saveCreds } = await useMultiFileAuthState("./session");

const sock = makeWASocket({
  auth: state,
  printQRInTerminal: false
});

sock.ev.on("creds.update", saveCreds);

const phone = "249125270800"; // اكتب رقمك بصيغة 249XXXXXXXXX

if (!sock.authState.creds.registered) {
  const code = await sock.requestPairingCode(phone);
  console.log("Your Pairing Code:", code);
}
