const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({            
            name: {type:String,required:true},
            category: {type:String,required:true},
            image: {type:String,required:true},
            imageArr: {type:Array,required:true},
            address: {type:String,required:true},
            city: {type:String,required:true},
            state: {type:String,required:true,default:"Himachal Pradesh"},
            country: {type:String,required:true,default:"India"},
            price: {type:Number,required:true,default:2999},
            rating: {type:Number,required:true,default:3.7},
            numberOfBathrooms: {type:Number,required:true,default:2},
            numberOfBeds: {type:Number,required:true,default:2},
            numberOfguest: {type:Number,required:true,default:6},
            numberOfBedrooms: {type:Number,required:true,default:2},
            numberOfStudies: {type:Number,required:true,default:0},
            hostName: {type:String,required:true,default:"Daleep"},
            hostJoinedOn: {type:String,required:true,default:"March 2018"},
            ameneties: {type:[String],required:true,default:["Kitchen", "Wifi", "Pets Allowed"]},
            healthAndSafety: {type:[String],required:true,default:["Smoke alarm", "Carbon monoxide alarm"]},
            houseRules: {type:[String],required:true,default:["Check-in: 12:00 pm - 11:00 pm", "Check out: 11:00 am", "Pets are allowed"]},
            propertyType: {type:String,required:true,default:"Hotel"},
            isCancelable: {type:Boolean,required:true,default:true},
        });

const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;