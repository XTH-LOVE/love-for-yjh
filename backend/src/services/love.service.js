const loveNoteDao = require('../models/loveNote.dao');
const anniversaryDao = require('../models/anniversary.dao');
const { success, error } = require('../utils/response');

class LoveService {
  /** Get a random love note */
  getRandomNote() {
    const note = loveNoteDao.getRandom();
    if (!note) {
      return { status: 404, result: error(null, 'No love notes found', 404) };
    }
    return { status: 200, result: success(note) };
  }

  /** Get all love notes */
  getAllNotes() {
    const notes = loveNoteDao.getAll();
    return { status: 200, result: success(notes) };
  }

  /** Add a custom love note */
  addNote(content, category = 'general', userId) {
    const note = loveNoteDao.create(content, category);
    return { status: 201, result: success(note, 'Love note added') };
  }

  /* Anniversaries */
  getAnniversaries(userId) {
    const items = anniversaryDao.findByUserId(userId);
    const now = new Date();
    const result = items.map(item => {
      const target = new Date(item.date);
      const diffMs = now - target;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const nextAnniversary = new Date(target);
      nextAnniversary.setFullYear(now.getFullYear());
      if (nextAnniversary < now) nextAnniversary.setFullYear(now.getFullYear() + 1);
      const daysUntilNext = Math.floor((nextAnniversary - now) / (1000 * 60 * 60 * 24));
      return {
        ...item,
        days_together: Math.max(0, diffDays),
        days_until_next: daysUntilNext,
      };
    });
    return { status: 200, result: success(result) };
  }

  addAnniversary(userId, { title, date }) {
    if (!title || !date) {
      return { status: 400, result: error(null, 'Title and date are required', 400) };
    }
    const item = anniversaryDao.create({ userId, title, date });
    return { status: 201, result: success(item, 'Anniversary added') };
  }

  updateAnniversary(userId, id, { title, date }) {
    const item = anniversaryDao.update(id, { title, date });
    if (!item) {
      return { status: 404, result: error(null, 'Anniversary not found', 404) };
    }
    return { status: 200, result: success(item, 'Anniversary updated') };
  }

  deleteAnniversary(userId, id) {
    anniversaryDao.delete(id, userId);
    return { status: 200, result: success(null, 'Anniversary deleted') };
  }
}

module.exports = new LoveService();
