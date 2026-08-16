const crypto = require("crypto");
const mongoose = require("mongoose");
const Note = require("../models/Note");

const ENCRYPTION_PREFIX = "enc:v1:";

const ensureDatabaseReady = (res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: "Database unavailable. Check MONGO_URI in the production environment.",
    });
  }

  return null;
};
const LEGACY_KEYS = ["local-dev-notes-key", "notes-local-dev-key", "notes-app-secret", "my_safe_encryption_key_for_database"];

const getEncryptionKeys = () => {
  const configuredKeys = (process.env.NOTES_ENCRYPTION_KEYS || "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);

  const keys = [
    ...configuredKeys,
    process.env.NOTES_ENCRYPTION_KEY,
    process.env.JWT_SECRET,
    ...LEGACY_KEYS,
  ].filter((key) => typeof key === "string" && key.trim().length > 0);

  return [...new Set(keys.map((key) => String(key).trim()))];
};

const getEncryptionKey = (key) => crypto.createHash("sha256").update(String(key)).digest();

const encryptText = (text) => {
  const primaryKey = getEncryptionKeys()[0] || "local-dev-notes-key";
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(primaryKey), iv);
  const encrypted = Buffer.concat([cipher.update(String(text), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${ENCRYPTION_PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
};

const decryptText = (value) => {
  if (typeof value !== "string") return value;
  if (!value.startsWith(ENCRYPTION_PREFIX)) return value;

  const payload = value.slice(ENCRYPTION_PREFIX.length);
  const [ivBase64, tagBase64, encryptedBase64] = payload.split(":");
  if (!ivBase64 || !tagBase64 || !encryptedBase64) return value;

  const iv = Buffer.from(ivBase64, "base64");
  const tag = Buffer.from(tagBase64, "base64");
  const encrypted = Buffer.from(encryptedBase64, "base64");

  for (const key of getEncryptionKeys()) {
    try {
      const decipher = crypto.createDecipheriv("aes-256-gcm", getEncryptionKey(key), iv);
      decipher.setAuthTag(tag);

      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
      return decrypted.toString("utf8");
    } catch (err) {
      // Try the next configured key if this one does not match the original encryption key.
    }
  }

  console.error("Failed to decrypt note field: no matching decryption key found.");
  return value;
};

const toSafeNoteResponse = (note) => {
  const noteObject = note.toObject ? note.toObject() : note;

  return {
    ...noteObject,
    title: decryptText(noteObject.title),
    content: decryptText(noteObject.content),
  };
};

exports.getNotes = async (req, res) => {
  try {
    const databaseError = ensureDatabaseReady(res);
    if (databaseError) return databaseError;

    const notes = await Note.find();
    res.json(notes.map(toSafeNoteResponse));
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.createNote = async (req, res) => {
  try {
    const databaseError = ensureDatabaseReady(res);
    if (databaseError) return databaseError;

    const noteData = {
      ...req.body,
      title: encryptText(req.body.title),
      content: encryptText(req.body.content),
    };

    const note = await Note.create(noteData);
    res.status(201).json(toSafeNoteResponse(note));
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.updateNote = async (req, res) => {
  try {
    const databaseError = ensureDatabaseReady(res);
    if (databaseError) return databaseError;

    const updateData = {};

    if (req.body.title !== undefined) {
      updateData.title = encryptText(req.body.title);
    }

    if (req.body.content !== undefined) {
      updateData.content = encryptText(req.body.content);
    }

    const note = await Note.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(toSafeNoteResponse(note));
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const databaseError = ensureDatabaseReady(res);
    if (databaseError) return databaseError;

    await Note.findByIdAndDelete(req.params.id);
    res.json({
      message: "Deleted",
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.encryptText = encryptText;
exports.decryptText = decryptText;