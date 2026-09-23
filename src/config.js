import "dotenv/config";

export const config = {
  botName: process.env.BOT_NAME || "PrivateBot",
  ownerNumber: (process.env.OWNER_NUMBER || "").replace(/\D/g, ""),
  prefix: process.env.PREFIX || "!"
};
