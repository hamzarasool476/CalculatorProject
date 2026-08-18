"use strict";

/*
=========================================================
ADVANCED CALCULATOR
=========================================================

Features:
- Basic arithmetic
- Operator precedence
- Parentheses
- Decimal numbers
- Percentage
- Scientific functions
- Trigonometry
- Inverse trigonometry
- DEG / RAD
- Square / cube
- Square root
- Factorial
- Pi / Euler's number
- Reciprocal
- Powers
- Memory: MC / MR / M+ / M-
- Calculation history
- LocalStorage persistence
- Light / Dark mode
- Keyboard support
- Error handling
- Automatic parenthesis handling
=========================================================
*/


/* =========================================================
   DOM ELEMENTS
========================================================= */

const expressionElement = document.getElementById("expression");
const resultElement = document.getElementById("result");

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

const modeIndicator = document.getElementById("modeIndicator");

const historyList = document.getElementById("historyList");
const historyCount = document.getElementById("historyCount");

const clearHistoryButton =
    document.getElementById("clearHistory");

const memoryIndicator =
    document.getElementById("memoryIndicator");

const keys = document.querySelectorAll(".key");
const modeButtons = document.querySelectorAll(".mode-button");


/* =========================================================
   CALCULATOR STATE
========================================================= */

const state = {
    expression: "",
    result: "0",
    angleMode: "DEG",

    memory: 0,

    history: [],

    justCalculated: false,

    error: false
};


/* =========================================================
   STORAGE KEYS
========================================================= */

const STORAGE = {
    theme: "advancedCalculatorTheme",
    history: "advancedCalculatorHistory",
    memory: "advancedCalculatorMemory",
    angleMode: "advancedCalculatorAngleMode"
};


/* =========================================================
   INITIALIZATION
========================================================= */

function initialize() {
    loadTheme();
    loadHistory();
    loadMemory();
    loadAngleMode();

    updateDisplay();
    renderHistory();
    updateMemoryIndicator();

    setupEventListeners();
}


/* =========================================================
   EVENT LISTENERS
========================================================= */

function setupEventListeners() {

    /* Calculator buttons */
    keys.forEach((key) => {
        key.addEventListener("click", () => {

            const value = key.dataset.value;
            const action = key.dataset.action;
            const func = key.dataset.function;

            if (value !== undefined) {
                handleValue(value);
                return;
            }

            if (action) {
                handleAction(action);
                return;
            }

            if (func) {
                handleFunction(func);
            }
        });
    });


    /* Theme */
    themeToggle.addEventListener("click", toggleTheme);


    /* Angle mode */
    modeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            setAngleMode(button.dataset.angle);
        });
    });


    /* Clear history */
    clearHistoryButton.addEventListener(
        "click",
        clearHistory
    );


    /* Memory indicator */
    memoryIndicator.addEventListener(
        "click",
        () => {
            state.memory = 0;

            saveMemory();
            updateMemoryIndicator();
        }
    );


    /* Keyboard */
    document.addEventListener(
        "keydown",
        handleKeyboard
    );
}


/* =========================================================
   VALUE INPUT
========================================================= */

function handleValue(value) {

    if (state.error) {
        resetCalculator();
    }

    /*
    After pressing "=" and entering a new number,
    start a new calculation.
    */
    if (
        state.justCalculated &&
        /^[0-9.]$/.test(value)
    ) {
        state.expression = "";
        state.justCalculated = false;
    }

    /*
    Prevent malformed decimal numbers.
    */
    if (value === ".") {

        const currentNumber =
            getCurrentNumber();

        if (currentNumber.includes(".")) {
            return;
        }

        if (
            currentNumber === "" ||
            currentNumber === "-"
        ) {
            state.expression += "0";
        }
    }


    /*
    Handle double zero.
    */
    if (value === "00") {

        const currentNumber =
            getCurrentNumber();

        if (
            currentNumber === "" ||
            currentNumber === "0"
        ) {
            return;
        }
    }


    state.expression += value;

    state.justCalculated = false;

    updateDisplay();
}


/* =========================================================
   ACTION HANDLER
========================================================= */

function handleAction(action) {

    switch (action) {

        case "clear":
            clearAll();
            break;

        case "clear-entry":
            clearEntry();
            break;

        case "backspace":
            backspace();
            break;

        case "percentage":
            percentage();
            break;

        case "calculate":
            calculate();
            break;

        case "memory-clear":
            memoryClear();
            break;

        case "memory-recall":
            memoryRecall();
            break;

        case "memory-add":
            memoryAdd();
            break;

        case "memory-subtract":
            memorySubtract();
            break;
    }
}


/* =========================================================
   SCIENTIFIC FUNCTION HANDLER
========================================================= */

function handleFunction(func) {

    if (state.error) {
        clearAll();
    }

    /*
    Constants
    */

    if (func === "pi") {
        appendConstant(Math.PI, "π");
        return;
    }

    if (func === "e") {
        appendConstant(Math.E, "e");
        return;
    }


    /*
    Power operator
    */

    if (func === "power") {
        appendOperator("^");
        return;
    }


    /*
    Unary functions
    */

    const value = getCurrentValue();

    if (value === null) {
        showError("Enter a number");
        return;
    }

    let calculated;

    try {

        switch (func) {

            case "sin":
                calculated = Math.sin(
                    toRadians(value)
                );
                break;

            case "cos":
                calculated = Math.cos(
                    toRadians(value)
                );
                break;

            case "tan":
                calculated = Math.tan(
                    toRadians(value)
                );
                break;

            case "asin":

                if (value < -1 || value > 1) {
                    throw new Error(
                        "asin domain error"
                    );
                }

                calculated = fromRadians(
                    Math.asin(value)
                );

                break;

            case "acos":

                if (value < -1 || value > 1) {
                    throw new Error(
                        "acos domain error"
                    );
                }

                calculated = fromRadians(
                    Math.acos(value)
                );

                break;

            case "atan":
                calculated = fromRadians(
                    Math.atan(value)
                );
                break;

            case "log":

                if (value <= 0) {
                    throw new Error(
                        "log domain error"
                    );
                }

                calculated = Math.log10(value);

                break;

            case "ln":

                if (value <= 0) {
                    throw new Error(
                        "ln domain error"
                    );
                }

                calculated = Math.log(value);

                break;

            case "sqrt":

                if (value < 0) {
                    throw new Error(
                        "sqrt domain error"
                    );
                }

                calculated = Math.sqrt(value);

                break;

            case "square":
                calculated = value ** 2;
                break;

            case "cube":
                calculated = value ** 3;
                break;

            case "factorial":

                if (
                    value < 0 ||
                    !Number.isInteger(value)
                ) {
                    throw new Error(
                        "factorial requires a non-negative integer"
                    );
                }

                if (value > 170) {
                    throw new Error(
                        "number too large"
                    );
                }

                calculated = factorial(value);

                break;

            case "inverse":

                if (value === 0) {
                    throw new Error(
                        "cannot divide by zero"
                    );
                }

                calculated = 1 / value;

                break;

            default:
                return;
        }

        if (!Number.isFinite(calculated)) {
            throw new Error("Invalid result");
        }

        replaceCurrentValue(
            formatNumber(calculated)
        );

        state.result =
            formatNumber(calculated);

        updateDisplay();

    } catch (error) {
        showError(
            error.message || "Invalid operation"
        );
    }
}


/* =========================================================
   CONSTANTS
========================================================= */

function appendConstant(number, displayValue) {

    if (state.justCalculated) {
        state.expression = "";
        state.justCalculated = false;
    }

    /*
    Add multiplication automatically when required.

    Example:
    2π -> 2 × π
    (π -> allowed
    */

    if (
        state.expression &&
        /[\dπe)]$/.test(
            state.expression
        )
    ) {
        state.expression += "×";
    }

    state.expression += displayValue;

    updateDisplay();
}


/* =========================================================
   OPERATORS
========================================================= */

function appendOperator(operator) {

    if (state.error) {
        clearAll();
    }

    if (!state.expression) {

        if (operator === "−") {
            state.expression = "−";
            updateDisplay();
        }

        return;
    }

    state.justCalculated = false;

    const lastCharacter =
        state.expression.slice(-1);

    /*
    Replace an existing operator instead of
    creating things like 5++.
    */

    if (
        ["+", "−", "×", "÷", "^"].includes(
            lastCharacter
        )
    ) {
        state.expression =
            state.expression.slice(0, -1) +
            operator;
    } else {
        state.expression += operator;
    }

    updateDisplay();
}


/* =========================================================
   CURRENT NUMBER
========================================================= */

function getCurrentNumber() {

    const match =
        state.expression.match(
            /(-?\d*\.?\d+|π|e)$/
        );

    return match ? match[0] : "";
}


/* =========================================================
   CURRENT VALUE
========================================================= */

function getCurrentValue() {

    const current =
        getCurrentNumber();

    if (!current) {
        return null;
    }

    if (current === "π") {
        return Math.PI;
    }

    if (current === "e") {
        return Math.E;
    }

    const value = Number(current);

    return Number.isFinite(value)
        ? value
        : null;
}


/* =========================================================
   REPLACE CURRENT VALUE
========================================================= */

function replaceCurrentValue(value) {

    const match =
        state.expression.match(
            /(-?\d*\.?\d+|π|e)$/
        );

    if (match) {

        state.expression =
            state.expression.slice(
                0,
                -match[0].length
            ) + value;

    } else {

        state.expression = value;
    }

    state.justCalculated = false;
}


/* =========================================================
   CLEAR FUNCTIONS
========================================================= */

function clearAll() {

    state.expression = "";
    state.result = "0";
    state.error = false;
    state.justCalculated = false;

    updateDisplay();
}


function resetCalculator() {
    clearAll();
}


function clearEntry() {

    if (state.error) {
        clearAll();
        return;
    }

    /*
    Remove the current number.
    */

    const match =
        state.expression.match(
            /(-?\d*\.?\d+|π|e)$/
        );

    if (match) {

        state.expression =
            state.expression.slice(
                0,
                -match[0].length
            );

    } else {

        state.expression = "";
    }

    updateDisplay();
}


function backspace() {

    if (state.error) {
        clearAll();
        return;
    }

    state.expression =
        state.expression.slice(0, -1);

    state.justCalculated = false;

    updateDisplay();
}


/* =========================================================
   PERCENTAGE
========================================================= */

function percentage() {

    if (state.error) {
        clearAll();
    }

    const value = getCurrentValue();

    if (value === null) {
        return;
    }

    const percentageValue =
        value / 100;

    replaceCurrentValue(
        formatNumber(percentageValue)
    );

    updateDisplay();
}


/* =========================================================
   FACTORIAL
========================================================= */

function factorial(number) {

    if (
        number === 0 ||
        number === 1
    ) {
        return 1;
    }

    let result = 1;

    for (let i = 2; i <= number; i++) {
        result *= i;
    }

    return result;
}


/* =========================================================
   CALCULATE
========================================================= */

function calculate() {

    if (
        state.error ||
        !state.expression
    ) {
        return;
    }

    try {

        const originalExpression =
            state.expression;

        const normalized =
            normalizeExpression(
                state.expression
            );

        const value =
            evaluateExpression(
                normalized
            );

        if (!Number.isFinite(value)) {
            throw new Error(
                "Result is not finite"
            );
        }

        const formatted =
            formatNumber(value);

        state.expression =
            originalExpression;

        state.result = formatted;

        state.justCalculated = true;

        addHistory(
            originalExpression,
            formatted
        );

        /*
        Put the result into the expression
        after displaying the calculation.
        */

        state.expression = formatted;

        updateDisplay();

    } catch (error) {

        showError(
            error.message ||
            "Invalid expression"
        );
    }
}


/* =========================================================
   EXPRESSION NORMALIZATION
========================================================= */

function normalizeExpression(expression) {

    let exp = expression;

    /*
    Convert visual operators into JavaScript/math operators.
    */

    exp = exp
        .replaceAll("×", "*")
        .replaceAll("÷", "/")
        .replaceAll("−", "-")
        .replaceAll("π", "PI");

    /*
    Handle Euler's number.

    We intentionally replace standalone e,
    not characters inside scientific notation.
    */

    exp = exp.replace(
        /(^|[^a-zA-Z])e(?![a-zA-Z])/g,
        "$1E"
    );

    /*
    Convert percentage syntax.

    Example:
    50% -> (50/100)
    */

    exp = exp.replace(
        /(\d+(?:\.\d+)?)%/g,
        "($1/100)"
    );

    /*
    Automatically close missing parentheses.
    */

    const opens =
        (exp.match(/\(/g) || []).length;

    const closes =
        (exp.match(/\)/g) || []).length;

    if (opens > closes) {
        exp += ")".repeat(
            opens - closes
        );
    }

    /*
    Automatically multiply values before parentheses.

    2(3) -> 2*(3)
    */

    exp = exp.replace(
        /(\d|\)|PI|E)\s*\(/g,
        "$1*("
    );

    /*
    Multiply after parentheses before constants.

    )( -> )*(
    */

    exp = exp.replace(
        /\)\s*(PI|E)/g,
        ")*$1"
    );

    /*
    Power operator.

    JavaScript does not support ^ as exponent.
    */

    exp = exp.replaceAll("^", "**");

    /*
    Prevent dangerous / invalid characters.

    Only mathematical syntax is allowed.
    */

    if (
        !/^[0-9+\-*/().\s*PIE]+$/.test(
            exp
        )
    ) {
        throw new Error(
            "Invalid characters"
        );
    }

    return exp;
}


/* =========================================================
   SAFE EXPRESSION EVALUATOR
========================================================= */

function evaluateExpression(expression) {

    /*
    This calculator builds the expression itself and
    normalizes it through a strict character whitelist
    before evaluation.

    The Function constructor is therefore used only on
    calculator-generated mathematical syntax.
    */

    if (!expression.trim()) {
        return 0;
    }

    /*
    Reject suspicious sequences.
    */

    if (
        expression.includes("++") ||
        expression.includes("--") ||
        expression.includes("//") ||
        expression.includes("/*")
    ) {
        throw new Error(
            "Invalid expression"
        );
    }

    /*
    Explicit division-by-zero detection.
    */

    const zeroDivision =
        /\/\s*0(?:[^\d.]|$)/.test(
            expression
        );

    if (zeroDivision) {
        throw new Error(
            "Cannot divide by zero"
        );
    }

    let result;

    try {

        result = Function(
            `"use strict"; return (${expression});`
        )();

    } catch {
        throw new Error(
            "Invalid expression"
        );
    }

    if (
        typeof result !== "number" ||
        !Number.isFinite(result)
    ) {
        throw new Error(
            "Invalid result"
        );
    }

    return result;
}


/* =========================================================
   NUMBER FORMATTING
========================================================= */

function formatNumber(number) {

    if (!Number.isFinite(number)) {
        return "Error";
    }

    /*
    Avoid floating point artifacts.

    Example:
    0.1 + 0.2
    becomes 0.3 rather than
    0.30000000000000004
    */

    const rounded =
        Number.parseFloat(
            number.toPrecision(12)
        );

    /*
    Use exponential notation for extremely
    large/small numbers.
    */

    if (
        Math.abs(rounded) >= 1e12 ||
        (
            Math.abs(rounded) > 0 &&
            Math.abs(rounded) < 1e-9
        )
    ) {
        return rounded.toExponential(8);
    }

    return String(rounded);
}


/* =========================================================
   ANGLE MODE
========================================================= */

function toRadians(value) {

    if (state.angleMode === "RAD") {
        return value;
    }

    return value * Math.PI / 180;
}


function fromRadians(value) {

    if (state.angleMode === "RAD") {
        return value;
    }

    return value * 180 / Math.PI;
}


function setAngleMode(mode) {

    if (
        mode !== "DEG" &&
        mode !== "RAD"
    ) {
        return;
    }

    state.angleMode = mode;

    modeButtons.forEach((button) => {

        button.classList.toggle(
            "active",
            button.dataset.angle === mode
        );
    });

    modeIndicator.textContent = mode;

    localStorage.setItem(
        STORAGE.angleMode,
        mode
    );
}


/* =========================================================
   MEMORY
========================================================= */

function memoryClear() {

    state.memory = 0;

    saveMemory();
    updateMemoryIndicator();
}


function memoryRecall() {

    if (state.error) {
        clearAll();
    }

    const value =
        formatNumber(state.memory);

    state.expression = value;
    state.result = value;

    state.justCalculated = false;

    updateDisplay();
}


function memoryAdd() {

    try {

        const value =
            state.justCalculated
                ? Number(state.result)
                : evaluateExpression(
                    normalizeExpression(
                        state.expression
                    )
                );

        state.memory += value;

        saveMemory();
        updateMemoryIndicator();

    } catch {
        showError("Invalid value");
    }
}


function memorySubtract() {

    try {

        const value =
            state.justCalculated
                ? Number(state.result)
                : evaluateExpression(
                    normalizeExpression(
                        state.expression
                    )
                );

        state.memory -= value;

        saveMemory();
        updateMemoryIndicator();

    } catch {
        showError("Invalid value");
    }
}


function saveMemory() {

    localStorage.setItem(
        STORAGE.memory,
        String(state.memory)
    );
}


function loadMemory() {

    const saved =
        localStorage.getItem(
            STORAGE.memory
        );

    if (saved !== null) {

        const value = Number(saved);

        if (Number.isFinite(value)) {
            state.memory = value;
        }
    }
}


function updateMemoryIndicator() {

    memoryIndicator.classList.toggle(
        "active",
        state.memory !== 0
    );

    memoryIndicator.textContent =
        state.memory !== 0
            ? "M"
            : "M";
}


/* =========================================================
   HISTORY
========================================================= */

function addHistory(
    expression,
    result
) {

    state.history.unshift({
        expression,
        result,
        time: new Date().toISOString()
    });

    /*
    Keep the history reasonably sized.
    */

    state.history =
        state.history.slice(0, 50);

    saveHistory();
    renderHistory();
}


function saveHistory() {

    localStorage.setItem(
        STORAGE.history,
        JSON.stringify(state.history)
    );
}


function loadHistory() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE.history
            );

        if (!saved) {
            return;
        }

        const parsed =
            JSON.parse(saved);

        if (Array.isArray(parsed)) {
            state.history = parsed;
        }

    } catch {

        state.history = [];
    }
}


function renderHistory() {

    historyCount.textContent =
        state.history.length;

    if (state.history.length === 0) {

        historyList.innerHTML = `
            <div class="empty-history">
                <span>⌁</span>
                <p>No calculations yet</p>
                <small>Your calculations will appear here.</small>
            </div>
        `;

        return;
    }

    historyList.innerHTML = "";

    state.history.forEach(
        (item, index) => {

            const element =
                document.createElement("article");

            element.className =
                "history-item";

            const date =
                new Date(item.time);

            element.innerHTML = `
                <div class="history-expression">
                    ${escapeHTML(item.expression)}
                </div>

                <div class="history-result">
                    = ${escapeHTML(item.result)}
                </div>

                <small class="history-time">
                    ${formatHistoryTime(date)}
                </small>
            `;

            element.addEventListener(
                "click",
                () => {

                    state.expression =
                        item.result;

                    state.result =
                        item.result;

                    state.error = false;
                    state.justCalculated = true;

                    updateDisplay();
                }
            );

            historyList.appendChild(
                element
            );
        }
    );
}


function clearHistory() {

    if (state.history.length === 0) {
        return;
    }

    const confirmed =
        window.confirm(
            "Clear all calculation history?"
        );

    if (!confirmed) {
        return;
    }

    state.history = [];

    saveHistory();
    renderHistory();
}


function formatHistoryTime(date) {

    if (
        Number.isNaN(date.getTime())
    ) {
        return "";
    }

    return date.toLocaleString(
        undefined,
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    );
}


/* =========================================================
   HTML ESCAPING
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   DISPLAY
========================================================= */

function updateDisplay() {

    expressionElement.textContent =
        state.expression || "";

    resultElement.textContent =
        state.result || "0";

    resultElement.classList.toggle(
        "error",
        state.error
    );

    modeIndicator.textContent =
        state.angleMode;
}


/* =========================================================
   ERROR HANDLING
========================================================= */

function showError(message) {

    state.error = true;

    expressionElement.textContent =
        state.expression || "Calculation";

    resultElement.textContent =
        message;

    resultElement.classList.add(
        "error"
    );
}


/* =========================================================
   THEME
========================================================= */

function toggleTheme() {

    const isDark =
        document.body.classList.toggle(
            "dark"
        );

    const theme =
        isDark ? "dark" : "light";

    localStorage.setItem(
        STORAGE.theme,
        theme
    );

    updateThemeIcon(isDark);
}


function updateThemeIcon(isDark) {

    themeIcon.textContent =
        isDark ? "☀" : "☾";

    themeToggle.setAttribute(
        "aria-label",
        isDark
            ? "Switch to light mode"
            : "Switch to dark mode"
    );
}


function loadTheme() {

    const saved =
        localStorage.getItem(
            STORAGE.theme
        );

    /*
    Respect user's system preference
    when there is no saved preference.
    */

    const shouldUseDark =
        saved
            ? saved === "dark"
            : window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;

    document.body.classList.toggle(
        "dark",
        shouldUseDark
    );

    updateThemeIcon(
        shouldUseDark
    );
}


/* =========================================================
   KEYBOARD SUPPORT
========================================================= */

function handleKeyboard(event) {

    const key = event.key;

    /*
    Prevent browser shortcuts from interfering
    with calculator input where appropriate.
    */

    if (
        key === "Enter" ||
        key === "="
    ) {

        event.preventDefault();

        calculate();
        return;
    }


    if (key === "Escape") {

        event.preventDefault();

        clearAll();
        return;
    }


    if (key === "Backspace") {

        event.preventDefault();

        backspace();
        return;
    }


    if (key === "Delete") {

        event.preventDefault();

        clearEntry();
        return;
    }


    /*
    Numbers and decimal.
    */

    if (
        /^[0-9.]$/.test(key)
    ) {

        event.preventDefault();

        handleValue(key);
        return;
    }


    /*
    Parentheses.
    */

    if (
        key === "(" ||
        key === ")"
    ) {

        event.preventDefault();

        handleValue(key);
        return;
    }


    /*
    Operators.
    */

    const operatorMap = {
        "+": "+",
        "-": "−",
        "*": "×",
        "/": "÷",
        "^": "^"
    };

    if (
        operatorMap[key]
    ) {

        event.preventDefault();

        appendOperator(
            operatorMap[key]
        );

        return;
    }


    /*
    Percentage.
    */

    if (key === "%") {

        event.preventDefault();

        percentage();
    }
}


/* =========================================================
   CURRENT NUMBER HELPER
========================================================= */

function getCurrentNumberEndIndex() {

    const match =
        state.expression.match(
            /(-?\d*\.?\d+|π|e)$/
        );

    if (!match) {
        return state.expression.length;
    }

    return (
        state.expression.length -
        match[0].length
    );
}


/* =========================================================
   UTILITY: RESET ERROR
========================================================= */

function ensureReady() {

    if (state.error) {
        clearAll();
    }
}


/* =========================================================
   START APPLICATION
========================================================= */

initialize();