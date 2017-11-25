const functions = require("firebase-functions");
const gcs = require('@google-cloud/storage')();
const Filter = require("bad-words");
const spawn = require('child-process-promise').spawn;
const badWordsFilter = new Filter();

exports.moderator = functions.firestore
  .document("/comments/{commentsId}")
  .onWrite(event => {
    const comment = event.data.data();
    if (comment && !comment.sanitized) {
      console.log("Retrieved comment content: ", comment);
      const moderatedComment = moderateComment(comment.text);
      console.log(
        "Comment has been moderated. Saving to DB: ",
        moderatedComment
      );
      return event.data.ref.set(
        {
          text: moderatedComment,
          sanitized: true
        },
        { merge: true }
      );
    }
  });

exports.generateThumbnail = functions.storage.object().onChange(event=>{
    const object = event.data;
    const filePath = object.name;
    const fileName = filePath.split('/').pop();
    const fileBucket = object.bucket;
    const bucket = gcs.bucket(fileBucket);
    const tempFilePath = `/tmp/${fileName}`;

    if (fileName.startsWith('thumb_')) {
        console.log('already a thumb image');
        return;
    }

    if (!object.contentType.startsWith('image/')) {
        console.log('not an image');
        return;
    }

    if (object.resourceState === 'not_exists') {
        console.log('image deleted');
        return;
    }

    return bucket.file(filePath).download({
        destination:tempFilePath
    })
    .then(()=>{
        console.log('image downloaded locally to ',tempFilePath);
        return spawn('convert',[tempFilePath,'-thumbnail','200x200>',tempFilePath]);
    })
    .then(()=>{
        console.log('thumpnail created');
        const thumbFilePath = filePath.replace(/(\/)?([^\/]*)$/,'1$thumb_$2');

        return bucket.upload(tempFilePath,{
            destination : thumbFilePath
        });
    })
})

function moderateComment(comment) {
  // Moderate if the user uses SwearWords.
  if (containsSwearwords(comment)) {
    console.log("User is swearing. moderating...");
    comment = moderateSwearwords(comment);
  }

  return comment;
}

// Returns true if the string contains swearwords.
function containsSwearwords(comment) {
  return comment !== badWordsFilter.clean(comment);
}

// Hide all swearwords. e.g: Crap => ****.
function moderateSwearwords(comment) {
  return badWordsFilter.clean(comment);
}
