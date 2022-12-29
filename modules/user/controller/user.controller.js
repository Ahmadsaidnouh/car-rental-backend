const query = require("../../../DB/config")
const bcrypt = require('bcrypt');
const saltRounds = 10;

const getCarStatus = (req, res, next) =>
{
    let { startDate } = req.params;


    let all = `SELECT DISTINCT car_id, car_plate FROM car ;`
    let reserved = `SELECT DISTINCT car_id, car_plate FROM reservation as r where ("${startDate}" between r.start_date and r.payment_date) and (r.reserv_status != "cancelled");`
    let outOfService = `SELECT DISTINCT car_id, car_plate FROM outofservice as r where ("${startDate}" between r.start_date and r.end_date);`
    let allCars = []
    let reservedCars = []
    let outOfServiceCars = []
    query.execute(all, (err, data) =>
    {
        allCars = data;
        query.execute(reserved, (err, data) =>
        {
            reservedCars = data;
            query.execute(outOfService, (err, data) =>
            {
                outOfServiceCars = data;

                let ans = allCars.filter(a => !reservedCars.map(b => b.car_id).includes(a.car_id));
                ans = ans.filter(a => !outOfServiceCars.map(b => b.car_id).includes(a.car_id));


                let reservedFinal = []
                reservedCars.forEach((e) =>
                {
                    reservedFinal.push({ car_id: e.car_id, car_plate: e.car_plate, status: 'reserved' });
                })
                let outOSFinal = []
                outOfServiceCars.forEach((e) =>
                {
                    outOSFinal.push({ car_id: e.car_id, car_plate: e.car_plate, status: 'out of service' });
                })
                let availFinal = []
                ans.forEach((e) =>
                {
                    availFinal.push({ car_id: e.car_id, car_plate: e.car_plate, status: 'available' });
                })


                let finalANs = [];
                finalANs.push(...availFinal);
                finalANs.push(...outOSFinal);
                finalANs.push(...reservedFinal);
                finalANs.sort((a, b) => (a.car_id > b.car_id ? 1 : -1))
                res.json({ message: "allah", finalANs });

            })
        })
    })

}
const getAvailableCars = (req, res, next) =>
{
    let { dropDate, dropLoc, pickDate, pickLoc } = req.body;
    let temp = pickLoc.split('-');

    for (let i = 0; i < temp.length; i++) {
        temp[i] = temp[i].trim().toLowerCase();
    }

    let pickCity, pickCountry, all;
    if (temp.length == 1) {
        pickCountry = pickLoc;
        all = `select car_id from car where country='${pickCountry}'`
    }
    else if (temp.length == 2) {

        pickCity = temp[0];
        pickCountry = temp[1];
        all = `select car_id from car where country='${pickCountry}' and park_city='${pickCity}'`
    }
    else {
        pickCity = temp[1];
        pickCountry = temp[2];
        all = `select car_id from car where country='${pickCountry}' and park_city='${pickCity}'`

    }
    let reserved = `select distinct car_id from reservation where ((start_date between '${pickDate}' and '${dropDate}') or (end_date between '${pickDate}' and '${dropDate}') or ((start_date <= '${pickDate}') and (end_date >= '${dropDate}')) or (start_date >= '${pickDate}' and end_date <= '${dropDate}')) and (reserv_status='not-picked' or reserv_status='picked')`
    let outOfService = `select car_id from outOfService where ((start_date between '${pickDate}' and '${dropDate}') or (end_date between '${pickDate}' and '${dropDate}') or ((start_date <= '${pickDate}') and (end_date >= '${dropDate}')) or (start_date >= '${pickDate}' and end_date <= '${dropDate}'))`
    let allCars = []
    let reservedCars = []
    let outOfServiceCars = []
    query.execute(all, (err, data) =>
    {
        allCars = data;
        query.execute(reserved, (err, data) =>
        {
            reservedCars = data;
            query.execute(outOfService, (err, data) =>
            {
                outOfServiceCars = data;

                let ans = allCars.filter(a => !reservedCars.map(b => b.car_id).includes(a.car_id));
                ans = ans.filter(a => !outOfServiceCars.map(b => b.car_id).includes(a.car_id));

                let car_ids = ''
                ans.forEach((e) =>
                {
                    car_ids += (e.car_id + ',')
                })
                car_ids = car_ids.slice(0, car_ids.length - 1);
                query.execute(`select * from car where car_id in (${car_ids})`, (err, data) =>
                {
                    data = data == undefined ? [] : data;
                    res.json({ message: "allah", data })
                })
            })
        })
    })

}
const getCarSpecs = (req, res, next) =>
{
    let { carId } = req.params;
    let carQuery = `select * from car where car_id=${carId}`

    query.execute(carQuery, (err, data) =>
    {
        res.json({ message: "allah", data })
    })

}
const getUserReservs = (req, res, next) =>
{
    let userQuery = `select * from reservation where user_id=${userId}`

    query.execute(userQuery, (err, data) =>
    {
        if (err)
            res.json({ message: "error", err })
        else
            res.json({ message: "allah", data })
    })

}
const getUserId = (req, res, next) =>
{
    let { email, password } = req.body;
    let userQuery = `select id, firstName, lastName, password from user where email='${email}'`
    query.execute(userQuery, (err, data) =>
    {
        if (data.length == 1) {
            hash = data[0].password;
            bcrypt.compare(password, hash, function (err, result)
            {
                if (result) {
                    res.json({ message: "allah", data })

                }
                else {
                    data = []
                    res.json({ message: "allah", data })
                }
            });
        }
        else {
            data = []
            res.json({ message: "allah", data })
        }
    })

}
const createReservation = (req, res, next) =>
{
    let { carId, userId, startDate, endDate, dropLoc, pickLoc, carName, carPlate } = req.body;
    let temp = dropLoc.split('-');
    let country = temp[2].trim().toLowerCase();
    let dCity = temp[1].trim().toLowerCase();
    let dLocation = temp[0].trim().toLowerCase();
    temp = pickLoc.split('-');
    let pCity = temp[1].trim().toLowerCase();
    let pLocation = temp[0].trim().toLowerCase();
    let insertReservQuery = `INSERT INTO reservation( car_id, user_id, start_date, end_date, reserv_status, country, dropoff_city, dropoff_location, pickup_city, pickup_location, car_name, car_plate) VALUES (${carId},${userId},'${startDate}','${endDate}','not-picked','${country}','${dCity}','${dLocation}','${pCity}','${pLocation}','${carName}','${carPlate}');`
    query.execute(insertReservQuery, (err, data) =>
    {
        if (err)
            res.json({ message: "error", err })
        else
            res.json({ message: "allah", data })
    })

}

const cancelReservation = (req, res, next) =>
{
    let { reservId } = req.params;
    let cancelQuery = `UPDATE reservation SET reserv_status='cancelled' WHERE reserv_id=${reservId}`

    query.execute(cancelQuery, (err, data) =>
    {
        if (err)
            res.json({ message: "error", err })
        else
            res.json({ message: "done", data })
    })

}

const pickReservation = (req, res, next) =>
{
    let { reservId } = req.params;
    let cancelQuery = `UPDATE reservation SET reserv_status='picked' WHERE reserv_id=${reservId}`

    query.execute(cancelQuery, (err, data) =>
    {
        if (err)
            res.json({ message: "error", err })
        else
            res.json({ message: "done", data })
    })

}

const getTotalPayment = (req, res, next) =>
{
    let { carId, startDate, endDate, currentDate } = req.body;
    let totalPayment;


    query.execute(`SELECT rental_charge FROM car WHERE car_id=${carId};`, (err, data) =>
    {
        let charge = data[0].rental_charge;
        if (currentDate <= endDate) {
            let duration = daysCount(new Date(currentDate), new Date(startDate))
            totalPayment = duration * charge;
            res.json({ message: "allah", totalPayment })
        }
        else {
            let duration = daysCount(new Date(endDate), new Date(startDate))
            let penaltyDuration = daysCount(new Date(currentDate), new Date(endDate));
            totalPayment = duration * charge + penaltyDuration * 100;
            res.json({ message: "allah", totalPayment })
        }
    })
}
const createPayment = (req, res, next) =>
{
    let { location, city, country, totalPayment, currentDate, reservId, userId, carId } = req.body;
    query.execute(`SELECT balance FROM user WHERE id=${userId}`, (err, data) =>
    {
        let userBalance = data[0].balance;
        if (userBalance < totalPayment) {
            res.json({ message: "low balance" })
        }
        else {
            userBalance -= totalPayment;
            query.execute(`UPDATE user SET balance=${userBalance}  WHERE id=${userId}`, (err, data) =>
            {
                query.execute(`SELECT * FROM payments WHERE date_pay='${currentDate}'`, (err, data) =>
                {
                    if (data.length == 0) {
                        query.execute(`INSERT INTO payments(date_pay, balance) VALUES ('${currentDate}',${totalPayment})`, (err, data) =>
                        {
                            query.execute(`UPDATE car SET park_city='${city}',park_location='${location}' WHERE car_id=${carId}`, (err, data) =>
                            {
                                query.execute(`UPDATE reservation SET payment_date='${currentDate}', reserv_status='ended', payment=${totalPayment} WHERE reserv_id=${reservId}`, (err, data) =>
                                {
                                    res.json({ message: "done" })
                                })
                            })
                        })
                    }
                    else {
                        query.execute(`UPDATE payments SET balance=balance+${totalPayment} WHERE date_pay='${currentDate}'`, (err, data) =>
                        {
                            query.execute(`UPDATE car SET park_city='${city}',park_location='${location}' WHERE car_id=${carId}`, (err, data) =>
                            {
                                query.execute(`UPDATE reservation SET payment_date='${currentDate}', reserv_status='ended', payment=${totalPayment} WHERE reserv_id=${reservId}`, (err, data) =>
                                {
                                    res.json({ message: "done" })
                                })
                            })
                        })
                    }
                })
            })
        }
    })
}

const rechargeBalance = (req, res, next) =>
{
    let { addition, userId } = req.body;
    query.execute(`UPDATE user SET balance=balance+${addition}  WHERE id=${userId}`, (err, data) =>
    {
        res.json({ message: "done", data })
    })
}

const addUser = (req, res, next) =>
{

    let { balance, country, email, firstName, gender, lastName, password, phone, age } = req.body;

    query.execute(`select * from user where email='${email}'`, (err, data) =>
    {
        if (data.length != 0) {
            res.json({ message: "error" })
        }
        else {
            bcrypt.hash(password, saltRounds, function (err, hash)
            {
                query.execute(`INSERT INTO user(email, firstName, lastName, gender, phone, country, balance, password, age) VALUES ('${email}','${firstName}','${lastName}','${gender}','${phone}','${country}',${balance},'${hash}', ${age})`, (err, data) =>
                {
                    res.json({ message: "done", data })

                })
            });
        }
    })
}

const getAllReservations = (req, res, next) =>
{

    let {
        startDate,
        endDate
    } = req.body;

    let resQuery = `SELECT DISTINCT * FROM reservation as r, user as u WHERE r.user_id = u.id and ((r.start_date BETWEEN "${startDate}" and "${endDate}") or (r.payment_date BETWEEN "${startDate}" and "${endDate}")) ORDER by r.reserv_id;`

    query.execute(resQuery, (err, data) =>
    {
        res.json({ message: "done", data })
    })
}
const getAllCarReservations = (req, res, next) =>
{

    let {
        carPlate,
        startDate,
        endDate
    } = req.body;
    let resQuery = `SELECT DISTINCT * FROM reservation as r, car as c WHERE r.car_id = c.car_id and r.car_plate="${carPlate}" and ((r.start_date BETWEEN "${startDate}" and "${endDate}") or (r.payment_date BETWEEN "${startDate}" and "${endDate}")) ORDER by r.reserv_id;`

    query.execute(resQuery, (err, data) =>
    {
        res.json({ message: "done", data })
    })
}
const getAllUserReservations = (req, res, next) =>
{

    let {
        email
    } = req.params;
    let resQuery = `SELECT DISTINCT * FROM reservation as r, user as u WHERE r.user_id = u.id and u.email = '${email}' ORDER by r.reserv_id;`

    query.execute(resQuery, (err, data) =>
    {
        res.json({ message: "done", data })
    })
}

const getDailyPayments = (req, res, next) =>
{

    let {
        startDate,
        endDate
    } = req.body;


    let resQuery = `SELECT DISTINCT * FROM payments WHERE (date_pay BETWEEN "${startDate}" and "${endDate}");`

    query.execute(resQuery, (err, data) =>
    {
        res.json({ message: "done", data })
    })
}

const daysCount = (date_1, date_2) =>
{
    let difference = date_1.getTime() - date_2.getTime();
    let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
    return TotalDays + 1;
}

const addCar = (req, res, next) =>
{
    let { company, model, year, category, transmission, car_plate, car_status, country, park_city, park_location, rental_charge, rating, retal_counts } = req.body;
    query.execute(`INSERT INTO user(company, model, year, category, transmission, car_plate, car_status, country, park_city, park_location, rental_charge, rating, retal_counts) VALUES ('${company}','${model}','${year}','${category}','${transmission}','${car_plate}',${car_status},'${country}','${park_city}','${park_location}','${rental_charge}','${rating}','${rental_counts}')`, (err, data) =>
    {
        res.json({ message: "done", data })
    })
}

const editCar = (req, res, next) =>
{
    let { car_plate, country } = req.body;
    query.execute(`UPDATE car SET car_status='${car_status}' WHERE car_plate=${car_plate} and country =`, (err, data) =>
    {
        res.json({ message: "done", data })
    })
}


/* admin */
const getAdminId = (req, res, next) =>
{
    let { email, password } = req.body;

    let userQuery = `select id, password from admin where email='${email}'`
    query.execute(userQuery, (err, data) =>
    {
        if (data.length == 1) {
            hash = data[0].password;
            bcrypt.compare(password, hash, function (err, result)
            {
                if (result) {
                    res.json({ message: "exists", data })

                }
                else {
                    data = []
                    res.json({ message: "allah", data })
                }
            });
        }
        else {
            data = []
            res.json({ message: "allah", data })
        }
    })
}

module.exports = {
    getAvailableCars,
    getCarSpecs,
    getUserId,
    createReservation,
    getUserReservs,
    cancelReservation,
    pickReservation,
    getTotalPayment,
    createPayment,
    rechargeBalance,
    addUser,
    getAllReservations,
    getAllCarReservations,
    getCarStatus,
    getAllUserReservations,
    getDailyPayments,
    addCar,
    editCar,
    getAdminId
}