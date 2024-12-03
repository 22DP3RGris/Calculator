let history = JSON.parse(localStorage.getItem('history')) || [];
const display = document.getElementById('display');
const errors = ['Error', 'Infinity', 'NaN', 'undefined'];
const operations = ['+', '-', '/', '*'];
var resultFlag = false;

document.querySelectorAll('Button').forEach(button => {
    button.addEventListener('click', function() {
        this.blur();
    });
});


// Lai aprēķinātu rezultātu, kad nospiež Enter
document.addEventListener("keydown", function(event) {
    var num = Number(event.key);

    if (!Number.isNaN(num) ){
        appendToDisplay(event.key);
    }
    else if (operations.includes(event.key)){
        appendOperation(event.key);
    }
    else if (event.key === "Enter") {
        calculate();
    } else if (event.key === "Backspace") {
        if (resultFlag){
            clearDisplay();
            resultFlag = false;
        } else {
            display.value = display.value.slice(0, -1);
        }
    }
});


// Pievieno vērtību ekrānam, ja nav kļūdu
function appendToDisplay(value) {
    if (errors.includes(display.value)) {
        clearDisplay();
    }
    if (operations.includes(value)){
        appendOperation(value)
    } else{
        display.value += value;
    }
}

// Notīra ekrāna ievades lauku
function clearDisplay() {
    display.value = '';
}

function appendOperation(key){
    display.value += ' ' + key + ' ';
}


// Aprēķina rezultātu, izmantojot eval funkciju un pievieno vēsturei
function calculate() {
    if (errors.includes(display.value)){
        display.value = 'Error';
        return;
    }
    try {
        const result = eval(display.value);
        addToHistory(display.value + ' = ' + result);
        display.value = result;
        resultFlag = true;
    } catch (e) {
        display.value = 'Error';
    }
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
        li.textContent = entry;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Dzēst';
        deleteButton.onclick = () => {
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

// Kad lapa ir ielādēta, atjauno vēsturi
document.addEventListener('DOMContentLoaded', renderHistory);
