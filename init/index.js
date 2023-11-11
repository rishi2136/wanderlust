let mongoose = require("mongoose");
let initData = require("./data.js");
// important to put two dots
const Listing = require("../modals/listing.js")

const db_url = "mongodb://127.0.0.1:27017/wanderlust";
main()
    .then(() => {
        console.log("connected with root");
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(db_url);
}

let initDB = async ()=> {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj, owner: "653ce8f93339cbeb39b924c0", category: "rooms"}));
    await Listing.insertMany(initData.data);
    console.log("data was initialised");
}

initDB();