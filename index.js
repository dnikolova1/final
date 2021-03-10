firebase.auth().onAuthStateChanged(async function(user) {
  if (user) {
    // Signed in
    console.log('signed in')
    
    // Sign-out button
    document.querySelector('.sign-in-or-sign-out').innerHTML = `
    <button class="text-pink-500 underline sign-out">Sign Out</button>
    `
    document.querySelector('.sign-out').addEventListener('click', function(event) {
    console.log('sign out clicked')
    firebase.auth().signOut()
    document.location.href = 'index.html'
    })
 
    // Render existing recipes
    let response = await fetch('/.netlify/functions/get_recipes')
    let recipes = await response.json()
    for (let i=0; i<recipes.length; i++) {
      let recipe = recipes[i]
      renderPost(recipe)
    }

    // Listen for the form submit and create the new post in the database
    document.querySelector('form').addEventListener('submit', async function(event) {
      event.preventDefault()
      let postUsername = user.displayName
      let postRecipeName = document.querySelector('#recipe-name').value
      let postRecipeUrl = document.querySelector('#recipe-url').value
      let postImageUrl = document.querySelector('#image-url').value
      let postIngredients = document.querySelector('#ingredients').value
      let postInstructions = document.querySelector('#instructions').value
      let postUserRating = document.querySelector('#user-rating').value
      let response = await fetch('/.netlify/functions/create_recipe', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.uid,
          username: postUsername,
          recipename: postRecipeName,
          recipeUrl: postRecipeUrl,
          imageUrl: postImageUrl,
          ingredients: postIngredients,
          instructions: postInstructions,
          userRating: postUserRating            
        })
      })
      let post = await response.json()
      console.log(post)
    })

  } else {
    // Signed out
    console.log('signed out')

    // Hide the form when signed-out
    document.querySelector('form').classList.add('hidden')

    // Initializes FirebaseUI Auth
    let ui = new firebaseui.auth.AuthUI(firebase.auth())

    // FirebaseUI configuration
    let authUIConfig = {
      signInOptions: [
        firebase.auth.EmailAuthProvider.PROVIDER_ID
      ],
      signInSuccessUrl: 'index.html'
    }

    // Starts FirebaseUI Auth
    ui.start('.sign-in-or-sign-out', authUIConfig)
  }
})
