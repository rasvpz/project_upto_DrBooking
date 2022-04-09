var db = require('../config/connection')
var ObjectId = require("bson-objectid");
const Razorpay = require('razorpay')
const crypto = require("crypto");
// const hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);
const instance = new Razorpay({
    key_id: 'rzp_test_k07GlBJTDFfpb4',
    key_secret: 'ESAh8FeH6NcT2MEirBxjQXce',
});
module.exports = {
    
    fetchClinics: ()=>{
       return new Promise (async(resolve, reject)=>{
       await db.get().collection('bigOdistricts').find().toArray().then((data)=>{
        resolve(data)
       })  
       })
    },


    addNewUser: (userRegistration, session)=>{
        console.log(session)
        return new Promise (async(resolve, reject)=>{
            const {  whatsapp, password } = userRegistration
            db.get().collection('bigOUserRegistration').findOne({whatsapp:whatsapp}).then((data)=>{
                
                if(!data){                
                    db.get().collection('bigOUserRegistration').insertOne(userRegistration).then((data)=>{ 
                        resolve(data)       
                     })
                    }
                else{
                }
            })
        })
     },


        doLogin:(userData, session)=>{

            let myClinic = {}
            return new Promise(async(resolve, reject)=>{
                await db.get().collection('bigOUserRegistration').findOne({email:userData.email, cognitoId:session.sub}).then(async(loginData)=>{
                    console.log(loginData,'oioioioioioioioio')
                    const {  name, address, panchayath, whatsapp } = loginData
                     var d = new Date()
                     var mycDate = d.getDate()
                    const newMonth = d.getMonth() +1
                    var myMonth
                   if(newMonth < 10){
                       myMonth = '0' + newMonth
                   }
                   if(mycDate < 10){  
                    mycDate = '0' + mycDate        
    
                   }
                    var myDate  =  d.getFullYear() + "-" + myMonth + "-" + mycDate 
                    const bookings =  await db.get().collection ("bigOUserBookingDetails").find({cognitoId:session.sub, bookingDate:myDate}).toArray ();
                    await db.get().collection('bogOclinicsInPanchayath').find({pachayath:panchayath, status:'Running'}).toArray().then(async(myClinic)=>{
                        myClinic.name = name
                        myClinic.address = address
                        myClinic.panchayath = panchayath
                        myClinic.whatsapp = whatsapp  
                        let data = await db.get().collection('bigOUserBookingDetails').findOne({whatsapp:whatsapp, cognitoId: session.sub})
                        let data2 = await db.get().collection('bigOUserBookingDetails').find().sort({_id:-1}).limit(1).toArray()
                        let result = await db.get().collection('bigOprescription').findOne({patientCogId: session.sub, status:'processing'})
                         resolve({myClinic, bookings, data2, data, result})    
                    })
                })
            })
        },

        changePassword:(userData, sessionSub)=>{
            return new Promise(async(resolve, reject)=>{ 
            await db.get()
            .collection('bigOUserRegistration')
            .updateOne( {cognitoId:sessionSub},
               {
                  $set:
                  {  
                    password : userData.password
                  }
            })
                .then((changePasswordRespo) =>{ 
                resolve(changePasswordRespo)
         }) 
    })
    },        
    
    changeEmail:(userData, sessionSub)=>{
        return new Promise(async(resolve, reject)=>{ 
        await db.get()
        .collection('bigOUserRegistration')
        .updateOne( {cognitoId:sessionSub},
           {
              $set:
              {  
                email : userData.email
              }
        })
            .then((changeEmailRespo) =>{ 
            resolve(changeEmailRespo)
     }) 
})
},

        fetchDoctors:(clinicName, whatsapp)=>{
            return new Promise(async(resolve, reject)=>{
                await db.get().collection('bigODoctorsInClinics').find({clinicName:clinicName}).toArray().then(async(doctors)=>{
                    await db.get().collection('bigOUserRegistration').findOne({whatsapp:whatsapp}).then(async(user)=>{
                        await db.get().collection('bigOUserBookingDetails').findOne({whatsapp:whatsapp}).then((bookingToken)=>{
                            
                            resolve({doctors,user,bookingToken})
                            })
                    })
                })
            })
        },

        
        bookings:(bookingData, cognitoId)=>{
            bookingData.cognitoId = cognitoId
            return new Promise(async(resolve, reject)=>{
                await db.get().collection('bigOUserBookingDetails').insertOne(bookingData).then(async(data)=>{
                    const myID = data.insertedId                    
                    await db.get().collection('bigOUserBookingDetails').findOne({ _id:ObjectId(myID) }).then((user)=>{                       
                        resolve(user)
                        })        
                })
            })
        },

        generateRazorpay: (orderId, total) => {
            let totalPrice = parseInt(total)           
            return new Promise((resolve, reject) => {
                var options = {
                    amount: totalPrice * 100,  //amount in the smallest currency unit
                    currency: "INR",
                    receipt: orderId,
                };
                instance.orders.create(options, function (err, order) {
                    console.log(order)
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log("New Order:", order);
                        resolve(order);
                    }    
                })
            })
        },

        verifyPayment: (details, whatsapp, cognitoId) => {  
           
            return new Promise(async(resolve, reject) => {            
                const contact = details['order[receipt]']
                const bookingTime = details.bookingTime
                var consultingTime = ""      
                var d = new Date()
                var mycDate = d.getDate()

                const newMonth = d.getMonth() +1
                var myMonth
               if(newMonth < 10){
                   myMonth = '0' + newMonth
               }
               
               if(mycDate < 10){  
                mycDate = '0' + mycDate        

               }
                var myDate  =  d.getFullYear() + "-" + myMonth + "-" + mycDate 
                
                let checkItsExist = await db.get().collection('bigOUserBookingDetails').find({bookingDate:myDate}).count()
                console.log('Hi im hereeeeeeeeeeeeeeeeeeeeeeeeeeee', checkItsExist);  
                if(checkItsExist == 1)                
                {

                    let lastBooking = await db.get().collection('bigOUserBookingDetails').find({status:"Not-Confirmed"}).sort({_id:-1}).limit(1).toArray()
                    console.log('laaaaaaaaaaaaaaaaaaaaaaaaaaast', lastBooking)
                    var newToken = lastBooking[0].token
                    var currentBookingTime =  lastBooking[0].consultingTime
                    var elseBookingTime = lastBooking[0].bookingTime

                    await db.get()
                    .collection('bigOUserBookingDetails')
                    .updateOne( {whatsapp:whatsapp, bookingTime:bookingTime},
                       {
                          $set:
                          {  status : "Booked",
                             consultingTime: bookingTime,
                             token : 10,
                             cognitoId:cognitoId
                            
                          }
                         })
                    .then((bookingRespo) =>{ 
                    resolve(bookingRespo)
                 }) 
                }
                    
                else{

                let lastBooking = await db.get().collection('bigOUserBookingDetails').find({status:"Booked"}).sort({_id:-1}).limit(1).toArray()

                var newToken = lastBooking[0].token
                var currentBookingTime =  lastBooking[0].consultingTime
                var elseBookingTime = lastBooking[0].bookingTime
                
                
                let lastNotBooking = await db.get().collection('bigOUserBookingDetails').findOne({status:"Not-Confirmed"})
                // console.log('TTTTTTTTTTTTTTKKKKKKKKKKKKKNNNNNNN',newToken)
                // console.log('CCCCCCCCCCCCCCCCCTTTTTTTTTTTTTTTTT',currentBookingTime)
                // console.log('NNNNNNNNNNNNNNNNNTTTTTTTTTTTTTTTTT',lastNotBooking.bookingTime)

                var bookedDate = lastNotBooking.bookingDate
                var modifiedDate1 = bookedDate+" "+currentBookingTime
                var modifiedDate2 = bookedDate+" "+lastNotBooking.bookingTime
                var date1 = new Date(modifiedDate1);
                var date2 = new Date(modifiedDate2);          
                var diff = date1.getTime() - date2.getTime();
                var diff2 = date2.getTime() <= date1.getTime();                
                var msec = diff;
                var hh = Math.floor(msec / 1000 / 60 / 60);
                msec -= hh * 1000 * 60 * 60;
                var mm = Math.floor(msec / 1000 / 60);
                msec -= mm * 1000 * 60;
                var ss = Math.floor(msec / 1000);
                msec -= ss * 1000;                
                var substractedTime = hh + ":" + mm + ":" + ss
                console.log(diff2, substractedTime)

                        if(diff2 == true){                                
                            function timeToMins(currentBookingTime) {
                                var b = currentBookingTime.split(':');
                                return b[0]*60 + +b[1];
                                }
                            function timeFromMins(mins) {
                                function z(n){return (n<10? '0':'') + n;}
                                var h = (mins/60 |0) % 24;
                                var m = mins % 60;
                                return z(h) + ':' + z(m);
                                }
                            function addTimes(t0, t1) {
                                return timeFromMins(timeToMins(t0) + timeToMins(t1));
                                }                  
                            consultingTime = addTimes(currentBookingTime, '00:20:00');

                            await db.get()
                            .collection('bigOUserBookingDetails')
                            .updateOne( {whatsapp:whatsapp, bookingTime:bookingTime},
                            {
                                $set:
                                {  status : "Booked",
                                    consultingTime: consultingTime,
                                    token : newToken+1,
                                    cognitoId:cognitoId
                                }
                                })
                            .then((bookingRespo) =>{ 
                            resolve(bookingRespo)
                         }) 

                        }
                        else{
                            
                                function timeToMins(currentBookingTime) {
                                    var b = currentBookingTime.split(':');
                                    return b[0]*60 + +b[1];
                                 }
                                function timeFromMins(mins) {
                                    function z(n){return (n<10? '0':'') + n;}
                                    var h = (mins/60 |0) % 24;
                                    var m = mins % 60;
                                    return z(h) + ':' + z(m);
                                 }
                                function addTimes(t0, t1) {
                                    return timeFromMins(timeToMins(t0) + timeToMins(t1));
                                 }  
                                

                                 const d1 = new Date();
                                 const hr=  d1.getHours();
                                 const d2 = new Date();
                                 const min = d2.getMinutes();
                                 const currentTime = hr+':'+min
                                 if(currentTime < elseBookingTime){
                                    consultingTime = addTimes(currentTime, '00:02:00');
                                 }
                                 else{
                                    consultingTime = addTimes(elseBookingTime, '00:20:00');
                                 }
                                await db.get()
                                .collection('bigOUserBookingDetails')
                                .updateOne( {whatsapp:whatsapp, bookingTime:bookingTime},
                                {
                                    $set:
                                    {  status : "Booked",
                                        consultingTime: consultingTime,
                                        token : newToken+1,
                                        cognitoId:cognitoId
                                    }
                                    })
                                .then((bookingRespo) =>{ 
                                resolve(bookingRespo)
                            }) 
                        }

            }
                // const crypto = require('crypto');
                // let hmac = crypto.createHmac('sha256', 'JCCNkRAJ4RRAe0opTVGwdhW8');
                // hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
                // hmac = hmac.digest('hex')
                // if (hmac == details['payment[razorpay_signature]']) {

                //     console.log("************************************8",details);

                //     resolve()
                // } else {
                //     resolve()
                // }
    
            })
        },

        bookedSuccessfully:(userData, sessionSub)=>{
             return new Promise (async(resolve, reject)=>{
                let data = await db.get().collection('bigOUserBookingDetails').findOne({whatsapp:userData, cognitoId: sessionSub})
                let data2 = await db.get().collection('bigOUserBookingDetails').find().sort({_id:-1}).limit(1).toArray()
                console.log(data2);
                    resolve(data2)                
                })
    },

    
    prescribedDrugs:(res)=>{
        return new Promise (async(resolve, reject)=>{
            console.log('ooooooooooooooooooooooooooo',res);
           let data = await db.get().collection('bigOUserBookingDetails').updateOne({bookingTime:res.bTime, cognitoId: res.cognitoId}, {$set : {consultingTime:res.bTime+01}})
               resolve(data)                
           })
},

updatePaymentStatus:(id)=>{
    return new Promise ((resolve,reject)=>{
        db.get().collection('bigOprescription').updateOne({patientCogId:id},{$set:{status:'Paid'}}).then(()=>{
            console.log("sucess===========");
            resolve();
        })
    })
}

//updateDatabase payment status


}