// routes/notes.js
const express = require("express");
const Note = require("../models/Note");
const auth = require("../middleware/auth");

const router = express.Router();

// ใช้ middleware auth กับทุก route ใต้ /notes
router.use(auth);

// GET /notes
router.get("/", async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.userId }).lean();

    const safeNotes = notes.map((n) => ({
      id: n._id,
      text: n.text,
    }));

    res.json(safeNotes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get notes" });
  }
});

// POST /notes
router.post("/", async (req, res) => {
  try {
    const text = req.body.note;
    if (!text) {
      return res.status(400).json({ error: "Note is required" });
    }

    const created = await Note.create({ userId: req.userId, text });
    const note = { id: created._id, text: created.text };

    res.json({ message: "Note added", note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add note" });
  }
});

// PUT /notes/:id - แก้ไขโน้ต
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const text = req.body.note;

    if (!text) {
      return res.status(400).json({ error: "Note is required" });
    }

    const updated = await Note.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { text },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Note not found" });
    }

    const note = { id: updated._id, text: updated.text };
    res.json({ message: "Note updated", note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update note" });
  }
});


// DELETE /notes/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const deleted = await Note.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!deleted) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json({ message: "Note deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

module.exports = router; // 👈 สำคัญมาก
