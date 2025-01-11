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
        const namecarry = data.username;

        console.log(`Encoded username for redirection: ${namecarry}`);

        localStorage.setItem('username', data.username);

        // Redirect to a dashboard or home page
        window.location.href = `http://netflix-alb-421990838.eu-west-2.elb.amazonaws.com/streaming/profile.html?username=${username}`; // Example
    } else {
        alert('Error: ' + data.message);
    }
});
