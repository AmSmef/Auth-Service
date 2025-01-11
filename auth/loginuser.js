// login.js
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('https://p19us78xy9.execute-api.eu-west-2.amazonaws.com/DevProd/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'login',
            username: username,
            password: password
        })
    });

    const data = await response.json();
    if (data.success) {
        localStorage.setItem('username', username)
        // Redirect to a dashboard or home page
        window.location.href = '/frontend/streaming/profile.html'; // Example
    } else {
        alert('Error: ' + data.message);
    }
});
