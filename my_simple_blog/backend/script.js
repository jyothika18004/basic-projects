// Ensure the DOM is fully loaded before running the script
  document.addEventListener('DOMContentLoaded', () => {
// Get references to HTML elements
const postsContainer = document.getElementById('posts-container');
const newPostForm = document.getElementById('new-post-form');
const postTitleInput = document.getElementById('post-title');
const postContentTextarea = document.getElementById('post-content');
const formMessage = document.getElementById('form-message');

    // Define the base URL for our backend API
    // This is where our Node.js server will be listening
    const API_BASE_URL = 'http://localhost:5000/api/posts';

    // Helper function to display temporary messages on the form (e.g., success, error)
    function showFormMessage(message, type) {
        formMessage.textContent = message; // Set message text
        formMessage.className = `form-message ${type}`; // Add styling class ('success' or 'error')
        formMessage.classList.remove('hidden'); // Make the message visible
        setTimeout(() => {
            formMessage.classList.add('hidden'); // Hide the message after 3 seconds
        }, 3000);
    }

    // Asynchronous function to fetch and display all blog posts from the backend
    async function fetchPosts() {
        postsContainer.innerHTML = '<p>Loading posts...</p>'; // Show a loading indicator
        try {
            // Make a GET request to the backend API endpoint for posts
            const response = await fetch(API_BASE_URL);
            if (!response.ok) { // Check if the HTTP response status is an error (e.g., 404, 500)
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json(); // Parse the JSON response body

            if (data.data && data.data.length > 0) {
                postsContainer.innerHTML = ''; // Clear the loading message
                // Iterate over the fetched posts and create HTML elements for each
                data.data.forEach(post => {
                    const postCard = document.createElement('div');
                    postCard.classList.add('post-card'); // Add CSS class for styling
                    postCard.innerHTML = `
                        <h3><span class="math-inline">\{post\.title\}</h3\>
<p>{post.content}</p>
<div class="post-meta">Posted on: ${new Date(post.createdAt).toLocaleDateString()} at ${new Date(post.createdAt).toLocaleTimeString()}</div>
`;
postsContainer.appendChild(postCard); // Add the post card to the container
});
} else {
// If no posts are returned, display a message
postsContainer.innerHTML = '<p>No posts found yet. Be the first to create one!</p>';
}
} catch (error) {
// Log and display an error message if fetching fails
console.error('Error fetching posts:', error);
postsContainer.innerHTML = '<p style="color: red;">Failed to load posts. Please ensure the backend server is running.</p>';
}
}

    // Event listener for the new post submission form
    newPostForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission (which would reload the page)

        const title = postTitleInput.value.trim(); // Get trimmed title from input
        const content = postContentTextarea.value.trim(); // Get trimmed content from textarea

        // Client-side validation: ensure fields are not empty
        if (!title || !content) {
            showFormMessage('Please fill in both title and content.', 'error');
            return; // Stop execution if validation fails
        }

        try {
            // Make a POST request to the backend API to create a new post
            const response = await fetch(API_BASE_URL, {
                method: 'POST', // Specify the HTTP method as POST
                headers: {
                    'Content-Type': 'application/json' // Inform the server that the request body is JSON
                },
                body: JSON.stringify({ title, content }) // Convert JavaScript object to JSON string
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json(); // Parse the JSON response from the server
            showFormMessage('Post added successfully!', 'success');
            console.log('Post added:', result);

            // Clear the form fields after successful submission
            postTitleInput.value = '';
            postContentTextarea.value = '';

            // Refresh the list of posts to show the newly added one
            fetchPosts();

        } catch (error) {
            // Log and display an error message if adding a post fails
            console.error('Error adding post:', error);
            showFormMessage('Failed to add post. Please try again.', 'error');
        }
    });

    // Initial call to fetchPosts when the page finishes loading
    // This populates the blog with existing posts from the database.
    fetchPosts();
});