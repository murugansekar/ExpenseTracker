const path = require('path');
const { check } = require('express-validator/check')
const express = require('express');
const Controller = require('../controllers/general');
const router = express.Router();
router.get('/', Controller.getIndex);
//router.get('/signup', Controller.GETsignup);
router.post('/signup', Controller.POSTsignup);
//check('email').isEmail().withMessage('Please enter a valid email'),
//router.get('/signin', Controller.GETsignin);
router.post('/signin', Controller.POSTsignin);


router.get('/expense', Controller.authenticate, Controller.GETexpense);
router.post('/expense', Controller.authenticate, Controller.POSTexpense);
router.delete('/deletExpense/:expenseid', Controller.authenticate, Controller.deletExpense)

router.get('/premiummembership', Controller.authenticate,Controller.purchasepremium);
router.post('/updatetransactionstatus', Controller.authenticate, Controller.updateTransactionStatus)
router.get('/TotalExpense',Controller.TotalExpense)
router.post('/premiumUserOrNOt/:token', Controller.premiumUserOrNOt);
router.get('/premiumUserOrNOt/:token', Controller.GETpremiumUserOrNOt);
router.get('/pdfGenerate',Controller.pdfGenerate)
router.get('/user/downloadFile',Controller.authenticate, Controller.downloadFile)

router.post('/password/forgotpassword',Controller.forgotpassword)
router.get('/password/updatepassword/:resetpasswordid', Controller.updatepassword)
router.get('/password/resetpassword/:id', Controller.resetpassword);

router.get('/setITEMS_PER_PAGE/:rowSize',Controller.setITEMS_PER_PAGE);


module.exports = router;
