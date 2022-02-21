var express = require('express');
const { check, validationResult } = require('express-validator')
var bcrypt = require('bcryptjs');
var router = express.Router();
var clinicAdminHelper = require('../helpers/clinicAdmin-helpers')
/* GET home page. */
router.get('/', async function(req, res, next) {
  let fetchClinic= await clinicAdminHelper.fetchClinic()
  res.render('clinicDashBoard/clinicLogin', {fetchClinic})
}) 

router.post('/fetchSelectedClinicData', async function(req, res, next) {
    let fetchSelectedClinic= await clinicAdminHelper.fetchSelectedClinic(req.body)
    res.render('clinicDashBoard/clinicAdminPanel', {fetchSelectedClinic})
  }) 
  
  router.post('/clinicAdminLogin', async function(req, res, next) {
    let clinicAdminLogin= await clinicAdminHelper.clinicAdminLogin(req.body)
    console.log(clinicAdminLogin)
    if(clinicAdminLogin.status){
        res.render('clinicDashBoard/clinicAdminPanel', {clinicAdminLogin})
    }else{
        res.redirect('/clinicDashBoard')
    }    
  }) 

  router.get('/doctorsManagement/:clinicName', async function(req, res, next) {
    let fetchedclinicName = req.params.clinicName
     res.render('clinicDashBoard/doctorsManagement', {fetchedclinicName})
  }) 

  router.post('/addDoctor', async function(req, res, next) {
    let clinicAdminLogin= await clinicAdminHelper.clinicAddDoctor(req.body).then((allDoctors)=>{
      res.redirect('/clinicDashBoard')
    })
    
  }) 

  router.get("/deleteClinicDoctors/:id", function (req, res, next) {
    let myID =req.params.id
    console.log("--------------------------------", myID)
    clinicAdminHelper.deleteClinicDoctors(myID).then((response)=>{
      res.redirect('/clinicDashBoard')
     }) 
  });



module.exports = router;