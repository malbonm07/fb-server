const functions = require('firebase-functions');

const express = require('express');
const app = express();

const { db } = require('./util/admin');
// const admin = require('firebase-admin');

const FbAuth = require('./util/fbAuth');

const { getAllScreams, postOneScream, getScream, commentOnScream, likeScream, unlikeScream, deleteScream } = require('./handlers/screams');
const { signup, login, uploadImage, addUserDetails, getAuthenticatedUser, getUserDetails, markNotificationsRead } = require('./handlers/users')

// var serviceAccount = require("./socialapp-78f3d-firebase-adminsdk-r5iuh-9a401a9b74");

// Initialize the app with a service account, granting admin privileges
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://socialapp-78f3d.firebaseio.com"
// });


// scream routes
app.get('/screams', getAllScreams);
app.post('/scream', FbAuth, postOneScream);
app.get('/scream/:screamId', getScream);
app.delete('/scream/:screamId', FbAuth, deleteScream);
app.get('/scream/:screamId/like', FbAuth, likeScream);
app.get('/scream/:screamId/unlike', FbAuth, unlikeScream);
app.post('/scream/:screamId/comment', FbAuth, commentOnScream);

// user routes
app.post('/user/image', FbAuth, uploadImage);
app.post('/user', FbAuth, addUserDetails);
app.get('/user', FbAuth, getAuthenticatedUser);
app.post('/signup', signup);
app.post('/login', login);
app.get('/user/:handle', getUserDetails);
app.post('notifications', FbAuth, markNotificationsRead);

exports.api = functions.https.onRequest(app);



exports.createNotificationOnLike = functions
  .region('us-central1')
  .firestore.document('likes/{id}')
  .onCreate((snapshot) => {
    return db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'like',
            read: false,
            screamId: doc.id
          });
        }
      })
      .catch((err) => console.error(err));
});

exports.deleteNotificationOnUnLike = functions
  .region('us-central1')
  .firestore.document('likes/{id}')
  .onDelete((snapshot) => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch((err) => {
        console.error(err);
        return;
      });
  });

exports.createNotificationOnComment = functions
  .region('us-central1')
  .firestore.document('comments/{id}')
  .onCreate((snapshot) => {
    return db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'comment',
            read: false,
            screamId: doc.id
          });
        }
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });
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