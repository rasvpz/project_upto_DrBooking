var db = require("../config/connection");
var bcrypt = require("bcryptjs");
var ObjectId = require("bson-objectid");
const { notify } = require("../routes/superAdmin");
const { JSONCookie } = require("cookie-parser");
module.exports = {
  fetchClinic: () => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection("bogOclinicsInPanchayath")
        .find({ status: "Running" })
        .toArray()
        .then((data) => {
          resolve(data);
        });
    });
  },

  fetchSelectedClinic: (clinicAdminDtls) => {
    let selectedClinic = clinicAdminDtls.fetchClinic;
    let phone = clinicAdminDtls.phoneNo;
    console.log(selectedClinic)
    console.log(phone)
    return new Promise(async (resolve, reject) => {
      try {
          const data = await db.get().collection("bogOclinicsInPanchayath").findOne({ clinicName: selectedClinic, contacts: phone });

            if(data){
                 data.password = clinicAdminDtls.password
                 let inserted =  db.get().collection('bigoClinicAdminRegistration').insertOne(data)
                 resolve(data)
            }

      } catch (err) {
          console.log(err);
      }
    });
  },

  clinicAdminLogin: (loginDetails) => {
    let password = loginDetails.password;
    let phone = loginDetails.phoneNo;
    return new Promise(async (resolve, reject) => {
      try {
          const data = await db.get().collection("bigoClinicAdminRegistration").findOne({ contacts: phone, password: password });
        let clinic = data.clinicName
            if(data){
              console.log("he im IN")
              await db.get().collection('bigODoctorsInClinics').find({clinicName:clinic}).toArray().then((resp) =>{
                resolve({status:true,data, resp})
              }) 
                  
            }else{
                resolve({status:false})
            }

      } catch (err) {
          console.log(err);
      }
    });
  },
  
  clinicDatasFetching: (doctorsDetails) => {
    return new Promise(async (resolve, reject) => {
        await db.get().collection('bigODoctorsInClinics').find().toArray().then((allDoctors) =>{
          resolve(allDoctors); 
         })
        
    });
  },
  
  clinicAddDoctor: (doctorsDetails) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection("bigODoctorsInClinics").insertOne(doctorsDetails).then((data) => {
        resolve()
        });

        
    });
  },

  deleteClinicDoctors: (myID)=>{
    return new Promise ((resolve, reject)=>{
       db.get().collection('bigODoctorsInClinics').deleteOne({ _id:ObjectId(myID) }).then((resp) =>{ 
       resolve(resp)
    }) 
    })
 },


};


