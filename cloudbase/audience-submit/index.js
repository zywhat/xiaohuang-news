const tcb = require("@cloudbase/node-sdk");

const app = tcb.init({
  env: tcb.SYMBOL_DEFAULT_ENV
});
const db = app.database();

const ALLOWED_RANKS = new Set([
  "御前首席夸夸大学士",
  "尚食局奶茶总管",
  "殿前开心侍读",
  "起居注温柔史官",
  "翰林院表情包编修",
  "内务府拖鞋巡抚"
]);

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(body)
  };
}

function readBody(event) {
  if (!event.body) return {};

  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;

  if (typeof rawBody === "object") return rawBody;
  return JSON.parse(rawBody);
}

function cleanText(value, limit) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

exports.main = async (event) => {
  const method = event.httpMethod || event.requestContext?.http?.method || "POST";

  if (method === "OPTIONS") {
    return json(204, {});
  }

  if (method !== "POST") {
    return json(405, { ok: false, message: "Only POST is allowed." });
  }

  let payload;
  try {
    payload = readBody(event);
  } catch {
    return json(400, { ok: false, message: "Invalid JSON body." });
  }

  const name = cleanText(payload.name, 30);
  const rank = cleanText(payload.rank, 40);
  const requestedAt = cleanText(payload.requestedAt, 40);
  const message = cleanText(payload.message, 800);
  const submittedAt = cleanText(payload.submittedAt, 40) || new Date().toISOString();

  if (!name || !rank || !requestedAt || !message) {
    return json(400, { ok: false, message: "Missing required fields." });
  }

  if (!ALLOWED_RANKS.has(rank)) {
    return json(400, { ok: false, message: "Invalid bestowed rank." });
  }

  const fullMemorial = [
    "启奏小黄大王：臣闻圣颜一展，万物生辉。今谨具短笺，伏愿大王垂览：",
    message,
    `谨此奏闻，伏候圣裁。臣${name}叩首敬上。`
  ].join("\n");

  const result = await db.collection("audience_submissions").add({
    name,
    rank,
    requestedAt,
    message,
    fullMemorial,
    submittedAt,
    createdAt: db.serverDate(),
    source: "xiaohuang-news"
  });

  return json(200, {
    ok: true,
    id: result.id || result._id
  });
};
