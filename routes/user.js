var db = require('../config/connection')
var express = require('express');
const { check, validationResult } = require('express-validator')
var bcrypt = require('bcryptjs');
var router = express.Router();
var userHelper = require('../helpers/product-helpers')
/* GET home page. */
router.get('/', async function(req, res, next) {
   await userHelper.fetchClinics().then((result)=>{
    console.log(result)
    res.render('index', {result})
});

})  
router.post('/submit', async function (req,res){
   let clinicAdminLogin= await userHelper.addNewUser(req.body).then((allDoctors)=>{
      res.render('logedUser')
    })
   
})

router.post('/login', async function (req,res){
   let clinicAdminLogin = await userHelper.doLogin(req.body).then((allClinics)=>{
      res.render('logedUser', {allClinics})
    })
   
})

router.get('/fetchDoctors/:clinicName/:whatsapp', async function(req, res, next) {
   let cName =  req.params.clinicName
   let whatsapp =  req.params.whatsapp
   await userHelper.fetchDoctors(cName, whatsapp).then(({doctors: result, user})=>{
      let newName = result[0].clinicName
      res.render('doctorsReadyForBooking', {result, newName, user})      
});
}) 

router.get('/bookings/:doctorName/:department/:newName/:name/:address/:panchayath/:whatsapp', async function(req, res, next) {
   
   var todayDate = new Date().toISOString().slice(0, 10);
   const dubbleZero = parseInt('00');
   const time = new Date();
   const bookingTime = `${dubbleZero + time.getHours()}:${dubbleZero + time.getMinutes()}`;
   req.params.token = 'Notify after booking'
   req.params.bookingDate = todayDate
   req.params.bookingTime = bookingTime
   req.params.consultingTime = 'Notify after payment'
   req.params.status = 'Not-Confirmed'
 
   await userHelper.bookings(req.params).then((data)=>{
      res.render('paymentPageForBooking', {data})      
});

}) 

   module.exports = router;

