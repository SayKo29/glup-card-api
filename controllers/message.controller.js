const Schema = require("../models/message.schema");

exports.newMessage = (req, res) => {
    console.log(req.body);
    //
    const newData = Schema({
        user: req.body.user,
        message: req.body.message,
        chatroom: req.body.chatroom,
    });

    console.log("prueba funciona?" + newData);

    newData
        .save(newData)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    "Some error occurred while creating the new message.",
            });
        });
}

exports.getMessages = (req, res) => {
    Schema.find()
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message:
                    err.message ||
                    "Some error occurred while retrieving messages.",
            });
        });
}

exports.getMessage = (req, res) => {
    
        const id = req.params.id;
    
        Schema.findById(id)
            .then((data) => {
                if (!data)
                    res.status(404).send({ message: "Not found message with id " + id });
                else res.send(data);
            }
            )
            .catch((err) => {
                res
                    .status(500)
                    .send({ message: "Error retrieving message with id=" + id });
            }
            );
    }

exports.updateMessage = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update can not be empty!",
        });
    }

    const id = req.params.id;

    Schema.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then((data) => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot update message with id=${id}. Maybe message was not found!`,
                });
            } else res.send({ message: "message was updated successfully." });
        })
        .catch((err) => {
            res.status(500).send({
                message: "Error updating message with id=" + id,
            });
        });
}

exports.deleteMessage = (req, res) => {
    const id = req.params.id;

    Schema.findByIdAndRemove(id)
        .then((data) => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot delete message with id=${id}. Maybe message was not found!`,
                });
            } else {
                res.send({
                    message: "message was deleted successfully!",
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: "Could not delete message with id=" + id,
            });
        });
}
