import type { NotesType } from "./types/Notes";

export default class NotesAPI {
  static getAllNotes() {
    const notes = JSON.parse(localStorage.getItem("notesapp-notes") || "[]");

    return notes.sort((a: NotesType, b: NotesType) => {
      return new Date(a.updated) > new Date(b.updated) ? -1 : 1;
    });
  }

  static saveNote(noteToSave: NotesType) {
    const notes = NotesAPI.getAllNotes();
    const existing = notes.find((note: NotesType) => note.id === noteToSave.id);

    // Edit/Update
    if (existing) {
      existing.title = noteToSave.title;
      existing.body = noteToSave.body;
      existing.updated = new Date().toISOString();
    } else {
      noteToSave.id = Math.floor(Math.random() * 1000000);
      noteToSave.updated = new Date().toISOString();
      notes.push(noteToSave);
    }

    localStorage.setItem("notesapp-notes", JSON.stringify(notes));
  }

  static deleteNote(id: number) {
    const notes = NotesAPI.getAllNotes();
    const newNotes = notes.filter((note: NotesType) => note.id != id);

    localStorage.setItem("notesapp-notes", JSON.stringify(newNotes));
  }

  static multipleUpdateNote(noteToSave: NotesType[]) {
    const notes = JSON.parse(localStorage.getItem("notesapp-notes") || "[]");
    // filter the data have same id from final data
    // what if the array have multiple same id but different body or title?
    const newNotes = Array.from(
      new Set([...notes, ...noteToSave].map((item) => item.id))
    )
      .map((id) => {
        return [...notes, ...noteToSave].find((item) => item.id === id);
      })
      .sort((a: NotesType, b: NotesType) => {
        return new Date(a.updated) > new Date(b.updated) ? -1 : 1;
      });
    localStorage.setItem("notesapp-notes", JSON.stringify(newNotes));
  }
}
