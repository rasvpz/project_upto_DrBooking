var db = require('../config/connection')
var bcrypt = require('bcryptjs');
var ObjectId = require("bson-objectid");
const { notify } = require('../routes/superAdmin');
const { JSONCookie } = require('cookie-parser');
module.exports = {
    
    fetchData: ()=>{
       return new Promise (async(resolve, reject)=>{
       await db.get().collection('bigOdistricts').find().toArray().then((data)=>{
        resolve(data)
       })    
       })
    },

    countDistrict: ()=>{
        return new Promise (async(resolve, reject)=>{
        db.get().collection('bigOdistricts').find().toArray().then((resp) =>{
         let len = resp.length
         resolve(len, resp)
        }) 
        })
     },
     countMuncipality: ()=>{
        return new Promise (async(resolve, reject)=>{
        db.get().collection('bigOmuncipalities').find().toArray().then((resp) =>{
         let len = resp.length
         resolve(len)
        }) 
        })
     },
     countPanchayath: ()=>{
        return new Promise (async(resolve, reject)=>{
        db.get().collection('bigOPanchayath').find().toArray().then((resp) =>{
         let len = resp.length
         resolve(len)
        }) 
        })
     },
     countClinincs: ()=>{
        return new Promise (async(resolve, reject)=>{
        db.get().collection('bogOclinicsInPanchayath').find().toArray().then((resp) =>{
         let len = resp.length
         resolve(len)
        }) 
        })
     },

     countPending: ()=>{
        return new Promise (async(resolve, reject)=>{
        db.get().collection('bogOclinicsInPanchayath').find({paymentMode:"pending"}).toArray().then((resp) =>{
         let len = resp.length
         resolve(len)
        }) 
        })
     },

     
   addDistricts: (userData)=>{
      return new Promise(async(resolve, reject)=>{   
         let selectedDistrict = userData.district
         let districtExist = await db.get().collection('bigOdistricts').findOne({district:selectedDistrict}) 
         if(districtExist){
            console.log("District Allready Exist")
            resolve("District Allready Exist")
         }else{
         console.log("then me")
         await db.get().collection('bigOdistricts').find().toArray().then((resp) =>{
            let len = resp.length
            len = len+1
            userData.myId = len
            userData.district = userData.district
            let inserted =  db.get().collection('bigOdistricts').insertOne(userData)
            db.get().collection('bigOdistricts').find().toArray().then((resp) =>{ 
               resolve(resp)
           }) 
           }) }
      })
  },

   fetchDistricts: ()=>{
      return new Promise (async(resolve, reject)=>{
         db.get().collection('bigOdistricts').find().toArray().then((resp) =>{ 
         resolve(resp)
      }) 
      })
}, 
     
deleteDistrict: (myID)=>{
   return new Promise ((resolve, reject)=>{
      db.get().collection('bigOdistricts').deleteOne({ _id:ObjectId(myID) }).then((resp) =>{ 
      resolve(resp)
   }) 
   })
},

fetchDistForMuncipalites: ()=>{
   return new Promise (async(resolve, reject)=>{
      db.get().collection('bigOdistricts').find().toArray().then((distRespo) =>{ 
         db.get().collection('bigOmuncipalities').find().toArray().then((muncRespo) =>{ 
            resolve({distRespo,muncRespo})
      })
   }) 
   })
}, 

fetchMuncipalities: ()=>{
   return new Promise (async(resolve, reject)=>{
      db.get().collection('bigOmuncipalities').find().toArray().then((muncRespo) =>{ 
      resolve(muncRespo)
   }) 
   })
}, 

addMuncipalities: (myDataMuncipality)=>{
   let munci = myDataMuncipality.muncipality
   return new Promise (async(resolve, reject)=>{
      // checking selected muncipality is exxist or not
      let municipalityExist = await db.get().collection('bigOmuncipalities').findOne({muncipality:munci}) 
     
      if (municipalityExist)
      {
         resolve("Muncipality Exist")
      }
      // codes end here checking selected muncipality is exxist or not
else{
   await db.get().collection('bigOmuncipalities').find().toArray().then((muncData) =>{
      let len = muncData.length
      len = len+1
      myDataMuncipality.myMuncipalityId = len

   })
      // code for fetching the district ID to muncipality table
      selectedDistrict = myDataMuncipality.district
      let districtExist = await db.get().collection('bigOdistricts').findOne({district:selectedDistrict}) 
      myDataMuncipality.districtId = districtExist.myId
      let inserted =  db.get().collection('bigOmuncipalities').insertOne(myDataMuncipality)
      resolve("Successfully Added")
      //code ends here for the code fetching the district ID to muncipality table to JSONCookie
   }
   })
   
},
deleteMuncipalites: (myID)=>{
   return new Promise ((resolve, reject)=>{
      db.get().collection('bigOmuncipalities').deleteOne({ _id:ObjectId(myID) }).then((resp) =>{ 
      resolve(resp)
   }) 
   })
},

fetchPanchayaths: ()=>{
   return new Promise (async(resolve, reject)=>{
      db.get().collection('bigOmuncipalities').find().toArray().then((muncRespo) =>{ 
         db.get().collection('bigOPanchayath').find().toArray().then((punchRespo) =>{ 
            resolve({punchRespo,muncRespo})
      })
   }) 
   })
}, 

addPanchayaths: (myDataPanchayath)=>{
   let myPanchayath = myDataPanchayath.panchayath
   console.log(myPanchayath)
   return new Promise (async(resolve, reject)=>{
      // checking selected muncipality is exxist or not
      let panchayathExist = await db.get().collection('bigOPanchayath').findOne({panchayath:myPanchayath}) 
      if (panchayathExist)
      {
         resolve("Panchayath Allready Exist")
      }
      else{
         await db.get().collection('bigOPanchayath').find().toArray().then((panchayth) =>{
            let len = panchayth.length
            len = len+1
            myDataPanchayath.myPanchayathId = len      
         })
         selectedMuncipality = myDataPanchayath.muncipality
         let muncipalityExist = await db.get().collection('bigOmuncipalities').findOne({muncipality:selectedMuncipality})
         myDataPanchayath.myMuncipalityId = muncipalityExist.myMuncipalityId
         let inserted =  db.get().collection('bigOPanchayath').insertOne(myDataPanchayath)
         await db.get().collection('bigOPanchayath').find().toArray().then((fetchedPunchayath) =>{
            resolve(fetchedPunchayath)
      
         })
      }

   })
   
},

deletepachayath: (myID)=>{
   return new Promise ((resolve, reject)=>{
      console.log(myID)
      db.get().collection('bigOPanchayath').deleteOne({ _id:ObjectId(myID) }).then((resp) =>{ 
   })    
   db.get().collection('bigOPanchayath').find().toArray().then((fetchedPunchayath) =>{
      resolve(fetchedPunchayath)
   })
   })
},

fetchClinics: ()=>{
   return new Promise (async(resolve, reject)=>{
      db.get().collection('bogOclinicsInPanchayath').find().toArray().then((clinicRespo) =>{ 
      resolve(clinicRespo)
   }) 
   })
}, 

addClinic: (userData)=>{
   return new Promise(async(resolve, reject)=>{  
      let selectedClinic = userData.clinicName
      let clinicExist = await db.get().collection('bogOclinicsInPanchayath').findOne({panchayath:selectedClinic}) 
      if(clinicExist){
         console.log("Clinic Allready Exist")
         resolve("Clinic Allready Exist")
      }else{
          await db.get().collection('bogOclinicsInPanchayath').find().toArray().then((clinic) =>{
            let len = clinic.length
            len = len+1
            userData.myClinicId = len  
            userData.status = 'Running'
            console.log(userData)
         })
         let newPunch = userData.pachayath
         console.log('-----------------------------------------')
         console.log(newPunch)
         let clinicExist = await db.get().collection('bigOPanchayath').findOne({panchayath:newPunch})
         userData.myPanchayathId = clinicExist.myPanchayathId
         let inserted = await db.get().collection('bogOclinicsInPanchayath').insertOne(userData)
          resolve('success')

         }
      })
   }, 
   
   editClinic: (id)=>{
      return new Promise (async(resolve, reject)=>{
         await db.get().collection('bogOclinicsInPanchayath').findOne({ _id:ObjectId(id) }).then((clinicRespo) =>{ 
            console.log(clinicRespo)
         resolve(clinicRespo)
      }) 
      })
   }, 

   udateClinic: (myClinicName)=>{
      console.log('------------------------------------')
      console.log(myClinicName)
      return new Promise (async(resolve, reject)=>{
         await db.get()
         .collection('bogOclinicsInPanchayath')
         .updateOne( {clinicName:myClinicName.clinicName},
            {
               $set:
               {  clinicName : myClinicName.clinicName,
                  place : myClinicName.place,
                  contacts : myClinicName.contacts,
                  emails : myClinicName.emails,
                  latitude : myClinicName.latitude,
                  longitude : myClinicName.longitude,
                  paymentMode : myClinicName.paymentMode
               }
              })
         .then((clinicRespo) =>{ 
         resolve(clinicRespo)
      }) 
      })
   },

   
   deleteClinic: (myID)=>{
   return new Promise ((resolve, reject)=>{
      console.log(myID)
      db.get().collection('bogOclinicsInPanchayath').deleteOne({ _id:ObjectId(myID) }).then((resp) =>{ 
         resolve("Deleted")
   })    
   })
},
fetchAllClinics: ()=>{
   return new Promise (async(resolve, reject)=>{      
      await db.get().collection('bogOclinicsInPanchayath').find({status: "Running"}).toArray().then((clinic) =>{
         resolve(clinic)
      })  
   })
},

blockSite: (status)=>{
   let crrstatus = parseInt(status)
   return new Promise (async(resolve, reject)=>{
      await db.get()
      .collection('bogOclinicsInPanchayath')
      .updateOne( {myClinicId:crrstatus},
         {
            $set:
            { 
               status : "Blocked"
            }
           })
      .then((clinicRespo) =>{ 
      resolve(clinicRespo)
   }) 
   })
},

fetchBlockedClinics: ()=>{
   return new Promise (async(resolve, reject)=>{      
      await db.get().collection('bogOclinicsInPanchayath').find({status: "Blocked"}).toArray().then((clinic) =>{
         resolve(clinic)
      })  
   })
},

unBlock: (status)=>{
   let crrstatus = parseInt(status)
   return new Promise (async(resolve, reject)=>{
      await db.get()
      .collection('bogOclinicsInPanchayath')
      .updateOne( {myClinicId:crrstatus},
         {
            $set:
            { 
               status : "Running"
            }
           })
      .then((clinicRespo) =>{ 
      resolve(clinicRespo)
   }) 
   })
},



}