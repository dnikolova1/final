let firebase = require('./firebase')

exports.handler = async function(event) {
  let db = firebase.firestore()
  let body = JSON.parse(event.body)
  let userId = body.userId
  let username = body.username
  let recipename = body.recipename
  let recipeUrl = body.recipeUrl
  let imageUrl = body.imageUrl
  let ingredients = body.ingredients
  let instructions = body.instructions
  let userRating = body.userRating
  
  console.log(`user: ${userId}`)
  console.log(`imageUrl: ${imageUrl}`)
  console.log(`recipename: ${recipename}`)

  let newRecipe = { 
    userId: userId,
    username: username, 
    recipename: recipename,
    recipeUrl: recipeUrl,
    imageUrl: imageUrl, 
    ingredients: ingredients,
    instructions: instructions,
    userRating: userRating,
    created: firebase.firestore.FieldValue.serverTimestamp()
  }

  let docRef = await db.collection('recipes').add(newRecipe)
  newRecipe.id = docRef.id
  newRecipe.upvotes = 0
  newRecipe.type = 'Rated'

  return {
    statusCode: 200,
    body: JSON.stringify(newRecipe)
  }

}