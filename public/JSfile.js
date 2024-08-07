// Function to get the current date and time
function getCurrentDate() {
    const date = new Date();
    const dateOptions = { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric'
    };
    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    
    const dateString = date.toLocaleDateString('en-US', dateOptions);
    const timeString = date.toLocaleTimeString('en-US', timeOptions);
    
    return `${dateString}, ${timeString}`;
}

// Function to validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Function to validate username and password
function validateUsernameAndPassword(username, password) {
    const usernameRe = /^[A-Za-z0-9]+$/;
    const passwordRe = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,}$/;
    
    return usernameRe.test(username) && passwordRe.test(password);
}

// Function to validate form fields
function validateForm(event, fields, additionalValidation = () => true) {
    event.preventDefault(); // Prevent form from submitting

    let formValid = true;
    let errorMessage = '';

    // Loop through inputs to check for validity
    for (let i = 0; i < fields.length; i++) {
        const input = fields[i];
        if (input.type !== 'submit' && input.type !== 'reset' && !input.value) {
            formValid = false;
            errorMessage = 'Please fill in all fields.';
            break;
        }
    }

    // Additional validation (e.g., username and password)
    if (formValid) {
        formValid = additionalValidation();
        if (!formValid) {
            errorMessage = 'Please ensure your username and password are in the correct format.';
        }
    }

    // Display error message if form is not valid
    const errorDiv = document.getElementById('error-message');
    if (!formValid) {
        errorDiv.textContent = errorMessage;
    } else {
        errorDiv.textContent = '';
        // You may remove event.target.submit() to prevent form submission for now.
        // event.target.submit();
    }
}

    const createAccountForm = document.getElementById('createAccountForm');
    createAccountForm.addEventListener('submit', function(event) {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        validateForm(event, createAccountForm.elements, function() {
            return validateUsernameAndPassword(username, password);
        });
    });


// Initialize functions on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    setInterval(() => {
        document.getElementById('getCurrentDateResult').innerHTML = getCurrentDate();
    }, 1000);

    const findPetForm = document.getElementById('findPetForm');
    if (findPetForm) {
        findPetForm.addEventListener('submit', function(event) {
            validateForm(event, findPetForm.elements);
        });
    }

    // Validation for "Have a Pet to Give Away" form
    const giveAwayPetForm = document.getElementById('giveAwayPetForm');
    if (giveAwayPetForm) {
        giveAwayPetForm.addEventListener('submit', function(event) {
            validateForm(event, giveAwayPetForm.elements, function() {
                const email = document.getElementById('email').value;
                return validateEmail(email);
            });
        });
    }

    // // Event listener for "Create Account" link
    // const createAccountLink = document.getElementById('create-account-link');
    // createAccountLink.addEventListener('click', function(event) {
    //     event.preventDefault();
    //     loadLoginCreationForm();
    // });
});
