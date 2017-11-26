const functions = require("firebase-functions");
// Include a Service Account Key to use a Signed URL
const gcs = require('@google-cloud/storage')({keyFilename: 'service-account-credentials.json'});
const Filter = require("bad-words");
const spawn = require("child-process-promise").spawn;
const badWordsFilter = new Filter();
const path = require("path");
const os = require("os");
const fs = require("fs");
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

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

exports.generateThumbnail = functions.storage.object().onChange(event => {
  const object = event.data;

  const fileBucket = object.bucket; // The Storage bucket that contains the file.
  const filePath = object.name; // File path in the bucket.
  const contentType = object.contentType; // File content type.
  const resourceState = object.resourceState; // The resourceState is 'exists' or 'not_exists' (for file/folder deletions).
  const metageneration = object.metageneration; // Number of times metadata has been generated. New objects have a value of 1.

  if (!contentType.startsWith("image/")) {
    console.log("This is not an image.");
    return;
  }

  // Get the file name.
  const fileName = path.basename(filePath);
  // Exit if the image is already a thumbnail.
  if (fileName.startsWith("thumb_")) {
    console.log("Already a Thumbnail.");
    return;
  }

  // Exit if this is a move or deletion event.
  if (resourceState === "not_exists") {
    console.log("This is a deletion event.");
    return;
  }

  // Exit if file exists but is not new and is only being triggered
  // because of a metadata change.
  if (resourceState === "exists" && metageneration > 1) {
    console.log("This is a metadata change event.");
    return;
  }
  // [END stopConditions]

  // [START thumbnailGeneration]
  // Download file from bucket.
  const bucket = gcs.bucket(fileBucket);
  const tempFilePath = path.join(os.tmpdir(), fileName);
  const metadata = { contentType: contentType };
  // We add a 'thumb_' prefix to thumbnails file name. That's where we'll upload the thumbnail.
  const thumbFileName = `thumb_${fileName}`;
  const thumbFilePath = path.join(path.dirname(filePath), thumbFileName);
  const thumbFile = bucket.file(thumbFilePath);

  return bucket
    .file(filePath)
    .download({
      destination: tempFilePath
    })
    .then(() => {
      console.log("Image downloaded locally to", tempFilePath);
      // Generate a thumbnail using ImageMagick.
      return spawn("convert", [
        tempFilePath,
        "-thumbnail",
        "200x200>",
        tempFilePath
      ]);
    })
    .then(() => {
      console.log("Thumbnail created at", tempFilePath);
      // Uploading the thumbnail.
      return bucket.upload(tempFilePath, {
        destination: thumbFilePath,
        metadata: metadata
      });
      // Once the thumbnail has been uploaded delete the local file to free up disk space.
    })
    .then((file) => {
      fs.unlinkSync(tempFilePath);
      bucket.file(filePath).delete().then(()=>{
        console.log('original file deleted to free-up space');
      });
      // Get the Signed URLs for the thumbnail and original image.
      const config = {
        action: 'read',
        expires: '03-01-2500'
      };
      return thumbFile.getSignedUrl(config);
    })
    .then((url)=>{
      console.log('signed url:',url[0]);
      const id = fileName.split(".")[0];
      return admin.firestore().collection("comments").doc(id).set({
        avatar : url[0]
      },{ merge: true });
    })
});

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
