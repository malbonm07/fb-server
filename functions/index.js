const functions = require('firebase-functions');

const express = require('express');
const app = express();

const { db } = require('./util/admin');


const FbAuth = require('./util/fbAuth');

const { getAllScreams, postOneScream, getScream, commentOnScream, likeScream, unlikeScream, deleteScream } = require('./handlers/screams');
const { signup, login, uploadImage, addUserDetails, getAuthenticatedUser, getUserDetails, markNotificationsRead } = require('./handlers/users')


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
app.post('/notifications', FbAuth, markNotificationsRead);

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

exports.onUserImageChange = functions
  .region('us-central1')
  .firestore.document('/users/{userId}')
  .onUpdate((change) => {
    console.log(change.before.data());
    console.log(change.after.data());
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log('image has changed');
      const batch = db.batch();
      return db
        .collection('screams')
        .where('userHandle', '==', change.before.data().handle)
        .get()
        .then((data) => {
          data.forEach((doc) => {
            const scream = db.doc(`/screams/${doc.id}`);
            batch.update(scream, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        });
    } else return true;
  });

exports.onScreamDelete = functions
  .region('us-central1')
  .firestore.document('/screams/{screamId}')
  .onDelete((snapshot, context) => {
    const screamId = context.params.screamId;
    const batch = db.batch();
    return db
      .collection('comments')
      .where('screamId', '==', screamId)
      .get()
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db
          .collection('likes')
          .where('screamId', '==', screamId)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        });
        return db
          .collection('notifications')
          .where('screamId', '==', screamId)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch((err) => console.error(err));
  });