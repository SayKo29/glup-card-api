const Schema = require("../models/user.schema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.newUser = (req, res) => {
    // validate requests
    let { name, email, password, gender, role, events } = req.body;
    console.log(req.body);
    if (!req.body)
        return res.status(400).send({ message: "Content can not be empty!" });
    if (!req.body.name)
        return res.status(400).send({ message: "Name can not be empty!" });
    if (!req.body.email)
        return res.status(400).send({ message: "Email can not be empty!" });
    if (!req.body.password)
        return res.status(400).send({ message: "Password can not be empty!" });
    if (req.body.password.length < 8)
        return res.status(400).send({
            message: "Password must be equal or more than 8 character!",
        });
    // if (!req.body.gender)
    //     return res.status(400).send({ message: "Gender can not be empty!" });
    // if (!req.body.role)
    //     return res.status(400).send({ message: "Role can not be empty!" });
    // check if email already exist
    try {
        Schema.findOne({ email }).then((user) => {
            if (!user) {
                console.log("Email belum terdaftar.");
                // convert password to hashed
                const encryptedPassword = bcrypt.hashSync(password, 10);
                console.log(encryptedPassword);
                // initialize newUser data
                const newUser = new Schema({
                    name: name,
                    email: email,
                    gender: gender ? gender : 'male',
                    password: encryptedPassword,
                    role: role ? role : "admin",
                    events: events,
                });
                console.log(newUser);
                newUser
                    .save()
                    .then((user) => {
                        console.log("Register success.");
                        // auto sign in token create from user id
                        var accessToken = jwt.sign(
                            { id: user._id },
                            process.env.JWT_SECRET,
                            { expiresIn: 86400 }
                        );
                        console.log("Token: ", accessToken);

                        return res.status(200).send({
                            message: "User created.",
                            user: {
                                id: user._id,
                                name: user.name,
                                email: user.email,
                                role: user.role,
                            },
                            token: accessToken,
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                        return res
                            .status(500)
                            .send({ message: err.message || "Register fail." });
                    });
            } else if (user) {
                return res.status(409).send({
                    message: "Email have been registered, please login.",
                });
            }
        });
    } catch (err) {
        return res
            .status(500)
            .send({ message: err || "Coba cek koneksi internetmu." });
    }
};

// retrieve all user data from the DB
exports.find = (req, res) => {
    // return users with id as key
    Schema.find()
        .then((data) => {
            let users = {};
            data.forEach((user) => {
                users[user._id] = user;
            });
            return res.status(200).send(users);
        })
        .catch((err) => {
            return res.status(500).send({
                message:
                    err.message || "some error ocurred while retrieving data.",
            });
        });
        

    // Schema.find()
    //     .then((data) => {
    //         return res.status(200).send(data);
    //     })
    //     .catch((err) => {
    //         return res.status(500).send({
    //             message:
    //                 err.message || "some error ocurred while retrieving data.",
    //         });
    //     });
};

// get and find a single user data with id
exports.findById = (req, res) => {
    Schema.findById({ _id: req.params.id })
        .then((data) => {
            if (!data) {
                return res.status(404).send({
                    message:
                        "data not found with id " +
                        req.params.id +
                        ". Make sure the id was correct",
                });
            }
            return res.status(200).send(data);
        })
        .catch((err) => {
            if (err.kind === "ObjectId") {
                return res.status(404).send({
                    message: "data not found with id " + req.params.id,
                });
            }
            return res.status(500).send({
                message: "error retrieving data with id " + req.params.id,
            });
        });
};

// update a user data identified by the  id in the request
exports.findOneAndUpdate = (req, res) => {
    console.log(req.body);
    Schema.findById({ _id: req.params.id })
        .then((currentData) => {
            let {
                newName,
                newEmail,
                newPassword,
                newGender,
                newRole,
                newEvent,
            } = "";
            if (!req.body.name) {
                newName = currentData.name;
            }
            if (!req.body.email) {
                newEmail = currentData.email;
            }
            if (!req.body.password) {
                newPassword = currentData.password;
            }
            if (!req.body.gender) {
                newGender = currentData.gender;
            }
            if (!req.body.role) {
                newRole = currentData.role;
            }
            if (!req.body.events) {
                newEvent = currentData.events;
            }
            if (req.body.name) {
                newName = req.body.name;
            }
            if (req.body.email) {
                newEmail = req.body.email;
            }
            if (req.body.password) {
                newPassword = req.body.password;
            }
            if (req.body.gender) {
                newGender = req.body.gender;
            }
            if (req.body.role) {
                newRole = req.body.role;
            }
            if (req.body.events) {
                newEvent = req.body.events;
            }
            const newData = Schema({
                name: newName,
                email: newEmail,
                password: newPassword,
                gender: newGender,
                role: newRole,
                updatedEvent: newEvent,
                _id: req.params.id,
            });
            console.log(newData);
            // update with new data
            Schema.findByIdAndUpdate({ _id: req.params.id }, newData, {
                new: true,
            })
                .then((updatedData) => {
                    console.log("success update data");
                    return res.status(200).send(updatedData);
                })
                .catch((err) => {
                    if (err.kind === "Object_id") {
                        return res.status(404).send({
                            message:
                                "data not found with _id " + req.params._id,
                        });
                    }
                    return res.status(500).send({
                        message:
                            "error updating data with _id " + req.params._id,
                    });
                });
        })
        .catch((err) => {
            if (err.kind === "ObjectId") {
                return res.status(404).send({
                    message: "data not found with id " + req.params.id,
                });
            }
            return res.status(500).send({
                message: "error retrieving data with id " + req.params.id,
            });
        });
};

// delete a user data with the specified id
exports.findByIdAndRemove = (req, res) => {
    Schema.findByIdAndRemove({ _id: req.params.id })
        .then((data) => {
            if (!data) {
                return res.status(404).send({
                    message: "data not found with id " + req.params.id,
                });
            }
            console.log("data deleted successfully!");
            return res
                .status(200)
                .send({ message: "data deleted successfully!" });
        })
        .catch((err) => {
            if (err.kind === "ObjectId" || err.name === "NotFound") {
                return res.status(404).send({
                    message: "data not found with id " + req.params.id,
                });
            }
            return res.status(500).send({
                message: "could not delete data with id " + req.params.id,
            });
        });
};

// delete all user data in collection
exports.remove = (req, res) => {
    Schema.remove({})
        .then(() => {
            return res
                .status(200)
                .send({ message: "All data deleted successfully!" });
        })
        .catch((err) => {
            return res
                .status(500)
                .send({ message: "Could not delete all data" });
        });
};
