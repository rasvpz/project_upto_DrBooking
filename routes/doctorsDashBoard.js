var db = require("../config/connection");
var express = require("express");
global.fetch = require("node-fetch");
const { check, validationResult } = require("express-validator");
const AmazonCognitoIdentity = require("amazon-cognito-identity-js");
var bcrypt = require("bcryptjs");
var router = express.Router();
var doctorHelper = require("../helpers/doctorDashBoard-helpers");
// const productHelpers = require("../helpers/product-helpers");
const config = require("../config.json");
const { Session } = require("express-session");
const { response } = require("express");

const UserPoolId = config.cognito.UserPoolId;
const ClientId = config.cognito.ClientId;

const userPool = new AmazonCognitoIdentity.CognitoUserPool({
  UserPoolId,
  ClientId,
});
/* GET home page. */
router.get("/", async function (req, res, next) {
    res.render("doctorsDashBoard/doctorsLogin");
});

router.post("/doctorsLogin", async function (req, res, next) {
      console.log('--------*****LOGIN******-----------', req.body);
    await doctorHelper.doctorsLogin(req.body).then(({data,bookingData,tablets,pills,syrups,injection,ointments,balms,packets,others}) => {
        if(data){           
             res.render("doctorsDashBoard/doctorsBookingPanel", {data, bookingData,tablets,pills,syrups,injection,ointments,balms,packets,others});
        }else{
            res.redirect('/doctorsDashBoard')
        } 
    });
 
 });

 router.get("/treatMentDetails/:clinicName", async function (req, res, next) {
    await doctorHelper.doctorsLogin(req.body).then(({data, bookingData}) => {
        res.render("doctorsDashBoard/doctorsPanel");
    });   
});

router.post("/treatMentDetails", async function (req, res, next) {
    await doctorHelper.patientHistory(req.body).then((data) => {
      res.json(data.iframe)
    });   
});

router.post("/cormodityMedicine", async function (req, res, next) {
    
 doctorHelper.cormodityMedicine(req.body).then((cormodityData) => {
      res.json(cormodityData)
    });   
});


router.get('/doctorsLogin/:cognitoId/:patientName/:whatsapp/:contact/:password',async(req,res)=>{
   console.log('******--------------******',req.params)
   await doctorHelper.doctorsLogin(req.params).then(({data,bookingData,tablets,pills,syrups,injection,ointments,balms,packets,others}) => {
    if(data){           
         res.render("doctorsDashBoard/doctorsPanel", {data, bookingData,tablets,pills,syrups,injection,ointments,balms,packets,others});
    }else{
        // res.redirect('/doctorsDashBoard')
    } 
});
})



router.post('/addPrescription',async(req,res)=>{
    var {Tablets, Injections, Pills, Ointments, Syrups, Balms, Packets, Others, tabSubTotal, injectionSubTotal, patient, patientCognitoId} = req.body

    var myReq ={}
    var medTotal = 0 

    if(Tablets !='0'){
        var myTablets ={}
        myTablets.tablets = Tablets
        myTablets.tabTimes = req.body.morning + '-' + req.body.noon + '-' + req.body.night
        myTablets.tabDose = req.body.TabletsDose
        myTablets.tabDays = req.body.TabletDays
        myTablets.tabSubTotal = Number(tabSubTotal)
        myReq.myTablet = myTablets 
        medTotal = medTotal + Number(tabSubTotal)    
    }

    if(Injections != '0'){
        var myInjections ={}
        myInjections.injection = Injections
        myInjections.injectionSubTotal = injectionSubTotal
        myReq.myInjection = myInjections 
        medTotal = medTotal + Number(myInjections.injectionSubTotal) 
    }

    if(Pills !='0'){
        var myPills ={}
        myPills.pills = Pills
        myPills.pillsTimes = req.body.pillMorning + '-' + req.body.pillNoon + '-' + req.body.pillNight
        myPills.PillDose = req.body.PillDose   
        myPills.pillDays = req.body.pillsDays
        myPills.subPillTotal = req.body.subPillsTotal
        myReq.myPill = myPills
        medTotal = medTotal + Number(myPills.subPillTotal)    
    }
    if(Ointments != '0'){
        var myOintments ={}
        myOintments.ointments = Ointments
        myOintments.subOintmentTotal = req.body.ointmentsSubTotal
        myReq.myOintment = myOintments   
        medTotal = medTotal + Number(myOintments.subOintmentTotal)        
    }
    if(Syrups != '0'){
        var mySyrups ={}
        mySyrups.syrups = Syrups
        mySyrups.syrupsTimes = req.body.SyrupsMorning + '-' + req.body.SyrupsNoon + '-' + req.body.SyrupsNight
        mySyrups.syrupsDose = req.body.SyrupsDose
        mySyrups.syrupDays = req.body.syrupsDays
        mySyrups.syrupSubTotal = Number(req.body.totalSyrup)
        myReq.mySyrup = mySyrups  
        medTotal = medTotal + Number(mySyrups.syrupSubTotal)      
    }
    if(Balms != '0'){
        var myBalms ={}
        myBalms.balms = Balms
        myBalms.balmSubTotal = req.body.balmsSubTotal
        myReq.myBalm = myBalms
        medTotal = medTotal + Number(myBalms.balmSubTotal)
    }
    if(Packets != '0'){
        var myPackets ={}
        myPackets.packets = Packets
        myPackets.packetSubTotal = req.body.packetsSubTotal
        myReq.myPacket = myPackets
        medTotal = medTotal + Number(myPackets.packetSubTotal)
    }

    if(Others != '0'){
        var myOthers ={}
        myOthers.others = Others
        myOthers.otherSubTotal = req.body.othersSubTotal
        myReq.myOthers = myOthers
        medTotal = medTotal + Number(myOthers.otherSubTotal)   
    }

    req.body.medTotal = medTotal
    
        let result = await doctorHelper.prescription(req.body, myReq)
        if(result.err){

        }else{
            res.render('')
        }
})
module.exports = router;