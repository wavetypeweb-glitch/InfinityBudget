const mongoose = require("mongoose");
const dns = require("node:dns");
const config = require("./env");

const defaultDnsServers = dns.getServers();

function isSrvDnsFailure(error) {
  return (
    config.mongoUri.startsWith("mongodb+srv://") &&
    ["EBADNAME", "ECONNREFUSED", "ETIMEOUT", "ENOTFOUND", "ESERVFAIL"].includes(error.code)
  );
}

async function connectWithCurrentDns() {
  return mongoose.connect(config.mongoUri, {
    autoIndex: !config.isProduction,
    serverSelectionTimeoutMS: 10000
  });
}

async function connectDatabase() {
  mongoose.set("strictQuery", true);

  if (typeof dns.setDefaultResultOrder === "function") {
    dns.setDefaultResultOrder("ipv4first");
  }

  if (config.dnsServers.length > 0) {
    dns.setServers(config.dnsServers);
  }

  try {
    await connectWithCurrentDns();
  } catch (error) {
    if (!isSrvDnsFailure(error) || config.dnsServers.length === 0) {
      throw error;
    }

    console.warn("MongoDB SRV lookup failed with custom DNS. Retrying with system DNS...");
    dns.setServers(defaultDnsServers);
    await connectWithCurrentDns();
  }

  return mongoose.connection;
}

async function disconnectDatabase() {
  await mongoose.connection.close();
}

module.exports = {
  connectDatabase,
  disconnectDatabase
};
