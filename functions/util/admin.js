const admin = require('firebase-admin');
var serviceAccount = require("./socialapp-78f3d-firebase-adminsdk-r5iuh-9a401a9b74");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://socialapp-78f3d.firebaseio.com",
    storageBucket: "socialapp-78f3d.appspot.com"
});

const db = admin.firestore();

module.exports = { admin, db };