const Schema = require("../models/event.schema");
const Chatroom = require("../models/chatroom.schema");

exports.newEvent = (req, res) => {
    console.log(req.body);
    //
    if (!req.body)
        return res.status(400).send({ message: "Content can not be empty!" });
    if (!req.body.name)
        return res.status(400).send({ message: "Name can not be empty!" });
    if (!req.body.description)
        return res
            .status(400)
            .send({ message: "Description can not be empty!" });
    if (!req.body.latitude) {
        console.log("howareu");
        return res.status(400).send({ message: "Latitude can not be empty!" });
    }
    if (!req.body.longitude) {
        console.log("nope");
        return res.status(400).send({ message: "Longitude can not be empty!" });
    }
    if (!req.body.category) {
        console.log("nope");
        return res.status(400).send({ message: "Category can not be empty!" });
    }
    // if (!req.body.images) {
    //     console.log("nope");
    //     return res.status(400).send({ message: "Images can not be empty!" });
    // }
    // start date
    if (!req.body.startDate) {
        console.log("nope");
        return res.status(400).send({ message: "Start Date can not be empty!" });
    }
    // end date
    if (!req.body.endDate) {
        console.log("nope");
        return res.status(400).send({ message: "End Date can not be empty!" });
    }
    // participants
    


    const newData = Schema({
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        images: req.body.images ? req.body.images : [],
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        user: req.body.user,
        participants: req.body.participants ? req.body.participants : []
        // create a new chatroom
    });

    // create a chatroom and give id for event
    const chatroom = new Chatroom({
        name: req.body.name,
    });
    chatroom.save((err, data) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the new chatroom.",
            });
            return;
        }

        newData.chatroom = data._id;
        

    newData
        .save()
        .then((data) => {
            console.log("Event created.");
            return res.status(200).send({
                message: "Event created.",
                event: {
                    id: data._id,
                    name: data.name,
                    description: data.description,
                    category: data.category,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    images: data.images,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    user: data.user,
                    chatroom: data.chatroom,
                    participants: data.participants
                },
            });
        })
        .catch((err) => {
            console.log("Error: ", err);
            return res.status(500).send({
                message: "Error creating event.",
            });
        });
    });
};

// retrieve all event data from the DB from today and on
// exports.find = (req, res) => {
//     Schema.find()
//         .then((data) => {
//             return res.status(200).send(data);
//         })
//         .catch((err) => {
//             return res.status(500).send({
//                 message:
//                     err.message || "some error ocurred while retrieving data.",
//             });
//         });
// };

// retrieve all event data from the DB where startDate is today or later || endDate is today or later
exports.find = (req, res) => {
    Schema.find({
        $or: [
            { startDate: { $gte: new Date() } },
            { endDate: { $gte: new Date() } },
        ],
    })
        .then((data) => {
            return res.status(200).send(data);
        })
        .catch((err) => {
            return res.status(500).send({
                message:
                    err.message || "some error ocurred while retrieving data.",
            });
        });
};

// find events by participant id
exports.findByParticipant = (req, res) => {
    Schema.find({ participants: req.params.id })
        .then((data) => {
            return res.status(200).send(data);
            
        })
        .catch((err) => {
            return res.status(500).send({
                message:
                    err.message || "some error ocurred while retrieving data.",
            });
        });
};



// get and find a single event data with id
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

// update a event data identified by the  id in the request
exports.findOneAndUpdate = (req, res) => {
    console.log(req.body);
    Schema.findById({ _id: req.params.id })
        .then((currentData) => {
            let {
                newName,
                newDescription,
                newCategory,
                newLatitude,
                newLongitude,
                newImages,
                newStartDate,
                newEndDate,
                newParticipants,
            } = "";
            if (!req.body.name) {
                newName = currentData.name;
            }
            if (!req.body.description) {
                newDescription = currentData.description;
            }
            if (!req.body.category) {
                newCategory = currentData.category;
            }
            if (!req.body.latitude) {
                newLatitude = currentData.latitude;
            }
            if (!req.body.longitude) {
                newLongitude = currentData.longitude;
            }
            if (!req.body.images) {
                newImages = currentData.images;
            }
            if (!req.body.startDate) {
                newStartDate = currentData.startDate;
            }
            if (!req.body.endDate) {
                newEndDate = currentData.endDate;
            }
            if (!req.body.participants) {
                newParticipants = currentData.participants;
            }
            if (req.body.name) {
                newName = req.body.name;
            }
            if (req.body.description) {
                newDescription = req.body.description;
            }
            if (req.body.category) {
                newCategory = req.body.category;
            }
            if (req.body.latitude) {
                newLatitude = req.body.latitude;
            }
            if (req.body.longitude) {
                newLongitude = req.body.longitude;
            }
            if (req.body.images) {
                newLongitude = req.body.images;
            }
            if (req.body.startDate) {
                newStartDate = req.body.startDate;
            }
            if (req.body.endDate) {
                newEndDate = req.body.endDate;
            }
            if (req.body.participants) {
                newParticipants = req.body.participants;
            }
            const newData = Schema({
                name: newName,
                email: newDescription,
                category: newCategory,
                latitude: newLatitude,
                longitude: newLongitude,
                images: newImages,
                startDate: newStartDate,
                endDate: newEndDate,
                participants: newParticipants,
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

// delete a event data with the specified id
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

// delete all event data in collection
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
