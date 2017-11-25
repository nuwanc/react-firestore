const functions = require('firebase-functions');
const Filter = require('bad-words');
const badWordsFilter = new Filter();


exports.moderator = functions.firestore.document('/comments/{commentsId}')
.onWrite(event => {
    const comment = event.data.data();
    if (comment && !comment.sanitized) {
        console.log('Retrieved comment content: ', comment);
        const moderatedComment = moderateComment(comment.text);
        console.log('Comment has been moderated. Saving to DB: ', moderatedComment);
        return event.data.ref.set({
            text : moderatedComment,
            sanitized : true
        }, {merge: true});
    }
});

function moderateComment(comment) {
    
      // Moderate if the user uses SwearWords.
      if (containsSwearwords(comment)) {
        console.log('User is swearing. moderating...');
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