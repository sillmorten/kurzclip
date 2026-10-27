import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export const DATA_DIR = path.resolve(process.env.DATA_DIR || "./data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

export type User = {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  is_creator: number;
  stripe_customer_id: string | null;
  created_at: string;
};

export type Video = {
  id: number;
  creator_id: number;
  title: string;
  description: string;
  duration: number;
  file: string;
  mime: string;
  poster: string | null;
  created_at: string;
};

export type VideoRow = Video & { creator_name: string; views: number; likes: number };

export type Subscription = {
  user_id: number;
  status: string;
  plan: string;
  current_period_end: string | null;
  stripe_subscription_id: string | null;
};

const g = globalThis as unknown as { __kcdb?: Database.Database };

function open() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const db = new Database(path.join(DATA_DIR, "kurzclip.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      is_creator INTEGER NOT NULL DEFAULT 0,
      stripe_customer_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      creator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      duration REAL NOT NULL,
      file TEXT NOT NULL,
      mime TEXT NOT NULL,
      poster TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS views (
      viewer_key TEXT NOT NULL,
      video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (viewer_key, video_id)
    );
    CREATE TABLE IF NOT EXISTS likes (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, video_id)
    );
    CREATE TABLE IF NOT EXISTS subscriptions (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      status TEXT NOT NULL,
      plan TEXT NOT NULL,
      current_period_end TEXT,
      stripe_subscription_id TEXT
    );
  `);
  return db;
}

export function db() {
  if (!g.__kcdb) g.__kcdb = open();
  return g.__kcdb;
}

const VIDEO_SELECT = `
  SELECT v.*, u.name AS creator_name,
    (SELECT COUNT(*) FROM views w WHERE w.video_id = v.id) AS views,
    (SELECT COUNT(*) FROM likes l WHERE l.video_id = v.id) AS likes
  FROM videos v JOIN users u ON u.id = v.creator_id`;

export function listVideos(sort: "neu" | "beliebt" = "neu"): VideoRow[] {
  const order = sort === "beliebt" ? "views DESC, likes DESC, v.id DESC" : "v.id DESC";
  return db().prepare(`${VIDEO_SELECT} ORDER BY ${order}`).all() as VideoRow[];
}

export function getVideo(id: number): VideoRow | undefined {
  return db().prepare(`${VIDEO_SELECT} WHERE v.id = ?`).get(id) as VideoRow | undefined;
}

export function videosByCreator(userId: number): VideoRow[] {
  return db().prepare(`${VIDEO_SELECT} WHERE v.creator_id = ? ORDER BY v.id DESC`).all(userId) as VideoRow[];
}

export function likedVideos(userId: number): VideoRow[] {
  return db()
    .prepare(`${VIDEO_SELECT} JOIN likes lk ON lk.video_id = v.id AND lk.user_id = ? ORDER BY v.id DESC`)
    .all(userId) as VideoRow[];
}

export function getUserById(id: number) {
  return db().prepare("SELECT * FROM users WHERE id = ?").get(id) as User | undefined;
}

export function getUserByEmail(email: string) {
  return db().prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) as User | undefined;
}

export function getSubscription(userId: number) {
  return db().prepare("SELECT * FROM subscriptions WHERE user_id = ?").get(userId) as Subscription | undefined;
}

export function setSubscription(sub: Subscription) {
  db()
    .prepare(
      `INSERT INTO subscriptions (user_id, status, plan, current_period_end, stripe_subscription_id)
       VALUES (@user_id, @status, @plan, @current_period_end, @stripe_subscription_id)
       ON CONFLICT(user_id) DO UPDATE SET status = excluded.status, plan = excluded.plan,
         current_period_end = excluded.current_period_end,
         stripe_subscription_id = COALESCE(excluded.stripe_subscription_id, subscriptions.stripe_subscription_id)`
    )
    .run(sub);
}

export function hasLiked(userId: number, videoId: number) {
  return !!db().prepare("SELECT 1 FROM likes WHERE user_id = ? AND video_id = ?").get(userId, videoId);
}
