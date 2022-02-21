var db = require('../config/connection')
var bcrypt = require('bcryptjs');
var ObjectId = require("bson-objectid");
module.exports = {
    
    fetchClinics: ()=>{
       return new Promise (async(resolve, reject)=>{
       await db.get().collection('bigOdistricts').find().toArray().then((data)=>{
        resolve(data)
       })  
       })
    },


    addNewUser: (userRegistration)=>{
        return new Promise (async(resolve, reject)=>{
            const {  whatsapp, password } = userRegistration
            db.get().collection('bigOUserRegistration').findOne({whatsapp:whatsapp}).then((data)=>{
                
                if(!data){                
                    db.get().collection('bigOUserRegistration').insertOne(userRegistration).then((data)=>{

        
                     })
                    }
                else{

                }
            })
        })
     },


        doLogin:(userData)=>{
            let myClinic = {}
            return new Promise(async(resolve, reject)=>{
                await db.get().collection('bigOUserRegistration').findOne({whatsapp:userData.whatsapp, password:userData.password}).then(async(loginData)=>{
                    const {  name,address, panchayath, whatsapp } = loginData
                    await db.get().collection('bogOclinicsInPanchayath').find({pachayath:panchayath, status:'Running'}).toArray().then((myClinic)=>{
                        myClinic.name = name
                        myClinic.address = address
                        myClinic.panchayath = panchayath
                        myClinic.whatsapp = whatsapp              
                        resolve(myClinic)    
                    })
                })
            })
        },
        
        fetchDoctors:(clinicName, whatsapp)=>{
            return new Promise(async(resolve, reject)=>{
                await db.get().collection('bigODoctorsInClinics').find({clinicName:clinicName}).toArray().then(async(doctors)=>{
                    await db.get().collection('bigOUserRegistration').findOne({whatsapp:whatsapp}).then((user)=>{
                    resolve({doctors,user})
                    })
                })
            })
        },

        
        bookings:(bookingData)=>{
            return new Promise(async(resolve, reject)=>{
                await db.get().collection('bigOUserBookingDetails').insertOne(bookingData).then(async(data)=>{
                    const myID = data.insertedId                    
                    await db.get().collection('bigOUserBookingDetails').findOne({ _id:ObjectId(myID) }).then((user)=>{                       
                        resolve(user)
                        })
        
                })
            })
        }
        
}