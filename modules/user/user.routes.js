const router = require("express").Router();
const {getAvailableCars,getCarStatus,getDailyPayments,getAllUserReservations, getCarSpecs, getUserId, createReservation, getUserReservs, cancelReservation, pickReservation,getTotalPayment,createPayment,rechargeBalance,addUser, getAllReservations,getAllCarReservations, addCar, editCar, getAdminId} = require("./controller/user.controller")


router.post("/",getAvailableCars)
router.get("/getCarSpecs/:carId",getCarSpecs)
router.get("/getUserReservs/:userId",getUserReservs)
router.get("/cancelReservation/:reservId",cancelReservation)
router.get("/pickReservation/:reservId",pickReservation)
router.get("/getCarStatus/:startDate",getCarStatus)
router.get("/getAllUserReservations/:email",getAllUserReservations)
router.post("/getUserId",getUserId)
router.post("/createReservation",createReservation)
router.post("/getTotalPayment",getTotalPayment)
router.post("/payment",createPayment)
router.post("/rechargeBalance",rechargeBalance)
router.post("/addUser",addUser)
router.post("/getAllReservations",getAllReservations)
router.post("/getAllCarReservations",getAllCarReservations)
router.post("/getDailyPayments",getDailyPayments)
router.post("/addCar",addCar)
router.post("/editCar",editCar)
router.post("/getAdminId",getAdminId)





module.exports = router