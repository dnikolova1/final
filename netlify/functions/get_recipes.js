// /.netlify/functions/get_posts
let firebase = require('./firebase')

exports.handler = async function(event) {
  let db = firebase.firestore()                             // define a variable so we can use Firestore
  let recipesData = []                                        // an empty Array
  
  let recipesQuery = await db.collection('recipes')             // posts from Firestore
                           .orderBy('created')              // ordered by created
                           .get()
  let recipes = recipesQuery.docs                               // the post documents themselves
  
  // loop through the post documents
  for (let i=0; i<recipes.length; i++) {
    let recipeId = recipes[i].id                                // the ID for the given post
    let recipeData = recipes[i].data()                          // the rest of the post data
    let likesQuery = await db.collection('upvotes')           // likes from Firestore
                             .where('postId', '==', recipeId) // for the given postId
                             .get()
    let commentsQuery = await db.collection('comments')     // likes from Firestore
                             .where('postId', '==', recipeId) // for the given postId
                             .get()
    let commentsData = []                                   // an empty Array
    let comments = commentsQuery.docs                       // the comments documents

    // loop through the comment documents
    for (let i=0; i<comments.length; i++) {
      let comment = comments[i].data()                      // grab the comment data
      commentsData.push({
        username: comment.username,                         // the author of the comment
        text: comment.text                                  // the comment text
      })
    }

    // add a new Object of our own creation to the postsData Array
    recipesData.push({
      id: recipeId,                                           // the post ID
      imageUrl: recipeData.imageUrl,                          // the image URL
      username: recipeData.username,                          // the username
      likes: likesQuery.size,                               // number of likes
      comments: commentsData,                                // an Array of comments
      userId: recipeData.userId,
      recipename: recipeData.recipename,
      recipeUrl: recipeData.recipeUrl,
      imageUrl: recipeData.imageUrl, 
      ingredients: recipeData.ingredients,
      instructions: recipeData.instructions,
      userRating: recipeData.userRating
    })
  }
  
  // return an Object in the format that a Netlify lambda function expects
  return {
    statusCode: 200,
    body: JSON.stringify(recipesData)
  }
}