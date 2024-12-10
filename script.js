let history = JSON.parse(localStorage.getItem('history')) || [];
const expressionElement = document.getElementById('expression');
const resultElement = document.getElementById('result');
const errors = ['Error', 'Infinity', 'NaN', 'undefined', 'Display overflow'];	
const operations = ['+', '-', '/', '*'];	
const simbols = [ '%', '.', '(', ')'];
let resultFlag = false; // Nosaka, vai pēdējais ievads ir rezultāts (lai notīrītu pēc Backspace)

// Aizvāc fokusu no pogām pēc klikšķa
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function () {
        this.blur();
    });
});

// Apstrādā klaviatūras ievadi
document.addEventListener("keydown", function (event) {
    const key = event.key;
    if (!isNaN(Number(key)) || simbols.includes(key)) {
        appendToDisplay(key); // Skaitļi
    } else if (operations.includes(key)) {
        appendOperation(key); // Operācijas
    } else if (key === "Enter") {
        calculate(); // Enter aprēķina rezultātu
    } else if (key === "Backspace") {
        clearLast();
    }
});

// Pievieno vērtību displejam
function appendToDisplay(value) {
    if (errors.includes(resultElement.textContent)) {
        clearDisplay();
    }
    // Ja ir rezultāts, tad notīra displeju
    if (resultFlag) {
        clearDisplay();
        resultFlag = false;
    }
    if (value === "(") {
        // Ja pēdējais simbols ir skaitlis, tad pirms ielikšanas jāpievieno reizinātājs
        const lastChar = expressionElement.textContent.slice(-1);
        if (!isNaN(lastChar) && lastChar !== ' ') {
            expressionElement.textContent += '*';
        }
    }
    if (value === ")") {
        // Ja ir atvērtās iekavas, bet nav aizvērtās, tad pievieno 0
        if (!(expressionElement.textContent.split('(').length > expressionElement.textContent.split(')').length)) {
            return;
        } if (expressionElement.textContent.endsWith('(')) {
            expressionElement.textContent += '0';
        }
    }
    // Ja ir rezultāts, tad notīra displeju
    if (expressionElement.textContent === '0') {
        expressionElement.textContent = '';
    }
    // Ja ir pārāk daudz simbolu, tad nerāda vairāk
    if (expressionElement.textContent.length >= 30) {
        console.log(expressionElement.textContent.length);
        resultElement.textContent = 'Display overflow';
        return;
    }
    expressionElement.textContent += value;
}

// Pievieno operāciju
function appendOperation(op) {
    if (errors.includes(resultElement.textContent)) {
        clearDisplay();
    }
    if (expressionElement.textContent.length >= 27) {
        console.log(expressionElement.textContent.length);
        resultElement.textContent = 'Display overflow';
        return;
    }
    if (resultFlag) {
        resultFlag = false;
    }
    if (expressionElement.textContent === '0') {
        expressionElement.textContent = '';
    }
    const currentText = expressionElement.textContent.trim();
    // Pārbauda, vai pēdējais simbols nav operācija
    if (operations.includes(currentText.slice(-1))) {
        expressionElement.textContent = currentText.slice(0, -1) + ` ${op} `;
    } else {
        expressionElement.textContent += ` ${op} `;
    }
}

// Notīra displeju
function clearDisplay() {
    expressionElement.textContent = '0';
    resultElement.textContent = '';
}

// Notīra pēdējo ievadīto simbolu
function clearLast() {
    if (resultFlag) {
        clearDisplay();
        resultFlag = false;
    } else {
        expressionElement.textContent = expressionElement.textContent.slice(0, -1);
    }
}

// Pārslēdz pēdējā skaitļa zīmi
function toggleSign() {
    if (errors.includes(expressionElement.textContent)) {
        clearDisplay();
        return;
    }
    if (resultFlag) {
        clearDisplay();
        resultFlag = false;
    }
    let expression = expressionElement.textContent;
    const lastNumberMatch = expression.match(/(\d+\.?\d*)$/);
    if (lastNumberMatch) {
        const lastNumber = lastNumberMatch[0];
        const toggledNumber = '(-' + lastNumber;
        expressionElement.textContent = expression.slice(0, -lastNumber.length) + toggledNumber;
    }
}

// Aprēķina rezultātu
function calculate() {
    const expression = expressionElement.textContent.trim();
    if (!expression || errors.includes(expression)) {
        resultElement.textContent = 'Error';
        return;
    }
    // Aizver visas atvērtās iekavas
    const balancedExpression = balanceBrackets(expression);
    try {
        const sanitizedExpression = balancedExpression.replace(/%/g, '/100'); // Aizstāj % ar /100
        const result = eval(sanitizedExpression); // Izmanto eval, bet rūpīgi sanitizējot
        resultElement.textContent = result;
        addToHistory(`${expression} = ${result}`);
        resultFlag = true; // Iezīmē, ka parādīts rezultāts
    } catch (e) {
        resultElement.textContent = 'Error';
    }
}


// Palīgfunkcija iekavu balansēšanai
function balanceBrackets(expression) {
    let openBrackets = 0;

    // Saskaita atvērtās un aizvērtās iekavas
    for (const char of expression) {
        if (char === '(') {
            openBrackets++;
        } else if (char === ')') {
            openBrackets--;
        }
    }

    // Pievieno nepieciešamās aizvērtās iekavas beigās
    while (openBrackets > 0) {
        expression += ')';
        openBrackets--;
    }

    return expression;
}

// Pievieno ierakstu vēsturē un saglabā to localStorage
function addToHistory(entry) {
    history.push(entry);
    localStorage.setItem('history', JSON.stringify(history));
    renderHistory();
}

// Atjaunina vēstures sarakstu, attēlojot visus ierakstus
function renderHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    history.forEach((entry, index) => {
        const li = document.createElement('li');

        // Pārveido vēstures ierakstu par tikai izteiksmi (bez rezultāta daļas)
        const [expression] = entry.split('=');

        li.textContent = entry;

        // Pievieno noklikšķināšanas funkcionalitāti
        li.onclick = () => {
            resultFlag = false;
            expressionElement.textContent = expression.trim();
            resultElement.textContent = '';
        };

        // Dzēšanas poga
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = (e) => {
            e.stopPropagation(); // Novērš kalkulatora ievadīšanu, kad tiek dzēsts
            history.splice(index, 1);
            localStorage.setItem('history', JSON.stringify(history));
            renderHistory();
        };

        li.appendChild(deleteButton);
        historyList.appendChild(li);
    });
}

// Notīra vēsturi un izdzēš to no localStorage
function clearHistory() {
    history = [];
    localStorage.setItem('history', JSON.stringify(history));
    renderHistory();
}

// Ielādējot lapu, renderē vēsturi
document.addEventListener('DOMContentLoaded', renderHistory);
