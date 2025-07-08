const express = require('express');

const bookController = require('../controllers/book.controller')
const nxbController = require('../controllers/nxb.controller')
const staffController = require('../controllers/staff.controller');
const readerController = require('../controllers/reader.controller');
const libraryServiceController = require('../controllers/libraryService.controller');
const router = express.Router();
// router book
router.route('/book')  
  .post(bookController.createSach)
  .get(bookController.findAll)
  .delete(bookController.deleteAll);

router.get('/book/:id', bookController.findOne);
router.delete('/book/:id', bookController.delete);
router.get('/book/nxb/:id', bookController.findByNXB);
router.put('/book/:id', bookController.update);

// router nxb
router.route('/nxb')
  .post(nxbController.createNXB)
  .get(nxbController.findAll);

router.get('/nxb/:id', nxbController.findOne);
router.delete('/nxb/:id', nxbController.delete);
router.put('/nxb/:id', nxbController.update);

// router staff
router.route('/staff')
  .post(staffController.create)
  .get(staffController.findAll);



router.get('/staff/:id', staffController.findOne);
router.post('/staff/login', staffController.login)
router.put('/staff/:id', staffController.updateInfo);
router.put('/staff/:id/password', staffController.changePassword);
router.delete('/staff/:id', staffController.delete);

//router reader

router.route('/reader')
  .post(readerController.create)
  .get(readerController.findAll);

router.get('/reader/:id', readerController.findOne);
router.put('/reader/:id', readerController.updateInfo);
router.put('/reader/:id/password', readerController.changePassword);
router.post('/reader/login', readerController.login);
router.delete('/reader/:id', readerController.delete);

//router library service
router.route('/libraryService')
  .post(libraryServiceController.borrowRequest)
  .get(libraryServiceController.findAllBorrowRequests);


router.route('/libraryService/:id')
  .get(libraryServiceController.findBorrowRequestById)
  .delete(libraryServiceController.deleteBorrowRequest)
  
router.route('/libraryService/approve') 
  .put(libraryServiceController.approveRequest);
router.route('/libraryService/rejected')
  .put(libraryServiceController.rejectRequest);
router.route('/libraryService/status/:status') 
  .get(libraryServiceController.findRequestByStatus)








module.exports = router;
