const db = require("../models");

const UserProducts = require("../models").UserProducts;


exports.create = async (req, res) => {
    console.log('Req body', req.body);
    console.log('Req headers', req.headers.authorization);
    
    const token = req.headers.authorization;
    console.log('token', token);
    if (!token) {
        res.status(401).send({
            message: "Authorization token is missing."
        });
        return;
    }
    //check token for header
    if (!req.body) {
        res.status(400).send({
          message: "Content can not be empty!"
        });
        return;
    }


   if (!req.body.code || !req.body.phone) {
        res.status(400).send({
          message: "code and phone can not be empty!"
        });
        return;
    }
    const userProduct = {
        productName: req.body.productName ?? null,
        code: req.body.code,
        isSupported: req.body.isSupported ?? null,
        language: req.body.language ?? 'ua',
        timezone: req.body.timezone ?? 'Europe/Kiev',
        phone: req.body.phone,
        coachPhone: req.body.coachPhone ?? null
    };
    // Save User in the database
    UserProducts.create(userProduct, {raw:true})
        .then(data => {
           res.status(200).send(data);

        })
        .catch(err => {
            res.status(500).send({
            message:
                err.message || "Some error occurred while creating the UserProduct."
            });
    });

};

exports.findAll = (req, res) => {
    const phone = req.query.phone;
    var condition = phone ? { phone: { [Op.like]: `%${phone}%` } } : null;

    UserProducts.findAll({ where: condition })
        .then(data => {
           res.send(data);
        })
        .catch(err => {
            res.status(500).send({
            message:
                err.message || "Some error occurred while retrieving UserProducts."
            });
    });
};

exports.fetchProduct = (req, res) => {
    const phone = req.body.phone;
    var condition = phone ? { phone: { [Op.like]: `%${phone}%` } } : null;

    UserProducts.findOne({ where: condition })
        .then(data => {
           res.send(data);
        })
        .catch(err => {
            res.status(500).send({
            message:
                err.message || "Some error occurred while retrieving UserProducts."
            });
    });
};