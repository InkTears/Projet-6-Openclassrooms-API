const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const saucesCtrl = require('../controllers/sauces');

const router = express.Router();


router.get('/:id', auth, saucesCtrl.getOneSauce);
router.get('/', auth, saucesCtrl.getAllSauces);
router.post('/', auth, multer, saucesCtrl.createSauce);
router.put('/:id', auth, multer, saucesCtrl.modifySauce);
router.post('/:id/like', auth, saucesCtrl.likeSauce);
router.delete('/:id', auth, saucesCtrl.deleteSauce);

module.exports = router;