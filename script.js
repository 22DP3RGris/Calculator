let history = JSON.parse(localStorage.getItem('history')) || [];
const display = document.getElementById('display');

// Lai aprēķinātu rezultātu, kad nospiež Enter
document.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        calculate();
    }
});

// Pārbauda, vai ir kļūda (Error, Infinity vai NaN), un notīra ievadi, ja tāda ir
display.addEventListener('click', function() {
    if (display.value.includes('Error') || display.value.includes('Infinity') || display.value.includes('NaN')) {
        clearDisplay();
    }
});

// Pievieno vērtību ekrānam, ja nav kļūdu
function appendToDisplay(value) {
    if (display.value.includes('Error') || display.value.includes('Infinity') || display.value.includes('NaN')) {
        clearDisplay();
    }
    document.getElementById('display').value += value;
}

// Notīra ekrāna ievades lauku
function clearDisplay() {
    document.getElementById('display').value = '';
}

// Aprēķina rezultātu, izmantojot eval funkciju un pievieno vēsturei
function calculate() {
    if (display.value.includes('Error') || display.value.includes('Infinity') || display.value.includes('NaN')){
        display.value = 'Error';
        return;
    }
    try {
        const result = eval(display.value);
        addToHistory(display.value + ' = ' + result);
        display.value = result;
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
