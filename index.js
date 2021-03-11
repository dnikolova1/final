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
      // console.log(postUsername)
      // console.log(postRecipeName)
      // console.log(postRecipeUrl)
      
      let response = await fetch('/.netlify/functions/create_recipe', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.uid,
          RecipeId: docRef.id, // adding recipeId 
          username: postUsername,
          recipename: postRecipeName,
          recipeUrl: postRecipeUrl,
          imageUrl: postImageUrl,
          ingredients: postIngredients,
          instructions: postInstructions,
          userRating: postUserRating            
        })
      })
      let newPost = await response.json()
      console.log(newPost)
      renderPost(newPost)
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

async function renderPost(post) {
  let postId = post.id
  document.querySelector('.recipes').insertAdjacentHTML('beforeend', `
    <div class="post-${postId} md:mt-16 mt-8 space-y-8">

      <div class="flex">
        <div class="md:mx-0 mx-4 w-2/3">
          <span class="font-bold text-xl">${post.recipename}</span>
          <a href="${post.recipeUrl}" class="text-blue-400">Link</a>
        </div>  
      
        <div class="md:mx-0 mx-4 w-1/3">
          <span class="text-xl">${post.username}</span>
        </div>
      </div>
        
      <div>
        <img src="${post.imageUrl}" class="w-full">
      </div>
      
      <div class="flex">
        <div class="text-3xl md:mx-0 mx-4 w-2/3">
          <button class="upvotes-button text-base bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl">👍 Upvote</button>
          <span class="upvotes text-base">${post.upvote}</span>
        </div>
        <div class="text-3xl md:mx-0 mx-4 w-1/2">
          <span class="text-base">User Rating: </span>
          <span class="rating text-base bg-blue-300 text-white px-4 py-2 rounded-xl">${post.userRating}</span>
        </div>
      </div>

      <div class="md:mx-0 mx-4">
        <span class="font-bold">Ingredients</span><br/>
        <span class="text-base">${post.ingredients}</span>
      </div>

      <div class="md:mx-0 mx-4">
        <span class="font-bold">Instructions</span><br/>
        <span class="text-base">${post.instructions}</span>
      </div>

      <div class="comments text-sm md:mx-0 mx-4 space-y-2">
        ${renderComments(post.comments)}
      </div>
  
      <div class="w-full md:mx-0 mx-4">
        ${renderCommentForm()}
      </div>
    </div>
  `)

  // listen for the like button on this post
  let upvotesButton = document.querySelector(`.post-${postId} .upvotes-button`)
  upvotesButton.addEventListener('click', async function(event) {
    event.preventDefault()
    console.log(`post ${postId} like button clicked!`)
    let currentUserId = firebase.auth().currentUser.uid

    let response = await fetch('/.netlify/functions/upvote', {
      method: 'POST',
      body: JSON.stringify({
        postId: postId,
        userId: currentUserId
      })
    })
    if (response.ok) {
      let existingNumberOfUpvotes = document.querySelector(`.post-${postId} .upvotes`).innerHTML
      let newNumberOfUpvotes = parseInt(existingNumberOfUpvotes) + 1
      document.querySelector(`.post-${postId} .upvotes`).innerHTML = newNumberOfUpvotes
    }
  })

  // listen for the post comment button on this post
  let postCommentButton = document.querySelector(`.post-${postId} .post-comment-button`)
  postCommentButton.addEventListener('click', async function(event) {
    event.preventDefault()
    console.log(`post ${postId} post comment button clicked!`)

    // get the text of the comment
    let postCommentInput = document.querySelector(`.post-${postId} input`)
    let newCommentText = postCommentInput.value
    console.log(`comment: ${newCommentText}`)

    // create a new Object to hold the comment's data
    let newComment = {
      postId: postId,
      username: firebase.auth().currentUser.displayName,
      text: newCommentText
    }

    // call our back-end lambda using the new comment's data
    await fetch('/.netlify/functions/create_comment', {
      method: 'POST',
      body: JSON.stringify(newComment)
    })

    // insert the new comment into the DOM, in the div with the class name "comments", for this post
    let commentsElement = document.querySelector(`.post-${postId} .comments`)
    commentsElement.insertAdjacentHTML('beforeend', renderComment(newComment))

    // clears the comment input
    postCommentInput.value = ''
  })
}

// given an Array of comment Objects, loop and return the HTML for the comments
function renderComments(comments) {
  if (comments) {
    let markup = ''
    for (let i = 0; i < comments.length; i++) {
      markup += renderComment(comments[i])
    }
    return markup
  } else {
    return ''
  }
}

// return the HTML for one comment, given a single comment Object
function renderComment(comment) {
  return `<div><strong>${comment.username}</strong> ${comment.text}</div>`
}

// return the HTML for the new comment form
function renderCommentForm() {
  let commentForm = ''
  commentForm = `
    <input type="text" class="mr-2 rounded-lg border px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500" placeholder="Add a comment...">
    <button class="post-comment-button py-2 px-4 rounded-md shadow-sm font-medium text-white bg-purple-600 focus:outline-none">Post</button>
  `
  return commentForm
}
