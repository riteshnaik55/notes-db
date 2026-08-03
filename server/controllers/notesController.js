const Note = require("../models/Note");
exports.getNotes = async (req, res) => {
 try {
 const notes = await Note.find();
 res.json(notes);
 } catch (err) {
 res.status(500).json(err);
 }
};
exports.createNote = async (req, res) => {
 try {
 const note = await Note.create(req.body);
 res.status(201).json(note);
 } catch (err) {
 res.status(500).json(err);
 }
};
exports.updateNote = async (req, res) => {
 try {
 const note = await Note.findByIdAndUpdate(
 req.params.id,
 req.body,
 { new: true }
 );
 res.json(note);
 } catch (err) {
 res.status(500).json(err);
 }
};
exports.deleteNote = async (req, res) => {
 try {
 await Note.findByIdAndDelete(req.params.id);
 res.json({
 message: "Deleted"
 });
 } catch (err) {
 res.status(500).json(err);
 }
}