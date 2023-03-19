const Schema = require("../models/category.schema");

exports.newEvent = (req, res) => {
    console.log(req.body);
    if (!req.body)
        return res.status(400).send({ message: "Content can not be empty!" });
    if (!req.body.name)
        return res.status(400).send({ message: "Name can not be empty!" });
    if (!req.body.description)
        return res
            .status(400)
            .send({ message: "Description can not be empty!" });

    const newData = Schema({
        name: req.body.name,
        description: req.body.description,
        icon: req.body.icon,
    });

    newData
        .save()
        .then((data) => {
            console.log("Category created.");
            return res.status(200).send({
                message: "Category created.",
                event: {
                    id: data._id,
                    name: data.name,
                    description: data.description,
                    icon: data.category,
                },
            });
        })
        .catch((err) => {
            console.log("Error: ", err);
            return res.status(500).send({
                message: "Error creating category.",
            });
        });
};

// retrieve all event data from the DB
exports.find = (req, res) => {
    Schema.find()
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
            let { newName, newDescription, newIcon } = "";
            if (!req.body.name) {
                newName = currentData.name;
            }
            if (!req.body.description) {
                newDescription = currentData.description;
            }
            if (!req.body.icon) {
                newIcon = currentData.icon;
            }

            if (req.body.name) {
                newName = req.body.name;
            }
            if (req.body.description) {
                newDescription = req.body.description;
            }
            if (req.body.icon) {
                newIcon = req.body.icon;
            }

            const newData = Schema({
                name: newName,
                email: newDescription,
                icon: newIcon,
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
