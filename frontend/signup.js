// signup.js
document.getElementById('signupForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('https://p19us78xy9.execute-api.eu-west-2.amazonaws.com/DevProd/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'signup',
            username: username,
            password: password
        })
    });

    const data = await response.json();
    if (data.success) {
        alert('Sign up successful!');
    } else {
        alert('Error: ' + data.message);
    }
});
