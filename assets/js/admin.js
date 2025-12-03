document.addEventListener('DOMContentLoaded', function() {
        // attach logout button if present
        const logoutBtn = document.getElementById('logoutBtn')
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                Auth.clearAuth()
                // redirect to login page in the same public folder
                window.location.href = 'login.html'
            })
        }
    }
);