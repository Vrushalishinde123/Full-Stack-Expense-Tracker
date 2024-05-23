// Utility functions
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function setUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function getExpenses() {
    return JSON.parse(localStorage.getItem('expenses')) || [];
}

function setExpenses(expenses) {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Authentication
document.getElementById('signup-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;

    const users = getUsers();
    if (users.find(user => user.username === username)) {
        alert('Username already exists.');
        return;
    }

    users.push({ username, password });
    setUsers(users);
    alert('User registered successfully. Please log in.');
});

document.getElementById('login-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const users = getUsers();
    const user = users.find(user => user.username === username && user.password === password);

    if (!user) {
        alert('Invalid username or password.');
        return;
    }

    setCurrentUser(user);
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('tracker-section').style.display = 'block';
    loadExpenses();
});

document.getElementById('expense-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const id = document.getElementById('expense-id').value;
    const category = document.getElementById('expense-category').value;
    const amount = document.getElementById('expense-amount').value;
    const comments = document.getElementById('expense-comments').value;

    const currentUser = getCurrentUser();
    const expenses = getExpenses();

    if (id) {
        // Editing an existing expense
        const expenseIndex = expenses.findIndex(expense => expense.id === id);
        if (expenseIndex !== -1) {
            expenses[expenseIndex] = {
                ...expenses[expenseIndex],
                category,
                amount,
                comments,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        // Adding a new expense
        expenses.push({
            id: Date.now().toString(),
            userId: currentUser.username,
            category,
            amount,
            comments,
            createdAt: new Date().toISOString(),
        });
    }

    setExpenses(expenses);
    clearExpenseForm();
    loadExpenses();
});

function loadExpenses() {
    const currentUser = getCurrentUser();
    const expenses = getExpenses().filter(expense => expense.userId === currentUser.username);

    const tbody = document.querySelector('#expenses-table tbody');
    tbody.innerHTML = '';

    expenses.forEach((expense) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${expense.category}</td>
            <td>${expense.amount}</td>
            <td>${new Date(expense.createdAt).toLocaleString()}</td>
            <td>${expense.comments}</td>
            <td>
                <button onclick="editExpense('${expense.id}')">Edit</button>
                <button onclick="deleteExpense('${expense.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    drawChart(expenses);
}

function editExpense(id) {
    const expenses = getExpenses();
    const expense = expenses.find(expense => expense.id === id);
    if (expense) {
        document.getElementById('expense-id').value = expense.id;
        document.getElementById('expense-category').value = expense.category;
        document.getElementById('expense-amount').value = expense.amount;
        document.getElementById('expense-comments').value = expense.comments;
        document.querySelector('#expense-form button').textContent = 'Update Expense';
    }
}

function deleteExpense(id) {
    const currentUser = getCurrentUser();
    let expenses = getExpenses();
    expenses = expenses.filter(expense => !(expense.id === id && expense.userId === currentUser.username));
    setExpenses(expenses);
    loadExpenses();
}

function clearExpenseForm() {
    document.getElementById('expense-id').value = '';
    document.getElementById('expense-category').value = '';
    document.getElementById('expense-amount').value = '';
    document.getElementById('expense-comments').value = '';
    document.querySelector('#expense-form button').textContent = 'Add Expense';
}

function drawChart(expenses) {
    const categories = {};
    expenses.forEach(expense => {
        categories[expense.category] = (categories[expense.category] || 0) + parseFloat(expense.amount);
    });

    const ctx = document.getElementById('expense-chart').getContext('2d');
    if (window.chartInstance) {
        window.chartInstance.destroy();
    }
    window.chartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
            }],
        },
    });
}
