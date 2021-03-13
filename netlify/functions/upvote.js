// /.netlify/functions/like
let firebase = require('./firebase')

exports.handler = async function(event) {
  let db = firebase.firestore()
  let body = JSON.parse(event.body)
  let postId = body.postId
  let userId = body.userId
  
  console.log(`recipe: ${postId}`)
  console.log(`user: ${userId}`)

  let querySnapshot = await db.collection('upvotes')
                              .where('postId', '==', postId)
                              .where('userId', '==', userId)
                              .get()
  let numberOfUpvotes = querySnapshot.size

  if (numberOfUpvotes == 0) {
    await db.collection('upvotes').add({
      postId: recipeId,
      userId: userId
    })
    return { statusCode: 200 }
  } else {
    return { statusCode: 403 }
  }

}