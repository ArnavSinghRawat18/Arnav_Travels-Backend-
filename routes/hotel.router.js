const express = require('express');
const router = express.Router();

const Hotel=require("../model/hotel.model.js");


router.route("/") //localhost:3500
    .get(async (req, res) => {
        const hotelCategory=req.query.category//http:localhost:3500/api/hotels?category=National+Park
        try{
            let hotels
            if(hotelCategory) hotels=await Hotel.find({category:hotelCategory});
            hotels ? res.json(hotels): res.status(404).json({message:"No hotels found"});
        }catch(err){
            console.log(err)
        }
        
    });

module.exports = router;