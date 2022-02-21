var express = require('express');
const { check, validationResult } = require('express-validator')
var bcrypt = require('bcryptjs');
var router = express.Router();
var superAdminHelper = require('../helpers/superAdmin-helpers')
/* GET home page. */
router.get('/', async function(req, res, next) {
  let result= await superAdminHelper.fetchData()
  let totalDistricts= await superAdminHelper.countDistrict()
  let totalMuncipality= await superAdminHelper.countMuncipality()
  let totalPanchayaths= await superAdminHelper.countPanchayath()
  let totalClinics= await superAdminHelper.countClinincs()
  let totalPending= await superAdminHelper.countPending()
  res.render('superAdminPages/superAdmin', {result, totalDistricts, totalMuncipality, totalPanchayaths, totalClinics, totalPending})
})  

router.get('/addDistricts', function(req, res, next) {
  superAdminHelper.fetchDistricts(req.body).then((response)=>{
    res.render('superAdminPages/addDistricts', {response})
  }) 
 });

 router.post("/addDistricts", function (req, res, next) {
  superAdminHelper.addDistricts(req.body).then((response)=>{
     res.redirect('/superAdmin/addDistricts')
   }) 
});

router.get("/deleteDistrict/:id", function (req, res, next) {
  let myID =req.params.id
  superAdminHelper.deleteDistrict(myID).then((response)=>{
    res.redirect('/superAdmin/addDistricts')
   }) 
});

router.get('/fetchDistForMuncipalites', function(req, res, next) {  
  superAdminHelper.fetchDistForMuncipalites(req.body).then((response)=>{
    let dist = response.distRespo
    let munc = response.muncRespo
    res.render('superAdminPages/addMuncipalities', {dist, munc})
  }) 
});

router.get('/addMuncipalites', function(req, res, next) {  
    superAdminHelper.fetchMuncipalities(req.body).then((response)=>{
      res.redirect('/superAdmin/fetchDistForMuncipalites')
    }) 
 });

 router.post('/addMuncipality', function(req, res, next) {  
  superAdminHelper.addMuncipalities(req.body).then((response)=>{
    res.redirect('/superAdmin/fetchDistForMuncipalites')
  }) 
 });

 router.get("/deleteMuncipalites/:id", function (req, res, next) {
  let myID =req.params.id
  superAdminHelper.deleteMuncipalites(myID).then((response)=>{
    res.redirect('/superAdmin/fetchDistForMuncipalites')
   }) 
});

router.get('/fetchPanchayaths', function(req, res, next) {  
  superAdminHelper.fetchPanchayaths(req.body).then((response)=>{
    let munc = response.muncRespo
    console.log('------------------------------------------------', munc)
    let panchayath = response.punchRespo
    res.render('superAdminPages/addPanchayaths', {panchayath, munc})
  }) 
});


router.get('/addPanchayaths', function(req, res, next) {

  res.render('superAdminPages/addPanchayaths')
 });

 router.post('/addPanchayaths', function(req, res, next) {  
  superAdminHelper.addPanchayaths(req.body).then((response)=>{
    res.redirect('/superAdmin/fetchPanchayaths')
  }) 
 });

 router.get("/deletePanchayath/:id", function (req, res, next) {
  let myID =req.params.id
  superAdminHelper.deletepachayath(myID).then((response)=>{
    res.redirect('/superAdmin/fetchPanchayaths')
   }) 
});

router.get('/addClinics', async function(req, res, next) {
  let result= await superAdminHelper.fetchClinics()
  res.render('superAdminPages/addClinics', {result})
})  

router.post('/addClinic', function(req, res, next) {  
  superAdminHelper.addClinic(req.body).then((response)=>{
    res.redirect('addClinics')
  }) 
 });

 router.get("/editClinic/:id", function (req, res, next) {
  let myID =req.params.id
  superAdminHelper.editClinic(myID).then((response)=>{
    res.render('superAdminPages/editClinic', {response})
   }) 
});

router.post("/updateClinic", function (req, res, next) {
  let clinicName =req.body
  superAdminHelper.udateClinic(clinicName).then((response)=>{
    res.redirect('addClinics')
   }) 
});

router.get("/deleteClinic/:id", function (req, res, next) {
  let myID =req.params.id
  superAdminHelper.deleteClinic(myID).then((response)=>{
    res.redirect('/superAdmin/addClinics')
   }) 
});


router.get("/fetchAllClinics", function (req, res, next) {
   superAdminHelper.fetchAllClinics().then((response)=>{
    res.render('superAdminPages/fetchAllClinics', {response})
   }) 
});

router.get("/block/:status", function (req, res, next) {
  let status =req.params.status
  superAdminHelper.blockSite(status).then((response)=>{
    res.redirect('/superAdmin/fetchAllClinics')
   }) 
});

router.get("/blockedClinics", function (req, res, next) {
  // let status =req.params.status
  superAdminHelper.fetchBlockedClinics().then((response)=>{
    res.render('superAdminPages/blockedClinics', {response})
   }) 
});

router.get("/unBlock/:status", function (req, res, next) {
  let status =req.params.status
  superAdminHelper.unBlock(status).then((response)=>{
    res.redirect('/superAdmin/fetchAllClinics')
   }) 
});

   module.exports = router;
