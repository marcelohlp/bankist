"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
    owner: "Jonas Schmedtmann",
    movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
    interestRate: 1.2, // %
    pin: 1111,
};

const account2 = {
    owner: "Jessica Davis",
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,
};

const account3 = {
    owner: "Steven Thomas Williams",
    movements: [200, -200, 340, -300, -20, 50, 400, -460],
    interestRate: 0.7,
    pin: 3333,
};

const account4 = {
    owner: "Sarah Smith",
    movements: [430, 1000, 700, 50, 90],
    interestRate: 1,
    pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

let currentAccount;

createUsernames(accounts);

btnLogin.addEventListener("click", (event) => {
    event.preventDefault(); // => Removes the default behavior of submitting

    currentAccount = accounts.find((account) => account.username === inputLoginUsername.value);

    if (currentAccount?.pin === Number(inputLoginPin.value)) {
        cleanFields(inputLoginUsername, inputLoginPin);
        labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(" ").at(0)}`;
        showUI();
        updateUI(currentAccount);
    } else {
        labelWelcome.textContent = `Invalid user!`;
        hideUI();
    }
});

btnTransfer.addEventListener("click", (event) => {
    event.preventDefault(); // => Removes the default behavior of submitting

    const amount = Number(inputTransferAmount.value);
    const receiverAccount = accounts.find((account) => account.username === inputTransferTo.value);

    cleanFields(inputTransferAmount, inputTransferTo);

    if (amount > 0 && amount <= currentAccount.balance && receiverAccount && receiverAccount?.username !== currentAccount.username) {
        currentAccount.movements.push(-amount);
        receiverAccount.movements.push(amount);
        updateUI(currentAccount);
    }
});

btnClose.addEventListener("click", (event) => {
    event.preventDefault(); // => Removes the default behavior of submitting

    cleanFields(inputCloseUsername, inputClosePin);

    if (inputCloseUsername.value === currentAccount.username && Number(inputClosePin.value) === currentAccount.pin) {
        const accountIndex = accounts.findIndex((account) => account.username === currentAccount.username);
        accounts.splice(accountIndex, 1);
        hideUI();
        currentAccount = null;
    }
});

function createUsernames(accounts) {
    accounts.forEach((account) => {
        account.username = account.owner
            .toLocaleLowerCase()
            .split(" ")
            .map((word) => word[0])
            .join("");
    });
}

const updateUI = function (account) {
    displayMovements(account);
    calcDisplayBalance(account);
    displaySummary(account);
};

const displayMovements = function (account) {
    containerMovements.innerHTML = ""; // => Removes the content

    account.movements.forEach((movement, index) => {
        const type = movement > 0 ? "deposit" : "withdrawal";
        const html = `
        <div class="movements__row">
            <div class="movements__type movements__type--${type}">
                ${index + 1} ${type}    
            </div>
            <div class="movements__value">
                ${movement} €
            </div>
        </div>
        `;
        containerMovements.insertAdjacentHTML("afterbegin", html);
    });
};

const calcDisplayBalance = function (account) {
    account.balance = account.movements.reduce((total, movement) => total + movement, 0);
    labelBalance.textContent = `${account.balance} €`;
};

const displaySummary = function (account) {
    const incomes = account.movements.filter((movement) => movement > 0).reduce((total, movemente) => total + movemente, 0);
    labelSumIn.textContent = `${incomes} €`;
    const out = account.movements.filter((movement) => movement < 0).reduce((total, movemente) => total + movemente, 0);
    labelSumOut.textContent = `${Math.abs(out)} €`;
    const interest = account.movements
        .filter((movement) => movement > 0)
        .map((deposit) => (deposit * account.interestRate) / 100)
        .filter((interest) => interest >= 1)
        .reduce((total, interest) => total + interest, 0);
    labelSumInterest.textContent = `${interest} €`;
};

const cleanFields = function (...fields) {
    fields.forEach((field) => {
        field.value = "";
    });
    fields.at(-1).blur(); // => Removes focus from the field.
};

const showUI = function () {
    containerApp.style.opacity = 100;
};

const hideUI = function () {
    containerApp.style.opacity = 0;
};

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
