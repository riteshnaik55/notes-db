require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const notesRoutes = require("./routes/notes");
const app = express();

app.use(cors());

app.use(express.json());

app.use(
 cors({
 origin: [
 "http://localhost:5173",
 "https://notes-3drehro9g-riteshnaiks-projects.vercel.app/",
 ],
 })
);

app.use("/api/notes", notesRoutes);

mongoose.connect(process.env.MONGO_URI);
module.exports = app;