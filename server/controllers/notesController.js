const crypto = require("crypto");
const Note = require("../models/Note");

const ENCRYPTION_PREFIX = "enc:v1:";
const ENCRYPTION_KEY = process.env.NOTES_ENCRYPTION_KEY || process.env.JWT_SECRET || "local-dev-notes-key";

const getEncryptionKey = () => crypto.createHash("sha256").update(String(ENCRYPTION_KEY)).digest();

const encryptText = (text) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(text), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${ENCRYPTION_PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
};

const decryptText = (value) => {
  if (typeof value !== "string") return value;
  if (!value.startsWith(ENCRYPTION_PREFIX)) return value;

  try {
    const payload = value.slice(ENCRYPTION_PREFIX.length);
    const [ivBase64, tagBase64, encryptedBase64] = payload.split(":");
    if (!ivBase64 || !tagBase64 || !encryptedBase64) return value;

    const iv = Buffer.from(ivBase64, "base64");
    const tag = Buffer.from(tagBase64, "base64");
    const encrypted = Buffer.from(encryptedBase64, "base64");
    const decipher = crypto.createDecipheriv("aes-256-gcm", getEncryptionKey(), iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString("utf8");
  } catch (err) {
    console.error("Failed to decrypt note field:", err.message);
    return value;
  }
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
    const notes = await Note.find();
    res.json(notes.map(toSafeNoteResponse));
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.createNote = async (req, res) => {
  try {
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
    await Note.findByIdAndDelete(req.params.id);
    res.json({
      message: "Deleted",
    });
  } catch (err) {
    res.status(500).json(err);
  }
};