// type Catatan = {
//   id: string,
//   title: string,
//   createdAt: string,
//   updatedAt: string,
//   tags: string[],
//   body: string,
// }

const { nanoid } = require('nanoid');
const notes = require('./notes');

const addNoteHandler = (request, h) => {
  const { title, tags, body } = request.payload;

  const id = nanoid(16);
  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;
  const newNote = {
    title, tags, body, id, createdAt, updatedAt,
  };

  notes.push(newNote);

  const isSuccess = notes.filter((note) => note.id === id).length > 0;

  if (!isSuccess) {
    return h.response({
      status: 'fail',
      message: 'Catatan gagal ditambahkan',
    }).code(500);
  }

  return h.response({
    status: 'success',
    message: 'Catatan berhasil ditambahkan',
    data: {
      noteId: id,
    },
  }).code(201);
};

const getAllNotesHandler = () => ({
  status: 'success',
  data: {
    notes,
  },
});

const getNoteByIdHandler = (request, h) => {
  const note = notes.find((n) => n.id === request.params.id);

  if (!note) {
    return h.response({
      status: 'fail',
      message: 'Catatan tidak ditemukan',
    }).code(404);
  }

  return h.response({
    status: 'success',
    data: {
      note,
    },
  });
};

const editNoteByIdHandler = (request, h) => {
  const noteIndex = notes.findIndex((n) => n.id === request.params.id);

  if (noteIndex === -1) {
    return h.response({
      status: 'fail',
      message: 'Catatan tidak ditemukan',
    }).code(404);
  }

  const { title, tags, body } = request.payload;
  const updatedAt = new Date().toISOString();

  notes[noteIndex] = {
    ...notes[noteIndex],
    title,
    tags,
    body,
    updatedAt,
  };
  return h.response({
    status: 'success',
    message: 'Catatan berhasil diperbarui',
  }).code(200);
};

const deleteNoteByIdHandler = (request, h) => {
  const noteIndex = notes.findIndex((n) => n.id === request.params.id);

  if (noteIndex === -1) {
    return h.response({
      status: 'fail',
      message: 'Catatan tidak ditemukan',
    }).code(404);
  }

  notes.splice(noteIndex, 1);

  return h.response({
    status: 'success',
    message: 'Catatan berhasil dihapus',
  }).code(200);
};

module.exports = {
  addNoteHandler,
  getAllNotesHandler,
  getNoteByIdHandler,
  editNoteByIdHandler,
  deleteNoteByIdHandler,
};
