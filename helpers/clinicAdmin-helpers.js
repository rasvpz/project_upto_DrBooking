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
    console.log(selectedClinic);
    console.log(phone);
    return new Promise(async (resolve, reject) => {
      try {
        const data = await db
          .get()
          .collection("bogOclinicsInPanchayath")
          .findOne({ clinicName: selectedClinic, contacts: phone });

        if (data) {
          data.password = clinicAdminDtls.password;
          let inserted = db
            .get()
            .collection("bigoClinicAdminRegistration")
            .insertOne(data);
          resolve(data);
        }
      } catch (err) {
        console.error(err);
      }
    });
  },

  clinicAdminLogin: (loginDetails) => {
    let password = loginDetails.password;
    let phone = loginDetails.phoneNo;
    return new Promise(async (resolve, reject) => {
      try {
        const data = await db
          .get()
          .collection("bigoClinicAdminRegistration")
          .findOne({ contacts: phone, password: password });
        let clinic = data.clinicName;
        if (data) {
          await db
            .get()
            .collection("bigODoctorsInClinics")
            .find({ clinicName: clinic })
            .toArray()
            .then((resp) => {
              resolve({ status: true, data, resp });
            });
        } else {
          resolve({ status: false });
        }
      } catch (err) {
        console.error(err);
      }
    });
  },

  clinicDatasFetching: (doctorsDetails) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection("bigODoctorsInClinics")
        .find()
        .toArray()
        .then((allDoctors) => {
          resolve(allDoctors);
        });
    });
  },

  fetchMedicineProvider: (fetchedclinicName) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection("bigOMedicineProvider")
        .find({ clinicName: fetchedclinicName })
        .toArray()
        .then((fecthedmedCompanies) => {
          resolve(fecthedmedCompanies);
        });
    });
  },

  addMedicineProvider: (medProvider) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection("bigOMedicineProvider")
        .insertOne(medProvider)
        .then(async (department) => {
          await db
            .get()
            .collection("bigOMedicineProvider")
            .find({ clinicName: medProvider.clinicName })
            .toArray()
            .then((medCompanies) => {
              resolve(medCompanies);
            });
        });
    });
  },

  // addMedicine: (addMedicine) => {
  //   return new Promise(async (resolve, reject) => {
  //     let addedMedicines =  await db.get().collection('bigOMedicines').findOne({clinicName: addMedicine.clinicName, type:addMedicine.type, department:addMedicine.department })
  //      var prodNamePosition = addedMedicines.itemName.indexOf(addMedicine.itemName)
  //         if(!addedMedicines){
  //           await db.get().collection('bigOMedicines')
  //           .insertOne(
  //             {
  //               clinicName:addMedicine.clinicName,
  //               department:addMedicine.department,
  //               type:addMedicine.type,
  //               companyName:[addMedicine.companyName],
  //               itemName:[addMedicine.itemName],
  //               itemQty:[addMedicine.itemQty],
  //               itemRate:[addMedicine.itemRate]
  //             }).then((addMedicines) =>{
  //             resolve(addMedicines);
  //           })
  //         }
  //         else{
  //           let prevQty = addedMedicines.itemQty[prodNamePosition]
  //           let prevItemRate = addedMedicines.itemRate[prodNamePosition]-1
  //           await db.get().collection('bigOMedicines').updateOne({clinicName: addMedicine.clinicName, type:addMedicine.type, department:addMedicine.department},
  //             {
  //                $addToSet: {itemName:addMedicine.itemName, itemQty: addMedicine.itemQty+prevQty, itemRate: addMedicine.itemRate+prevItemRate}
  //             }
  //             ).then((addedMedicines) =>{
  //           })
  //         }
  //           // resolve(addedMedicines); ages.findIndex(checkAge)

  //   });
  // },

  addMedicine: (addMedicine) => {
    return new Promise(async (resolve, reject) => {
      let addedMedicines = await db.get().collection("bigOMedicines").findOne({
        clinicName: addMedicine.clinicName,
        type: addMedicine.type,
        department: addMedicine.department,
      });

      const newMedicine = !addedMedicines
        ? false
        : addedMedicines.medicines.every(
            (medicine) => medicine.itemName !== addMedicine.itemName
          );

      if (!addedMedicines || newMedicine) {
        await db
          .get()
          .collection("bigOMedicines")
          .updateOne(
            {
              clinicName: addMedicine.clinicName,
              department: addMedicine.department,
              type: addMedicine.type              
            },
            {
              $push: {
                medicines: {
                  companyName: addMedicine.companyName,
                  itemName: addMedicine.itemName,
                  itemQty: Number(addMedicine.itemQty),
                  itemRate: Number(addMedicine.itemRate),
                },
              },
            },
            {
              upsert: true,
            }
          )
          .then((addMedicines) => {
            resolve(addMedicines);
          });
      } else {

        await db
          .get()
          .collection("bigOMedicines")
          .updateOne(
            {
              clinicName: addMedicine.clinicName,
              type: addMedicine.type,
              department: addMedicine.department,
              "medicines.itemName": addMedicine.itemName,
            },
            {
              $set: {
                "medicines.$.itemRate": Number(addMedicine.itemRate),
              },
              $inc: {
                "medicines.$.itemQty": +addMedicine.itemQty,
              },
            }
          )
          .then((addedMedicines) => {
            console.log(addedMedicines);
            resolve("Added Successfully")
          });
      }
    });
  },

  medicineManagement: (clinicName) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection("bigODoctorsInClinics")
        .find({ clinicName: clinicName })
        .toArray()
        .then(async (department) => {
          await db
            .get()
            .collection("bigOMedicineProvider")
            .find({ clinicName: clinicName })
            .toArray()
            .then((company) => {
              resolve({ department, company });
            });
        });
    });
  },

  clinicAddDoctor: (doctorsDetails) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection("bigODoctorsInClinics")
        .insertOne(doctorsDetails)
        .then((data) => {
          resolve();
        });
    });
  },

  deleteClinicDoctors: (myID) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection("bigODoctorsInClinics")
        .deleteOne({ _id: ObjectId(myID) })
        .then((resp) => {
          resolve(resp);
        });
    });
  },

  editClinicDoctors: (myID) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection("bigODoctorsInClinics")
        .findOne({ _id: ObjectId(myID) })
        .then((resp) => {
          resolve(resp);
        });
    });
  },

  updateClinicDoctors: (myClinicDoctor) => {
    console.log(myClinicDoctor);
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection("bigODoctorsInClinics")
        .updateOne(
          { _id: ObjectId(myClinicDoctor.id) },
          {
            $set: {
              clinicName: myClinicDoctor.clinicName,
              doctorName: myClinicDoctor.doctorName,
              degreee: myClinicDoctor.degreee,
              department: myClinicDoctor.department,
              consultingTime: myClinicDoctor.consultingTime,
              contact: myClinicDoctor.contact,
              password: myClinicDoctor.password,
            },
          }
        )
        .then((clinicRespo) => {
          resolve(clinicRespo);
        });
    });
  },
  prescripedMedicine:(date)=>{
    return new Promise((res,rej)=>{
      try {       
        db.get().collection('bigOprescription').find({date:date, status:'Paid'}).toArray().then((result)=>{
         
          res(result)
        })
      } catch (error) {
        res(err)
      }     
    })   
  },
  
  getIndividualPrescription:(myID)=>{
    return new Promise((res,rej)=>{
      try {       
        db.get().collection('bigOprescription').findOne({_id: ObjectId(myID), status:'Paid'}).then((result)=>{
          res(result)
        })
      } catch (error) {
        res(err)
      }     
    })   
  },

};
