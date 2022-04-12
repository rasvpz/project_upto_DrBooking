var db = require("../config/connection");
var bcrypt = require("bcryptjs");
var ObjectId = require("bson-objectid");
const { notify } = require("../routes/superAdmin");
const { JSONCookie } = require("cookie-parser");
const { resolve } = require("path");
const { log } = require("console");
const session = require("express-session");
module.exports = {
  doctorsLogin: async(loginDate) => {
    console.log('-0-0-0-0', loginDate)
    return new Promise(async(resolve, reject)=>{
    const data = await db.get().collection("bigODoctorsInClinics").findOne({ contact: loginDate.contact, password: loginDate.password });
    
    var d = new Date()
    var mycDate = d.getDate()

    const thisMonth = d.getMonth() + 1
    var myMonth

    if(thisMonth < 10){
        myMonth = '0' + thisMonth
    }

    if(mycDate < 10){  
      mycDate = '0' + mycDate        

     }
     var myDate  =  d.getFullYear() + "-" + myMonth + "-" + mycDate
    const bookingData = await db.get().collection("bigOUserBookingDetails").findOne({ bookingDate: myDate, cognitoId:loginDate.cognitoId});
    // const patientHistory = await db.get().collection("bigOUsersHistory").findOne({cognitoId:'d74b3afe-ca19-4f57-b818-589e5736e4d1'});
    const tablets = await db.get().collection("bigOMedicines").find({type:"Tablets", department:data.department}).toArray();
    const pills = await db.get().collection("bigOMedicines").find({type:"Pills", department:data.department}).toArray();
    const syrups = await db.get().collection("bigOMedicines").find({type:"Syrups", department:data.department}).toArray();
    const injection = await db.get().collection("bigOMedicines").find({type:"Injections", department:data.department}).toArray();
    const ointments = await db.get().collection("bigOMedicines").find({type:"Ointments", department:data.department}).toArray();
    const balms = await db.get().collection("bigOMedicines").find({type:"Balms", department:data.department}).toArray();
    const packets = await db.get().collection("bigOMedicines").find({type:"Packets", department:data.department}).toArray();
    const others = await db.get().collection("bigOMedicines").find({type:"Others", department:data.department}).toArray();
    resolve({data,bookingData,tablets,pills,syrups,injection,ointments,balms,packets,others})
    })
  },


  doctorsLoginFetchAllPatients: async(loginDate) => {
    return new Promise(async(resolve, reject)=>{
    const data = await db.get().collection("bigODoctorsInClinics").findOne({ contact: loginDate.contact, password: loginDate.password });
    var d = new Date()
    var mycDate = d.getDate()

    const thisMonth = d.getMonth() + 1
    var myMonth

    if(thisMonth < 10){
        myMonth = '0' + thisMonth
    }

    if(mycDate < 10){  
      mycDate = '0' + mycDate        

     }
     var myDate  =  d.getFullYear() + "-" + myMonth + "-" + mycDate
    const bookingData = await db.get().collection("bigOUserBookingDetails").find({ bookingDate: myDate, department:data.department, consultation:'pending'}).toArray();
    resolve({data,bookingData})
  //   const bookingData = await db.get().collection("bigOprescription").aggregate([
  //     {
  //     $match:{status:"Paid"}
  //   },
  //   {
  //     $project:{patientCogId:1,status:1}
  //   },
  //   {
  //     $lookup:{        
  //       from:"bigOUserBookingDetails",
  //       localField:"patientCogId",
  //       foreignField:"cognitoId",
  //       as:"Details"
  //     }
  //   },
  //  { $unwind:"$Details"}
  // ]).toArray()
  //   console.log(bookingData,"==============================================");
  //   resolve({data,bookingData})

 })
  },

  patientHistory: async(history) => {
    return new Promise(async(resolve, reject)=>{
      await db.get()
      .collection('bigOUsersHistory')
      .updateOne( {cognitoId:history.cognitoId, action: history.action},
         {
            $set:
            {  
              cognitoId : history.cognitoId,
              name : history.name,
              iframe : history.iframe,
              action: history.action
            }
      })
          .then((data) =>{ 
          // resolve("Updated Successfully")
   }) 
   const data = await db.get().collection("bigOUsersHistory").findOne({ cognitoId: history.cognitoId});
   resolve(data)

    })   

  },  

  cormodityMedicine: async(cormodity) => {
    return new Promise(async(resolve, reject)=>{
      await db.get()
      .collection('bigOuserCormodity')
      .updateOne( {cognitoId:cormodity.cognitoId, action: cormodity.action},
         {
            $set:
            {  
              cognitoId : cormodity.cognitoId,
              name : cormodity.name,
              cormodity : cormodity.iframe,
              action: cormodity.action
            }
      })
          .then((data) =>{ 
   }) 
   const cormodityData = await db.get().collection("bigOuserCormodity").findOne({ cognitoId: cormodity.cognitoId});
   resolve(cormodityData)
    }) 
  },
  prescription:(patientDtls, data)=>{
    data.patient =  patientDtls.patientCognitoId
    data.patientCogId = patientDtls.myPatient
    data.date = patientDtls.date
    data.drName = patientDtls.drName
    data.drDegree = patientDtls.drDegree
    data.drDept = patientDtls.drDept
    data.clinic = patientDtls.clinic
    data.whatsapp = patientDtls.whatsapp
    data.total = patientDtls.medTotal
    data.status = 'processing'
    return new Promise((res,rej)=>{
      try {       
        db.get().collection('bigOprescription').insertOne(data).then(async(result)=>{
          const updateConsultation =  await db.get().collection('bigOUserBookingDetails').updateOne({whatsapp:data.whatsapp, bookingDate:data.date, department:data.drDept, doctorName:data.drName},{$set:{consultation:'ok'}})
          res(result)
        })
      } catch (error) {
        res(err)
      }     
    })   
  }

}