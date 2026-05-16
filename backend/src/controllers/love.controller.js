const express = require('express');
const loveService = require('../services/love.service');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

/** GET /api/love/random-note (public) */
router.get('/random-note', (req, res, next) => {
  try {
    const { status, result } = loveService.getRandomNote();
    return res.status(status).json(result);
  } catch (err) { next(err); }
});

/** GET /api/love/notes (public) */
router.get('/notes', (req, res, next) => {
  try {
    const { status, result } = loveService.getAllNotes();
    return res.status(status).json(result);
  } catch (err) { next(err); }
});

/** POST /api/love/notes (add custom note) */
router.post('/notes', authMiddleware, (req, res, next) => {
  try {
    const { status, result } = loveService.addNote(req.body.content, req.body.category, req.user.id);
    return res.status(status).json(result);
  } catch (err) { next(err); }
});

/** GET /api/love/anniversaries */
router.get('/anniversaries', authMiddleware, (req, res, next) => {
  try {
    const { status, result } = loveService.getAnniversaries(req.user.id);
    return res.status(status).json(result);
  } catch (err) { next(err); }
});

/** POST /api/love/anniversaries */
router.post('/anniversaries', authMiddleware, (req, res, next) => {
  try {
    const { status, result } = loveService.addAnniversary(req.user.id, req.body);
    return res.status(status).json(result);
  } catch (err) { next(err); }
});

/** PUT /api/love/anniversaries/:id */
router.put('/anniversaries/:id', authMiddleware, (req, res, next) => {
  try {
    const { status, result } = loveService.updateAnniversary(req.user.id, parseInt(req.params.id), req.body);
    return res.status(status).json(result);
  } catch (err) { next(err); }
});

/** DELETE /api/love/anniversaries/:id */
router.delete('/anniversaries/:id', authMiddleware, (req, res, next) => {
  try {
    const { status, result } = loveService.deleteAnniversary(req.user.id, parseInt(req.params.id));
    return res.status(status).json(result);
  } catch (err) { next(err); }
});

module.exports = router;
