"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
    owner: "Jonas Schmedtmann",
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2, // %
    pin: 1111,

    movementsDates: [
        "2019-11-18T21:31:17.178Z",
        "2019-12-23T07:42:02.383Z",
        "2020-01-28T09:15:04.904Z",
        "2020-04-01T10:17:24.185Z",
        "2020-05-23T14:11:59.604Z",
        "2025-06-21T17:01:17.194Z",
        "2025-06-22T23:36:17.929Z",
        "2025-06-23T10:51:36.790Z",
    ],
    currency: "EUR",
    locale: "pt-PT", // de-DE
};

const account2 = {
    owner: "Jessica Davis",
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,

    movementsDates: [
        "2019-11-01T13:15:33.035Z",
        "2019-11-30T09:48:16.867Z",
        "2019-12-25T06:04:23.907Z",
        "2020-01-25T14:18:46.235Z",
        "2020-02-05T16:33:06.386Z",
        "2020-04-10T14:43:26.374Z",
        "2020-06-25T18:49:59.371Z",
        "2020-07-26T12:01:20.894Z",
    ],
    currency: "USD",
    locale: "en-US",
};

const accounts = [account1, account2];

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

createUsernames(accounts);

let currentAccount, timer;
let sorted = false;

btnLogin.addEventListener("click", (event) => {
    event.preventDefault(); // => Removes the default behavior of submitting

    currentAccount = accounts.find((account) => account.username === inputLoginUsername.value);

    if (currentAccount?.pin === +inputLoginPin.value) {
        const currentDate = new Date();
        const options = {
            day: "numeric",
            month: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
        };
        labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(currentDate);

        cleanFields(inputLoginUsername, inputLoginPin);
        setLabelWelcome(`Welcome back, ${currentAccount.owner.split(" ").at(0)}`);
        refreshTimer();
        showUI();
        updateUI(currentAccount);
    } else {
        setLabelWelcome(`Invalid user!`);
        hideUI();
    }
});

btnTransfer.addEventListener("click", (event) => {
    event.preventDefault(); // => Removes the default behavior of submitting

    const amount = +inputTransferAmount.value;
    const receiverAccount = accounts.find((account) => account.username === inputTransferTo.value);

    cleanFields(inputTransferAmount, inputTransferTo);

    if (amount > 0 && amount <= currentAccount.balance && receiverAccount && receiverAccount?.username !== currentAccount.username) {
        currentAccount.movements.push(-amount);
        receiverAccount.movements.push(amount);
        currentAccount.movementsDates.push(new Date().toISOString());
        receiverAccount.movementsDates.push(new Date().toISOString());
        updateUI(currentAccount);
        refreshTimer();
    }
});

btnLoan.addEventListener("click", (event) => {
    event.preventDefault(); // => Removes the default behavior of submitting

    const amount = Math.floor(inputLoanAmount.value);

    if (amount && amount > 0 && currentAccount.movements.some((movement) => movement >= (amount * 10) / 100)) {
        setTimeout(() => {
            currentAccount.movements.push(amount);
            currentAccount.movementsDates.push(new Date().toISOString());
            cleanFields(inputLoanAmount);
            updateUI(currentAccount);
        }, 2500);
        refreshTimer();
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

btnSort.addEventListener("click", (event) => {
    event.preventDefault(); // => Removes the default behavior of submitting
    displayMovements(currentAccount, !sorted);
    sorted = !sorted;
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

const displayMovements = function (account, sort = false) {
    containerMovements.innerHTML = ""; // => Removes the content

    const movementsAndDates = account.movements.map((movement, index) => {
        return {
            movement: movement,
            date: account.movementsDates.at(index),
        };
    });

    if (sort) movementsAndDates.sort((current, next) => current.movement - next.movement);

    movementsAndDates.forEach((movementAndDate, index) => {
        const type = movementAndDate.movement > 0 ? "deposit" : "withdrawal";

        const date = new Date(movementAndDate.date);
        const displayDate = formatMovementDate(date, currentAccount.locale);

        const html = `
        <div class="movements__row">
            <div class="movements__type movements__type--${type}">
                ${index + 1} ${type}    
            </div>
            <div class="movements__date">${displayDate}</div>
            <div class="movements__value">
                ${formatMovementValue(movementAndDate.movement.toFixed(2), currentAccount.locale, currentAccount.currency)}
            </div>
        </div>
        `;
        containerMovements.insertAdjacentHTML("afterbegin", html);
    });
};

const calcDisplayBalance = function (account) {
    account.balance = account.movements.reduce((total, movement) => total + movement, 0);
    labelBalance.textContent = `${formatMovementValue(account.balance.toFixed(2), currentAccount.locale, currentAccount.currency)}`;
};

const displaySummary = function (account) {
    const incomes = account.movements.filter((movement) => movement > 0).reduce((total, movemente) => total + movemente, 0);
    labelSumIn.textContent = `${formatMovementValue(incomes.toFixed(2), currentAccount.locale, currentAccount.currency)}`;
    const out = account.movements.filter((movement) => movement < 0).reduce((total, movemente) => total + movemente, 0);
    labelSumOut.textContent = `${formatMovementValue(Math.abs(out).toFixed(2), currentAccount.locale, currentAccount.currency)}`;
    const interest = account.movements
        .filter((movement) => movement > 0)
        .map((deposit) => (deposit * account.interestRate) / 100)
        .filter((interest) => interest >= 1)
        .reduce((total, interest) => total + interest, 0);
    labelSumInterest.textContent = `${formatMovementValue(interest.toFixed(2), currentAccount.locale, currentAccount.currency)}`;
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

function formatMovementDate(date, locale) {
    const calcDaysPassed = (dateOne, dateTwo) => Math.round(Math.abs((dateTwo - dateOne) / (1000 * 60 * 60 * 24)));
    const daysPassed = calcDaysPassed(new Date(), date);

    if (daysPassed === 0) return `Today`;
    if (daysPassed === 1) return `Yesterday`;
    if (daysPassed <= 7) return `${daysPassed} days ago`;
    else {
        return new Intl.DateTimeFormat(locale).format(date);
    }
}

function formatMovementValue(value, locale, currency) {
    const options = {
        style: "currency",
        currency: currency,
    };
    return new Intl.NumberFormat(locale, options).format(value);
}

function startLogOutTimer() {
    let time = 300;
    const tick = () => {
        let min = String(Math.trunc(time / 60)).padStart(2, 0);
        let sec = String(time % 60).padStart(2, 0);
        labelTimer.textContent = `${min}:${sec}`;
        if (time === 0) {
            clearInterval(timer);
            logout();
        }
        time--;
    };
    tick();
    const timer = setInterval(tick, 1000);
    return timer;
}

function logout() {
    hideUI();
    setLabelWelcome("Log in to get started");
    currentAccount = null;
}

function setLabelWelcome(text) {
    labelWelcome.textContent = text;
}

function refreshTimer() {
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
}
