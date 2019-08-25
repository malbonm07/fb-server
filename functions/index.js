const functions = require('firebase-functions');

const express = require('express');
const app = express();

// const admin = require('firebase-admin');

const FbAuth = require('./util/fbAuth');

const { getAllScreams, postOneScream, getScream, commentOnScream, likeScream, unlikeScream } = require('./handlers/screams');
const { signup, login, uploadImage, addUserDetails, getAuthenticatedUser } = require('./handlers/users')

// var serviceAccount = require("./socialapp-78f3d-firebase-adminsdk-r5iuh-9a401a9b74");

// Initialize the app with a service account, granting admin privileges
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://socialapp-78f3d.firebaseio.com"
// });


app.get('/screams', getAllScreams);
app.post('/scream', FbAuth, postOneScream);
app.get('/scream/:screamId', getScream);

app.get('/scream/:screamId/like', FbAuth, likeScream);
app.get('/scream/:screamId/unlike', FbAuth, unlikeScream);
app.post('/scream/:screamId/comment', FbAuth, commentOnScream);

app.post('/user/image', FbAuth, uploadImage);
app.post('/user', FbAuth, addUserDetails);
app.get('/user', FbAuth, getAuthenticatedUser);

app.post('/signup', signup);
app.post('/login', login);

exports.api = functions.https.onRequest(app);


// const firebase = require('firebase');
// firebase.initializeApp(config);

// const db = admin.firestore();




// app.get('/screams', (req,res) => {

//     db
//     .collection('screams')
//     .orderBy('createdAt', 'desc')
//     .get()
//     .then((data) => {
//         let screams = [];
//         data.forEach((doc) => {
//             screams.push({
//                 screamId: doc.id,
//                 body: doc.data().body,
//                 userHandle: doc.data().userHandle,
//                 createdAt: doc.data().createdAt
//             });
//         });
//         return res.json(screams);
//     })
//     .catch(err => console.error(err))
// })


//  app.post('/scream', (req, res) => {
//      const newScream = {
//          body: req.body.body,
//          userHandle: req.body.userHandle,
//          createdAt: new Date().toISOString()
//      };

//      db
//      .collection('screams')
//      .add(newScream)
//      .then((doc) => {
//          res.json({message: `document ${doc.id} created succesfully`});
//      })
//      .catch((err) => {
//          res.status(500).json({error: 'something went wrong'});
//          console.error(err);
//      })
//  })

// app.post('/signup', (req, res) => {
//     const newUser = {
//         email: req.body.email,
//         password: req.body.password,
//         confirmPassword: req.body.confirmPassword,
//         handle: req.body.handle,
//     };

//     db.doc(`/users/${newUser.handle}`).get()
//     .then(doc => {
//         if(doc.exists) {
//             return res.status(400).json({handle:'this handle is already taken'})
//         } else {
//             return firebase
//             .auth()
//             .createUserWithEmailAndPassword(newUser.email, newUser.password);
//         }
//     })
//     .then((data) => {
//         return data.user.getIdToken();
//     })
//     .then((idToken) => {
//         token = idToken
//         const userCredentials = {
//             handle: newUser.handle,
//             email: newUser.email,
//             createdAt: new Date().toISOString(),
//             userId
//         }
//         return db.doc(`/users/${newUser.handle}`).set(userCredentials);
//     })
//     .then(() => {
//         return res.status(201).json({token});
//     })
//     .catch((err) => {
//         // console.log(err)
//         if(err.code === 'auth/email-already-in-use') {
//             return res.status(400).json({email: 'Email is already in use'})
//         }
//         else {
//             return res.status(500).json({error : err.code})
//         }
//     })
// })

//  exports.api = functions.https.onRequest(app);