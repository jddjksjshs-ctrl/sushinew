"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const ADMIN_PASS = process.env.ADMIN_PASS || "admin";
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const CATS = ["\u0421\u0435\u0442\u0438", "\u0420\u043e\u043b\u0438", "\u041d\u0430\u043f\u043e\u0457", "\u0421\u0443\u0448\u0456-\u0424'\u044e\u0436\u043d"];
const EMO = { "\u0421\u0435\u0442\u0438": "\ud83c\udf71", "\u0420\u043e\u043b\u0438": "\ud83c\udf63", "\u041d\u0430\u043f\u043e\u0457": "\ud83e\udd64", "\u0421\u0443\u0448\u0456-\u0424'\u044e\u0436\u043d": "\ud83c\udf2f" };
const SEED = [
  {id:1,name:"\u0424\u0456\u043b\u0430\u0434\u0435\u043b\u044c\u0444\u0456\u044f \u0441\u0435\u0442",cat:"\u0421\u0435\u0442\u0438",price:489,desc:"32 \u0448\u043c\u0430\u0442\u043e\u0447\u043a\u0438: \u0444\u0456\u043b\u0430\u0434\u0435\u043b\u044c\u0444\u0456\u044f, \u043a\u0430\u043b\u0456\u0444\u043e\u0440\u043d\u0456\u044f, \u0437 \u043b\u043e\u0441\u043e\u0441\u0435\u043c",emo:"\ud83c\udf71",tag:"\u0425\u0406\u0422",img:""},
  {id:2,name:"\u0414\u0440\u0430\u043a\u043e\u043d \u0441\u0435\u0442",cat:"\u0421\u0435\u0442\u0438",price:559,desc:"40 \u0448\u043c\u0430\u0442\u043e\u0447\u043a\u0456\u0432 \u0430\u0441\u043e\u0440\u0442\u0456 \u0437 \u0432\u0443\u0433\u0440\u0435\u043c \u0442\u0430 \u043a\u0440\u0435\u0432\u0435\u0442\u043a\u043e\u044e",emo:"\ud83c\udf71",tag:"NEW",img:""},
  {id:3,name:"\u0412\u0435\u0433\u0430\u043d \u0441\u0435\u0442",cat:"\u0421\u0435\u0442\u0438",price:399,desc:"24 \u0448\u043c\u0430\u0442\u043e\u0447\u043a\u0438 \u0437 \u043e\u0432\u043e\u0447\u0430\u043c\u0438 \u0442\u0430 \u0430\u0432\u043e\u043a\u0430\u0434\u043e",emo:"\ud83e\udd57",tag:"",img:""},
  {id:4,name:"\u0411\u043e\u043e\u043c \u0441\u0435\u0442 XXL",cat:"\u0421\u0435\u0442\u0438",price:799,desc:"56 \u0448\u043c\u0430\u0442\u043e\u0447\u043a\u0456\u0432 \u2014 \u0434\u043b\u044f \u0432\u0435\u043b\u0438\u043a\u043e\u0457 \u043a\u043e\u043c\u043f\u0430\u043d\u0456\u0457",emo:"\ud83c\udf71",tag:"XXL",img:""},
  {id:5,name:"\u0424\u0456\u043b\u0430\u0434\u0435\u043b\u044c\u0444\u0456\u044f \u043a\u043b\u0430\u0441\u0456\u043a",cat:"\u0420\u043e\u043b\u0438",price:219,desc:"\u041b\u043e\u0441\u043e\u0441\u044c, \u0432\u0435\u0440\u0448\u043a\u043e\u0432\u0438\u0439 \u0441\u0438\u0440, \u043e\u0433\u0456\u0440\u043e\u043a",emo:"\ud83c\udf63",tag:"\u0425\u0406\u0422",img:""},
  {id:6,name:"\u041a\u0430\u043b\u0456\u0444\u043e\u0440\u043d\u0456\u044f",cat:"\u0420\u043e\u043b\u0438",price:199,desc:"\u041a\u0440\u0430\u0431, \u0430\u0432\u043e\u043a\u0430\u0434\u043e, \u0456\u043a\u0440\u0430 \u0442\u043e\u0431\u0456\u043a\u043e",emo:"\ud83c\udf63",tag:"",img:""},
  {id:7,name:"\u0422\u0435\u043c\u043f\u0443\u0440\u0430 \u0437 \u043a\u0440\u0435\u0432\u0435\u0442\u043a\u043e\u044e",cat:"\u0420\u043e\u043b\u0438",price:239,desc:"\u0425\u0440\u0443\u0441\u0442\u043a\u0438\u0439 \u0440\u043e\u043b \u0443 \u043a\u043b\u044f\u0440\u0456 \u0437 \u043a\u0440\u0435\u0432\u0435\u0442\u043a\u043e\u044e",emo:"\ud83c\udf64",tag:"",img:""},
  {id:8,name:"\u0417\u0430\u043f\u0435\u0447\u0435\u043d\u0438\u0439 \u0437 \u0432\u0443\u0433\u0440\u0435\u043c",cat:"\u0420\u043e\u043b\u0438",price:259,desc:"\u0422\u0435\u043f\u043b\u0438\u0439 \u0440\u043e\u043b \u043f\u0456\u0434 \u0441\u043e\u0443\u0441\u043e\u043c \u0443\u043d\u0430\u0433\u0456",emo:"\ud83d\udd25",tag:"NEW",img:""},
  {id:9,name:"\u041a\u043e\u043a\u0430-\u041a\u043e\u043b\u0430 0.5\u043b",cat:"\u041d\u0430\u043f\u043e\u0457",price:45,desc:"\u0425\u043e\u043b\u043e\u0434\u043d\u0438\u0439 \u0433\u0430\u0437\u043e\u0432\u0430\u043d\u0438\u0439 \u043d\u0430\u043f\u0456\u0439",emo:"\ud83e\udd64",tag:"",img:""},
  {id:10,name:"\u0417\u0435\u043b\u0435\u043d\u0438\u0439 \u0447\u0430\u0439",cat:"\u041d\u0430\u043f\u043e\u0457",price:55,desc:"\u041a\u043b\u0430\u0441\u0438\u0447\u043d\u0438\u0439 \u044f\u043f\u043e\u043d\u0441\u044c\u043a\u0438\u0439 \u0441\u0435\u043d\u0447\u0430",emo:"\ud83c\udf75",tag:"",img:""},
  {id:11,name:"\u041b\u0438\u043c\u043e\u043d\u0430\u0434 \u043c\u0430\u043d\u0433\u043e-\u043c\u0430\u0440\u0430\u043a\u0443\u0439\u044f",cat:"\u041d\u0430\u043f\u043e\u0457",price:75,desc:"\u0414\u043e\u043c\u0430\u0448\u043d\u0456\u0439 \u043e\u0441\u0432\u0456\u0436\u0430\u044e\u0447\u0438\u0439 \u043b\u0438\u043c\u043e\u043d\u0430\u0434",emo:"\ud83e\uddc3",tag:"NEW",img:""},
  {id:12,name:"\u0421\u0443\u0448\u0456-\u0431\u0443\u0440\u0433\u0435\u0440 \u0437 \u043b\u043e\u0441\u043e\u0441\u0435\u043c",cat:"\u0421\u0443\u0448\u0456-\u0424'\u044e\u0436\u043d",price:179,desc:"\u0411\u0443\u043b\u043e\u0447\u043a\u0438 \u0437 \u0440\u0438\u0441\u0443, \u043b\u043e\u0441\u043e\u0441\u044c, \u0441\u043e\u0443\u0441 \u0441\u043f\u0430\u0439\u0441\u0456",emo:"\ud83c\udf54",tag:"\u0425\u0406\u0422",img:""},
  {id:13,name:"\u0421\u0443\u0448\u0456-\u0448\u0430\u0443\u0440\u043c\u0430 \u0437 \u043a\u0443\u0440\u043a\u043e\u044e",cat:"\u0421\u0443\u0448\u0456-\u0424'\u044e\u0436\u043d",price:159,desc:"\u041d\u043e\u0440\u0456-\u043b\u0430\u0432\u0430\u0448, \u043a\u0443\u0440\u043a\u0430 \u0442\u0435\u0440\u0456\u044f\u043a\u0456, \u043e\u0432\u043e\u0447\u0456",emo:"\ud83c\udf2f",tag:"NEW",img:""},
  {id:14,name:"\u0421\u0443\u0448\u0456-\u0442\u0430\u043a\u043e\u0441 \u0437 \u0442\u0443\u043d\u0446\u0435\u043c",cat:"\u0421\u0443\u0448\u0456-\u0424'\u044e\u0436\u043d",price:189,desc:"\u0425\u0440\u0443\u0441\u0442\u043a\u0430 \u043d\u043e\u0440\u0456-\u0442\u043e\u0440\u0442\u0438\u043b\u044c\u044f \u0437 \u0442\u0443\u043d\u0446\u0435\u043c",emo:"\ud83c\udf2e",tag:"",img:""}
];

let db = null;
function loadDB() {
  try { db = JSON.parse(fs.readFileSync(DB_FILE, "utf8")); } catch { db = null; }
  if (!db || typeof db !== "object") db = {};
  if (!Array.isArray(db.menu) || !db.menu.length) db.menu = SEED.map((x) => ({ ...x }));
  if (!Array.isArray(db.orders)) db.orders = [];
  if (!Array.isArray(db.users)) db.users = [];
  if (!Array.isArray(db.notifs)) db.notifs = [];
  if (!db.sessions || typeof db.sessions !== "object") db.sessions = {};
  if (!Array.isArray(db.adminTokens)) db.adminTokens = [];
  if (!db.seq || typeof db.seq !== "object") db.seq = {};
  if (typeof db.seq.order !== "number") db.seq.order = 1000 + db.orders.length;
  saveDB();
}
function saveDB() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function rid() { return crypto.randomBytes(8).toString("hex"); }
function fmtMoney(n) { try { return Number(n).toLocaleString("uk-UA") + " \u20b4"; } catch { return n + " \u20b4"; } }
function bearer(req) { const h = req.headers["authorization"] || ""; return h.startsWith("Bearer ") ? h.slice(7) : null; }
function userEmail(req) { const t = bearer(req); return t && db.sessions[t] ? db.sessions[t] : null; }
function isAdmin(req) { const t = bearer(req); return !!(t && db.adminTokens.includes(t)); }

function send(res, code, obj) {
  if (code === 204) { res.writeHead(204); return res.end(); }
  const body = JSON.stringify(obj);
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let d = "", size = 0;
    req.on("data", (c) => { size += c.length; if (size > 12 * 1024 * 1024) { reject(new Error("too large")); req.destroy(); } else { d += c; } });
    req.on("end", () => { if (!d) return resolve({}); try { resolve(JSON.parse(d)); } catch { reject(new Error("bad json")); } });
    req.on("error", reject);
  });
}

const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".json": "application/json; charset=utf-8", ".webp": "image/webp" };
function serveStatic(req, res) {
  let p = decodeURIComponent((req.url.split("?")[0]) || "/");
  if (p === "/") p = "/index.html";
  const fp = path.join(PUBLIC_DIR, path.normalize(p));
  if (!fp.startsWith(PUBLIC_DIR)) { res.writeHead(403); return res.end("Forbidden"); }
  fs.readFile(fp, (err, buf) => {
    if (err) {
      fs.readFile(path.join(PUBLIC_DIR, "index.html"), (e2, idx) => {
        if (e2) { res.writeHead(404); res.end("Not found"); }
        else { res.writeHead(200, { "Content-Type": MIME[".html"] }); res.end(idx); }
      });
      return;
    }
    const ext = path.extname(fp).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(buf);
  });
}

const server = http.createServer(async (req, res) => {
  const u = (req.url || "/").split("?")[0];
  if (!u.startsWith("/api/")) return serveStatic(req, res);
  const method = req.method || "GET";
  let body = {};
  if (["POST", "PATCH", "PUT", "DELETE"].includes(method)) {
    try { body = await readBody(req); } catch (e) { return send(res, 400, { error: "\u041d\u0435\u043a\u043e\u0440\u0435\u043a\u0442\u043d\u0456 \u0434\u0430\u043d\u0456 \u0437\u0430\u043f\u0438\u0442\u0443" }); }
  }
  try {
    // ---- Public: menu ----
    if (u === "/api/menu" && method === "GET") return send(res, 200, db.menu);

    // ---- Public: create order ----
    if (u === "/api/orders" && method === "POST") {
      const email = userEmail(req);
      const items = Array.isArray(body.items) ? body.items : [];
      if (!body.name || !body.phone || !body.addr || !items.length) return send(res, 400, { error: "\u041d\u0435\u043a\u043e\u0440\u0435\u043a\u0442\u043d\u0435 \u0437\u0430\u043c\u043e\u0432\u043b\u0435\u043d\u043d\u044f" });
      const cleanItems = items.map((i) => ({ name: String(i.name), qty: Number(i.qty) || 1, price: Number(i.price) || 0, mods: Array.isArray(i.mods) ? i.mods.map((m) => String(m)).slice(0, 10) : [] }));
      const total = cleanItems.reduce((s, i) => s + i.price * i.qty, 0);
      const order = { id: "SB-" + (++db.seq.order), uid: email, name: String(body.name), phone: String(body.phone), addr: String(body.addr), fulfillment: body.fulfillment ? String(body.fulfillment) : "\u0414\u043e\u0441\u0442\u0430\u0432\u043a\u0430", persons: Number(body.persons) > 0 ? Number(body.persons) : 1, cutlery: Number(body.cutlery) > 0 ? Number(body.cutlery) : 1, deliveryTime: body.deliveryTime ? String(body.deliveryTime) : "", note: body.note ? String(body.note) : "", payment: body.payment ? String(body.payment) : "\u041a\u0430\u0440\u0442\u043a\u0430 \u043e\u043d\u043b\u0430\u0439\u043d", items: cleanItems, total, status: "new", date: new Date().toISOString() };
      db.orders.unshift(order);
      db.notifs.unshift({ id: rid(), read: false, title: "\u041d\u043e\u0432\u0435 \u0437\u0430\u043c\u043e\u0432\u043b\u0435\u043d\u043d\u044f " + order.id, text: order.name + " \u2022 " + fmtMoney(order.total) + " \u2022 " + cleanItems.reduce((s, i) => s + i.qty, 0) + " \u043f\u043e\u0437.", date: order.date });
      saveDB();
      return send(res, 201, order);
    }

    // ---- Auth ----
    if (u === "/api/auth/register" && method === "POST") {
      const { name, phone, email, pass } = body;
      if (!name || !email || !pass || String(pass).length < 4) return send(res, 400, { error: "\u0417\u0430\u043f\u043e\u0432\u043d\u0456\u0442\u044c \u0443\u0441\u0456 \u043f\u043e\u043b\u044f, \u043f\u0430\u0440\u043e\u043b\u044c \u0432\u0456\u0434 4 \u0441\u0438\u043c\u0432\u043e\u043b\u0456\u0432" });
      if (db.users.find((x) => x.email === email)) return send(res, 409, { error: "\u0422\u0430\u043a\u0438\u0439 email \u0432\u0436\u0435 \u0437\u0430\u0440\u0435\u0454\u0441\u0442\u0440\u043e\u0432\u0430\u043d\u0438\u0439" });
      const user = { name: String(name), phone: String(phone || ""), email: String(email), pass: String(pass) };
      db.users.push(user);
      const token = rid() + rid(); db.sessions[token] = user.email; saveDB();
      return send(res, 201, { token, user: { name: user.name, phone: user.phone, email: user.email } });
    }
    if (u === "/api/auth/login" && method === "POST") {
      const { email, pass } = body;
      const user = db.users.find((x) => x.email === email && x.pass === String(pass));
      if (!user) return send(res, 401, { error: "\u041d\u0435\u0432\u0456\u0440\u043d\u0438\u0439 email \u0430\u0431\u043e \u043f\u0430\u0440\u043e\u043b\u044c" });
      const token = rid() + rid(); db.sessions[token] = user.email; saveDB();
      return send(res, 200, { token, user: { name: user.name, phone: user.phone, email: user.email } });
    }
    if (u === "/api/me/orders" && method === "GET") {
      const email = userEmail(req);
      if (!email) return send(res, 401, { error: "\u041d\u0435 \u0430\u0432\u0442\u043e\u0440\u0438\u0437\u043e\u0432\u0430\u043d\u043e" });
      return send(res, 200, db.orders.filter((o) => o.uid === email));
    }

    // ---- Admin ----
    if (u === "/api/admin/login" && method === "POST") {
      if (String(body.pass) !== ADMIN_PASS) return send(res, 401, { error: "\u041d\u0435\u0432\u0456\u0440\u043d\u0438\u0439 \u043f\u0430\u0440\u043e\u043b\u044c" });
      const token = rid() + rid(); db.adminTokens.push(token);
      if (db.adminTokens.length > 50) db.adminTokens = db.adminTokens.slice(-50);
      saveDB();
      return send(res, 200, { token });
    }
    if (u === "/api/admin/data" && method === "GET") {
      if (!isAdmin(req)) return send(res, 401, { error: "\u041d\u0435 \u0430\u0432\u0442\u043e\u0440\u0438\u0437\u043e\u0432\u0430\u043d\u043e" });
      return send(res, 200, { orders: db.orders, notifs: db.notifs, menu: db.menu });
    }
    if (u === "/api/menu" && method === "POST") {
      if (!isAdmin(req)) return send(res, 401, { error: "\u041d\u0435 \u0430\u0432\u0442\u043e\u0440\u0438\u0437\u043e\u0432\u0430\u043d\u043e" });
      if (!body.name || !(Number(body.price) > 0)) return send(res, 400, { error: "\u0412\u043a\u0430\u0436\u0456\u0442\u044c \u043d\u0430\u0437\u0432\u0443 \u0442\u0430 \u0446\u0456\u043d\u0443" });
      const id = Math.max(0, ...db.menu.map((m) => Number(m.id) || 0)) + 1;
      const cat = String(body.cat || CATS[0]);
      const item = { id, name: String(body.name), cat, price: Number(body.price), desc: String(body.desc || ""), emo: body.emo ? String(body.emo) : (EMO[cat] || "\ud83c\udf63"), tag: body.tag ? String(body.tag) : "", img: body.img ? String(body.img) : "" };
      db.menu.push(item); saveDB();
      return send(res, 201, item);
    }
    const mMenu = u.match(/^\/api\/menu\/(\d+)$/);
    if (mMenu) {
      if (!isAdmin(req)) return send(res, 401, { error: "\u041d\u0435 \u0430\u0432\u0442\u043e\u0440\u0438\u0437\u043e\u0432\u0430\u043d\u043e" });
      const id = Number(mMenu[1]);
      const item = db.menu.find((m) => m.id === id);
      if (!item) return send(res, 404, { error: "\u041f\u043e\u0437\u0438\u0446\u0456\u044e \u043d\u0435 \u0437\u043d\u0430\u0439\u0434\u0435\u043d\u043e" });
      if (method === "PATCH") {
        if (body.name !== undefined) item.name = String(body.name);
        if (body.cat !== undefined) item.cat = String(body.cat);
        if (body.price !== undefined && Number(body.price) > 0) item.price = Number(body.price);
        if (body.desc !== undefined) item.desc = String(body.desc);
        if (body.emo !== undefined) item.emo = String(body.emo);
        if (body.tag !== undefined) item.tag = String(body.tag);
        if (body.img !== undefined) item.img = String(body.img);
        saveDB();
        return send(res, 200, item);
      }
      if (method === "DELETE") { db.menu = db.menu.filter((m) => m.id !== id); saveDB(); return send(res, 204); }
    }
    const mOrd = u.match(/^\/api\/orders\/(.+)$/);
    if (mOrd && method === "PATCH") {
      if (!isAdmin(req)) return send(res, 401, { error: "\u041d\u0435 \u0430\u0432\u0442\u043e\u0440\u0438\u0437\u043e\u0432\u0430\u043d\u043e" });
      const id = decodeURIComponent(mOrd[1]);
      const o = db.orders.find((x) => x.id === id);
      if (!o) return send(res, 404, { error: "\u0417\u0430\u043c\u043e\u0432\u043b\u0435\u043d\u043d\u044f \u043d\u0435 \u0437\u043d\u0430\u0439\u0434\u0435\u043d\u043e" });
      if (body.status) o.status = String(body.status);
      saveDB();
      return send(res, 200, o);
    }
    if (u === "/api/notifs/read" && method === "POST") {
      if (!isAdmin(req)) return send(res, 401, { error: "\u041d\u0435 \u0430\u0432\u0442\u043e\u0440\u0438\u0437\u043e\u0432\u0430\u043d\u043e" });
      db.notifs.forEach((n) => (n.read = true)); saveDB();
      return send(res, 200, { ok: true });
    }
    if (u === "/api/notifs" && method === "DELETE") {
      if (!isAdmin(req)) return send(res, 401, { error: "\u041d\u0435 \u0430\u0432\u0442\u043e\u0440\u0438\u0437\u043e\u0432\u0430\u043d\u043e" });
      db.notifs = []; saveDB();
      return send(res, 204);
    }
    return send(res, 404, { error: "\u041c\u0430\u0440\u0448\u0440\u0443\u0442 \u043d\u0435 \u0437\u043d\u0430\u0439\u0434\u0435\u043d\u043e" });
  } catch (e) {
    return send(res, 500, { error: "\u041f\u043e\u043c\u0438\u043b\u043a\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0430" });
  }
});

loadDB();
server.listen(PORT, () => {
  console.log("Sushi Boom \u0441\u0435\u0440\u0432\u0435\u0440 \u0437\u0430\u043f\u0443\u0449\u0435\u043d\u043e: http://localhost:" + PORT);
  console.log("\u0410\u0434\u043c\u0456\u043d-\u043f\u0430\u0440\u043e\u043b\u044c (ADMIN_PASS): " + ADMIN_PASS);
});
