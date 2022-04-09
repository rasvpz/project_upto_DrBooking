var db = require("../config/connection");
var express = require("express");
global.fetch = require("node-fetch");
const { check, validationResult } = require("express-validator");
const AmazonCognitoIdentity = require("amazon-cognito-identity-js");
var bcrypt = require("bcryptjs");
var router = express.Router();
var userHelper = require("../helpers/product-helpers");
const productHelpers = require("../helpers/product-helpers");
const config = require("../config.json");
const { Session } = require("express-session");

const UserPoolId = config.cognito.UserPoolId;
const ClientId = config.cognito.ClientId;
const userPool = new AmazonCognitoIdentity.CognitoUserPool({
  UserPoolId,
  ClientId,
});
/* GET home page. */
router.get("/", async function (req, res, next) {
   await userHelper.fetchClinics().then((result) => {
      res.render("index", { result });
   });
});
router.post("/submit", async function (req, res) {

   // req.check('email', 'Invalid email').isEmail()
   // req.check('password', 'Password must be atleast 8 charecters long').isLength({ min: 8 })
   // req.check('pasword', 'Password did not match').equals(req.body['confirm-password'])
   // req.check('password', 'Password must contain a speccial charecter').matches(/[$*.{}()?"!@#%&/,><':;|_~`] /)
   // req.check('password', 'Paswword must contain a number').matches(/[0-9]/)
   // req.check('password', 'Paswword must contain a lower case letter').matches(/[a-z]/)
   // req.check('password', 'Paswword must contain a upper case letter').matches(/[A-Z]/)
   

   const email = req.body.email;
   const password = req.body.password;
   const confirmPassword = req.body.confirm_password;
 
   if (password !== confirmPassword) {
     return res.redirect("/signup?error=password");
   }
   const emailData = {
     Name: "email",
     Value: email,
   };
 
   const emailAttribute = new AmazonCognitoIdentity.CognitoUserAttribute(
     emailData
   );
     userPool.signUp(email, password, [emailAttribute], null, async(err, data) => {
     if (err) {
       return console.error(err);
     }     
     req.session.cogUserId = data.userSub
     const userDetails =  {
      cognitoId : req.session.cogUserId,
      name: req.body.name,
      email: req.body.email,
      address: req.body.address,
      panchayath: req.body.panchayath,
      whatsapp: req.body.whatsapp,
      password: req.body.password
     }     
     req.session.whatsapp = userDetails.whatsapp
     req.session.name = userDetails.name
     req.session.password = userDetails.password
     req.session.email = userDetails.email

      let clinicAdminLogin = await userHelper
     .addNewUser(userDetails,  req.session)
     .then((allClinics) => {      
      res.render('index', {message:'Please confirm email first and proccees'})
     });      
   });  
});


// router.post("/login", (req, res) => {
//   const { email, password } = req.body;
//   const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
//     {
//       Username: email,
//       Password: password,
//     }
//   );
//   const userDetails = {
//     Username: req.body.email,
//     Pool: userPool,
//   };
//   const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userDetails);
//   cognitoUser.authenticateUser(authenticationDetails, {
//     onSuccess: (data) => {
//       // console.log(data)
//       req.session.sub = data.idToken.payload.sub
//       res.render("logedUser");
//     },
//     onFailure: (err) => {
//       res.send("Error");
//     },
//   });
// });


router.get("/login", async function (req, res) {
  const { email, password } = req.session;
  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
    {
      Username: email,
      Password: req.session.password,
    }
  );
  const userDetails = {
    Username: email,
    Pool: userPool,
  };
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userDetails);
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: async(data) => {
      req.session.sub = data.idToken.payload.sub
      req.session.email = email
      req.session.password = password
      userData={email:email}
      let clinicAdminLogin = await userHelper
      .doLogin(userData, req.session)
      .then(({myClinic, bookings, data2, result}) => {
       let myStatus = data2[0]
       let mNAN = req.session.myNan
       res.render("logedUser", { myClinic, bookings, myStatus, result, mNAN});
      });
    },
    onFailure: (err) => {
      res.send("Error");
    },
  });
});

router.post("/login", async function (req, res) {
   const { email, password } = req.body;
   const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
     {
       Username: email,
       Password: password,
     }
   );
   const userDetails = {
     Username: req.body.email,
     Pool: userPool,
   };
   const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userDetails);
   cognitoUser.authenticateUser(authenticationDetails, {
     onSuccess: async(data) => {
      //  console.log('^&^&^&^&^&^&^&^&^&^&&^',data)
       req.session.sub = data.idToken.payload.sub
       req.session.email = email
       req.session.password = password
       let clinicAdminLogin = await userHelper
       .doLogin(req.body, req.session)
       .then(({myClinic, bookings, data2}) => {
        let myStatus = data2[0]
       
        res.render("logedUser", { myClinic, bookings, myStatus});
       });
     },
     onFailure: (err) => {
       res.send("Error");
     },
   });
});

router.post('/fetchPrescription',(req,res)=>{
productHelpers.prescribedDrugs(req.body).then((status)=>{ 
  req.session.myNan = true
  res.redirect("/login");
})
})

//ajax call razorpay

router.post('/paymentPrescription',(req,res)=>{
  let total = req.body.amount;
  let orderId = req.session.sub;
  
  productHelpers.generateRazorpay(orderId,total).then((response)=>{
    console.log("-----------",response)
    res.json({status:true,response})
})
})

router.post("/changePassword", (req, res) => {
   if(!req.session.sub){
     return res.redirect('/login')
   }
     const userDetails = { Username: req.session.sub, Pool: userPool }
     const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userDetails)
     cognitoUser.getSession((err, session)=>{
       if(err || !session.isValid()){
         console.error('Error', err)
         return res.redirect('/signup')
       }
       cognitoUser.changePassword(req.body['oldPassword'], req.body.password, async(err, data) => {
         if(err){
           console.error('Error from Old Password')
           return res.redirect('/login')
         }
         else{
            let clinicAdminLogin = await userHelper
            .changePassword(req.body, req.session.cogUserId)
            .then((changePasswordRespo) => {
               return res.redirect('/')
            });
         }
           console.log(data)          
       })
     })
 });

 router.post('/resetPassword', (req, res)=>{
   if(req.body.email) {
     const userDetails = { Username: req.body.email, Pool: userPool }
     const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userDetails)
 
     cognitoUser.forgotPassword({
       onSuccess: data => {
         req.session['reset-password-email'] = req.body.email
         req.session['reset-password-status'] = 'Email Sent'
         req.session['reset-password-message'] = `Check your email at ${data.CodeDeliveryDetails.Destination}`
         res.redirect('/resetPassword')
       },
       onFailure: err => {
         console.error(err)
         res.redirect('/resetPassword')
       }
     })
 
   } else {
     const userDetails = { Username: req.session['reset-password-email'], Pool: userPool }
     const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userDetails) 
     cognitoUser.confirmPassword(req.body.code, req.body.password,{
       onSuccess: async data => {
         let clinicAdminLogin = await userHelper
         .changePassword(req.body, req.session.cogUserId)
         .then((changePasswordRespo) => {
            res.redirect('/login')
         });        
       },
       onFailure: err => {
         console.error(err)
 
       }
     })
 
   }
 })

 
router.post('/changeEmail', (req, res)=>{
   var Username = req.body['old-email']
   const Password = req.body.password 
   const loginDetails = { Username, Password }
   const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(loginDetails)
   const userDetails = { Username, Pool: userPool }
   const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userDetails)
   cognitoUser.authenticateUser(authenticationDetails, {
     onSuccess: data => {
       const emailAttribute = {
         Name: 'email',
         Value: req.body.email
       }
       const attribute = new AmazonCognitoIdentity.CognitoUserAttribute(emailAttribute)
       cognitoUser.updateAttributes([ attribute ], async(err, data) => {
         if (data){
            let clinicAdminLogin = await userHelper
            .changeEmail(req.body, req.session.cogUserId)
            .then((changePasswordRespo) => {
               res.redirect('/login')
            }); 
           res.redirect('/')
         }
       })
     },
     onFailure: err => {
     }
   })  
 })

router.get("/fetchDoctors/:clinicName/:whatsapp",
   async function (req, res, next) {
      let cName = req.params.clinicName;
      let whatsapp = req.params.whatsapp;
      await userHelper.fetchDoctors(cName, whatsapp)
         .then(({ doctors: result, user, bookingToken }) => {
            let newName = result[0].clinicName;
           
            res.render("doctorsReadyForBooking", { result, newName, user, bookingToken });
         });
   }
);

router.get("/bookings/:doctorName/:department/:newName/:name/:address/:panchayath/:whatsapp",
   async function (req, res, next) {
     console.log('#@#@#@#@#@##@@#@##', req.params)
      var todayDate = new Date().toISOString().slice(0, 10);
      const dubbleZero = parseInt("00");
      const time = new Date();
      const bookingTime = `${dubbleZero + time.getHours()}:${dubbleZero + time.getMinutes()
         }:${dubbleZero + time.getSeconds()}`;
      req.params.token = "Notify after booking";
      req.params.bookingDate = todayDate;
      req.params.bookingTime = bookingTime;
      req.params.consultingTime = "Notify after payment";
      req.params.status = "Not-Confirmed";
      req.session.bookedClinic = req.params.newName
      
      await userHelper.bookings(req.params, req.session.cogUserId).then((data) => {
         res.render("paymentPageForBooking", { data });
      });
   }
);

//razorpay
router.get('/paymentSuccessful',(req,res)=>{
  let id = req.session.sub;
  console.log("hereee");
  productHelpers.updatePaymentStatus(id).then((status)=>{ 
    // bcs status coming like array
    res.redirect("/login");
  })

})

router.post('/payment',(req,res)=>{
   let orderId = req.body.contact;
   let total = req.body.fees;
   let bookingTime = req.body.bookingTime;
   userHelper.generateRazorpay(orderId,total).then((response)=>{
      
      res.json({status:true,response,bookingTime})
  })
})

router.post('/verify-payment',(req,res)=>{
   productHelpers.verifyPayment(req.body, req.body.order.receipt, req.session.sub).then((status)=>{
   }).catch((err)=>{
       console.log(err)
       res.json({status:'Paymentfailed'})
   })
   res.json({status:true})

})
//check above code

router.get('/bookedSuccessfully',(req,res)=>{
  productHelpers.bookedSuccessfully(req.session.whatsapp, req.session.cogUserId).then((status)=>{ 
    // bcs status coming like array
    res.redirect("/login");
  })
})
module.exports = router;
