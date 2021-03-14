// /.netlify/functions/get_posts
let firebase = require('./firebase')

exports.handler = async function(event) {
  
  let queryStringPostId = event.queryStringParameters.recipeId
  
  let db = firebase.firestore()                             // define a variable so we can use Firestore
  let recipesData = []                                        // an empty Array
  
    let myrecipeQuery = await db.collection('recipes')           // likes from Firestore
                                .doc(queryStringPostId)
                                .get()
    recipeData = myrecipeQuery.data()

    let likesQuery = await db.collection('likes')           // likes from Firestore
                             .where('postId', '==',queryStringPostId) // for the given postId
                             .get()
    //console.log(likesQuery)
    let commentsQuery = await db.collection('comments')     // likes from Firestore
                             .where('postId', '==', queryStringPostId) // for the given postId
                             .get()
    //console.log(commentsQuery)

    let commentsData = []                                   // an empty Array
    let comments = commentsQuery.docs                       // the comments documents

    //loop through the comment documents
    for (let i=0; i<comments.length; i++) {
      let comment = comments[i].data()                      // grab the comment data
      commentsData.push({
        username: comment.username,                         // the author of the comment
        text: comment.text                                  // the comment text
      })
    }

   // add a new Object of our own creation to the postsData Array
    recipesData.push({
      id: myrecipeQuery.id,                                           // the post ID
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
  //}
  
  // return an Object in the format that a Netlify lambda function expects
  return {
    statusCode: 200,
    body: JSON.stringify(recipesData)
  }
}