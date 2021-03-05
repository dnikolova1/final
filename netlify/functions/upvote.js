// /.netlify/functions/like
let firebase = require('./firebase')

exports.handler = async function(event) {
  let db = firebase.firestore()
  let body = JSON.parse(event.body)
  let recipeId = body.recipeId
  let userId = body.userId
  
  console.log(`post: ${postId}`)
  console.log(`user: ${userId}`)

  let querySnapshot = await db.collection('upvotes')
                              .where('recipeId', '==', recipeId)
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