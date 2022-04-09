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

  router.get('/medicineProvider/:clinicName', async function(req, res, next) {
    let fetchedclinicName = req.params.clinicName
    await clinicAdminHelper.fetchMedicineProvider(fetchedclinicName).then((fecthedmedCompanies)=>{
      res.render('clinicDashBoard/medicineProvider', {fecthedmedCompanies, name:fecthedmedCompanies[0].clinicName} )
    })
  }) 
  
  router.post('/addMedicineProvider', async function(req, res, next) {
    await clinicAdminHelper.addMedicineProvider(req.body).then((medCompanies)=>{
      const NAME=medCompanies[0].clinicName
      res.redirect(`/clinicDashBoard/medicineProvider/${NAME}`)
    })
  })

  router.post('/addMedicine', async function(req, res, next) {
    await clinicAdminHelper.addMedicine(req.body).then((addedMedicines)=>{
      const name=req.body.clinicName
      res.redirect(`/clinicDashBoard/medicineManagement/${name}`)
    })
  })

  router.get('/medicineManagement/:clinicName', async function(req, res, next) {
    let fetchedclinicName = req.params.clinicName
    await clinicAdminHelper.medicineManagement(fetchedclinicName).then(({department, company})=>{
      res.render('clinicDashBoard/medicineManagement', {department,fetchedclinicName, company} )
    })     
  }) 

  router.get('/prescribedPrescription', async function(req, res, next) {
    const year = new Date();
    const month = new Date();
    var thisMonth = month.getMonth() + 1

    const date = new Date()
    var thisDate = date.getDate()

    if(thisDate < 10){
    thisDate = '0'+ thisDate
    }

    if(thisMonth < 10){
    thisMonth = '0'+ thisMonth
    }
    var todayDate = year.getFullYear()+'-'+ thisMonth+'-'+thisDate;
    
    await clinicAdminHelper.prescripedMedicine(todayDate).then((fetchedPrescription) => {     
        var cName=fetchedPrescription[0].clinic      
      res.render('clinicDashBoard/prescriptionAll', {fetchedPrescription, cName})
    }) 
  })

  router.post('/addDoctor', async function(req, res, next) {
    let clinicAdminLogin= await clinicAdminHelper.clinicAddDoctor(req.body).then((allDoctors)=>{
      res.redirect('/clinicDashBoard')
    })    
  }) 

  router.get("/individualPrescription/:id", async function (req, res, next) {
    let myID =req.params.id
    clinicAdminHelper.getIndividualPrescription(myID).then((response)=>{
      res.render('clinicDashBoard/personalPrescription', response)
     }) 
  });

  router.get("/deleteClinicDoctors/:id", function (req, res, next) {
    let myID =req.params.id
    console.log("--------------------------------", myID)
    clinicAdminHelper.deleteClinicDoctors(myID).then((response)=>{
      res.redirect('/clinicDashBoard')
     }) 
  });

  router.get("/editClinicDoctors/:id", function (req, res, next) {
    let myID =req.params.id
    clinicAdminHelper.editClinicDoctors(myID).then((response)=>{
      res.render('clinicDashBoard/editDoctorsPage', response)
     }) 
  });
  
  router.post("/updateClinicDoctors", function (req, res, next) {
    clinicAdminHelper.updateClinicDoctors(req.body).then((response)=>{
      res.redirect('/clinicDashBoard')
     }) 
  });

module.exports = router;