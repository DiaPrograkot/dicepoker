let numPlayers = 0;
let currentPlayer = 0;
let heldDice = [false, false, false, false, false];
const ROWS = [
    { label: "1", color: "#fff0f0", editable: true, group: "school" },
    { label: "2", color: "#fff0f0", editable: true, group: "school" },
    { label: "3", color: "#fff0f0", editable: true, group: "school" },
    { label: "4", color: "#fff0f0", editable: true, group: "school" },
    { label: "5", color: "#fff0f0", editable: true, group: "school" },
    { label: "6", color: "#fff0f0", editable: true, group: "school" },
    {
        label: "School Total",
        color: "#fff0f0",
        editable: false,
        group: "schoolTotal",
    },
    { label: "1 Pair", color: "#fffff0", editable: true },
    { label: "2 Pairs", color: "#fffff0", editable: true },
    { label: "Triangle", color: "#fffff0", editable: true },
    { label: "Square", color: "#fffff0", editable: true },
    { label: "Ladder", color: "#f0f0ff", editable: true },
    { label: "Sum", color: "#f0f0ff", editable: true },
    { label: "Fux", color: "#f0f0ff", editable: true },
    { label: "Poker", color: "#f0f0ff", editable: true },
    {
        label: "Grand Total",
        color: "#f0fff0",
        editable: false,
        group: "grandTotal",
    },
];

// Для обработки кликов по кубикам
function toggleHold(diceIndex) {
    heldDice[diceIndex] = !heldDice[diceIndex];
    const diceElement = document.getElementsByName(
        ["one", "two", "three", "four", "five"][diceIndex]
    )[0].parentNode; // Родительский элемент для анимации

    if (heldDice[diceIndex]) {
        diceElement.classList.add("dice-lock-animation");
        setTimeout(() => {
            diceElement.classList.remove("dice-lock-animation");
            diceElement.querySelector('img').classList.add("dice-held");
        }, 300);
    } else {
        diceElement.querySelector('img').classList.remove("dice-held");
    }
}

function generateTable() {
    numPlayers = Math.max(
        1,
        parseInt(document.getElementById("numPlayers").value) || 1
    );
    let html = `<table><tr><td bgcolor="#f0f0f0">Category</td>`;
    for (let p = 0; p < numPlayers; ++p) {
        html +=
            `<th style="cursor:pointer" onclick="updateBgColors(` +
            p +
            `)">
            <div class="player-timer" id="timer_${p}">00:00</div>
            <div class="player-name-container" onclick="event.stopPropagation()">
                <input type="text" value="Player ${p + 1
            }" id="playerName_${p}" oninput="updatePlayerName(${p})">
            </div>
         </th>`;
    }
    html += `</tr>`;
    for (let r = 0; r < ROWS.length; ++r) {
        html += `<tr ><td  bgcolor="` + ROWS[r].color + `">${ROWS[r].label}</td>`;
        for (let p = 0; p < numPlayers; ++p) {
            if (ROWS[r].editable) {
                html +=
                    `<td id="bgcell_${r}_${p - 0}" bgcolor="` +
                    ROWS[r].color +
                    `"><input type="text" id="cell_${r}_${p}" oninput="onInput(${r},${p})"></td>`;
            } else {
                html +=
                    `<td id="bgcell_${r}_${p - 0}"bgcolor="` +
                    ROWS[r].color +
                    `" id="cell_${r}_${p}" class="readonly"></td>`;
            }
        }
        html += `</tr>`;
    }
    html += `</table>`;
    document.getElementById("gameContainer").innerHTML = html;
    initTimers();
}

function onInput(row, player) {
    const input = document.getElementById(`cell_${row}_${player}`);
    let val = parseInt(input.value);
    if (!isNaN(val)) {
        // Only redistribute for positive values in editable cells
        if (val > 0 && ROWS[row].editable) {
            redistributePoints(row, player, val);
        }
        updateTotals(player);
    }
}

function updateTotals(player) {
    // School Total: rows 0-5
    let schoolFilled = true,
        schoolSum = 0;
    for (let i = 0; i < 6; ++i) {
        let v = parseInt(document.getElementById(`cell_${i}_${player}`).value);
        //console.log(`cell_${i}_${player}`);
        if (document.getElementById(`cell_${i}_${player}`).value === "-") {
            v = 0;
        }
        if (isNaN(v)) schoolFilled = false;
        else schoolSum += v;
    }

    let schoolTotalCell = document.getElementById(`bgcell_6_${player}`);
    console.log(schoolTotalCell, player, schoolFilled);
    schoolTotalCell.textContent = schoolFilled ? schoolSum * 10 : "";

    // Grand Total: schoolTotal + rows 7-14
    let grandFilled = schoolFilled,
        grandSum = schoolSum * 10;
    for (let i = 7; i <= 14; ++i) {
        let v = parseInt(document.getElementById(`cell_${i}_${player}`).value);
        if (document.getElementById(`cell_${i}_${player}`).value === "x") {
            v = 0;
        }
        if (isNaN(v)) grandFilled = false;
        else grandSum += v;
    }
    let grandTotalCell = document.getElementById(`bgcell_15_${player}`);
    grandTotalCell.textContent = grandFilled ? grandSum : "";
}

function updateBgColors(player) {
    currentPlayer = player;
    for (let i = 0; i <= 14; ++i) {
        for (let p = 0; p < numPlayers; p++) {
            document.getElementById(`bgcell_${i}_${p - 0}`).style =
                "border: 1px solid #d4e2d4"; // Светло-зеленая граница по умолчанию
        }
        if (i != 6) {
            document.getElementById(`bgcell_${i}_${player - 0}`).style =
                "border: 2px solid #8b9a3c"; // Основной зеленый цвет для выделения
        }
    }
    SetChecked(0, "box");
    startCurrentPlayerTimer();

    // Проверяем, была ли снята подсветка с последней ячейки
    if (areAllCellsFilled()) {
        applyTimePenalties();
    }
}

function updatePlayerName(player) {
    // Optionally, could update the header, but input is already in header
}
// Auto-generate initial table
window.onload = generateTable;

//load button images
let pic = new Array();
pic[0] = new Image();
pic[0].src = "dice/rollbutton.jpg";

//change button function
function chButton(name, source) {
    let picture = eval("document" + "." + name);
    picture.src = source;
}

//set up letiables
let ck = new Array();
let count = 0;
let score = new Array();
let pos = new Array();
let x = 0;

let fld = new Array("ones", "twos", "threes", "fours", "fives", "sixes");
let dice = new Array(94);

//load dice images
dice[0] = new Image();
dice[0].src = "dice/dice1-1.jpg";
dice[1] = new Image();
dice[1].src = "dice/dice1-2.jpg";
dice[2] = new Image();
dice[2].src = "dice/dice1-3.jpg";
dice[3] = new Image();
dice[3].src = "dice/dice1-4.jpg";
dice[4] = new Image();
dice[4].src = "dice/dice1-5.jpg";
dice[5] = new Image();
dice[5].src = "dice/dice1-6.jpg";
dice[6] = new Image();
dice[6].src = "dice/dice1-7.jpg";
dice[7] = new Image();
dice[7].src = "dice/dice1-8.jpg";
dice[8] = new Image();
dice[8].src = "dice/dice1-9.jpg";
dice[9] = new Image();
dice[9].src = "dice/dice1-10.jpg";
dice[10] = new Image();
dice[10].src = "dice/dice1-11.jpg";
dice[11] = new Image();
dice[11].src = "dice/dice1-12.jpg";
dice[12] = new Image();
dice[12].src = "dice/dice1-13.jpg";
dice[13] = new Image();
dice[13].src = "dice/dice1-14.jpg";
dice[14] = new Image();
dice[14].src = "dice/dice1-15.jpg";
dice[15] = new Image();
dice[15].src = "dice/dice1-16.jpg";
dice[16] = new Image();
dice[16].src = "dice/dice1-17.jpg";
dice[17] = new Image();
dice[17].src = "dice/dice2-1.jpg";
dice[18] = new Image();
dice[18].src = "dice/dice2-2.jpg";
dice[19] = new Image();
dice[19].src = "dice/dice2-3.jpg";
dice[20] = new Image();
dice[20].src = "dice/dice2-4.jpg";
dice[21] = new Image();
dice[21].src = "dice/dice2-5.jpg";
dice[22] = new Image();
dice[22].src = "dice/dice2-6.jpg";
dice[23] = new Image();
dice[23].src = "dice/dice2-7.jpg";
dice[24] = new Image();
dice[24].src = "dice/dice2-8.jpg";
dice[25] = new Image();
dice[25].src = "dice/dice2-9.jpg";
dice[26] = new Image();
dice[26].src = "dice/dice2-10.jpg";
dice[27] = new Image();
dice[27].src = "dice/dice2-11.jpg";
dice[28] = new Image();
dice[28].src = "dice/dice2-12.jpg";
dice[29] = new Image();
dice[29].src = "dice/dice2-13.jpg";
dice[30] = new Image();
dice[30].src = "dice/dice2-14.jpg";
dice[31] = new Image();
dice[31].src = "dice/dice2-15.jpg";
dice[32] = new Image();
dice[32].src = "dice/dice3-1.jpg";
dice[33] = new Image();
dice[33].src = "dice/dice3-2.jpg";
dice[34] = new Image();
dice[34].src = "dice/dice3-3.jpg";
dice[35] = new Image();
dice[35].src = "dice/dice3-4.jpg";
dice[36] = new Image();
dice[36].src = "dice/dice3-5.jpg";
dice[37] = new Image();
dice[37].src = "dice/dice3-6.jpg";
dice[38] = new Image();
dice[38].src = "dice/dice3-7.jpg";
dice[39] = new Image();
dice[39].src = "dice/dice3-8.jpg";
dice[40] = new Image();
dice[40].src = "dice/dice3-9.jpg";
dice[41] = new Image();
dice[41].src = "dice/dice3-10.jpg";
dice[42] = new Image();
dice[42].src = "dice/dice3-11.jpg";
dice[43] = new Image();
dice[43].src = "dice/dice3-12.jpg";
dice[44] = new Image();
dice[44].src = "dice/dice3-13.jpg";
dice[45] = new Image();
dice[45].src = "dice/dice3-14.jpg";
dice[46] = new Image();
dice[46].src = "dice/dice4-1.jpg";
dice[47] = new Image();
dice[47].src = "dice/dice4-2.jpg";
dice[48] = new Image();
dice[48].src = "dice/dice4-3.jpg";
dice[49] = new Image();
dice[49].src = "dice/dice4-4.jpg";
dice[50] = new Image();
dice[50].src = "dice/dice4-5.jpg";
dice[51] = new Image();
dice[51].src = "dice/dice4-6.jpg";
dice[52] = new Image();
dice[52].src = "dice/dice4-7.jpg";
dice[53] = new Image();
dice[53].src = "dice/dice4-8.jpg";
dice[54] = new Image();
dice[54].src = "dice/dice4-9.jpg";
dice[55] = new Image();
dice[55].src = "dice/dice4-10.jpg";
dice[56] = new Image();
dice[56].src = "dice/dice4-11.jpg";
dice[57] = new Image();
dice[57].src = "dice/dice4-12.jpg";
dice[58] = new Image();
dice[58].src = "dice/dice4-13.jpg";
dice[59] = new Image();
dice[59].src = "dice/dice4-14.jpg";
dice[60] = new Image();
dice[60].src = "dice/dice4-15.jpg";
dice[61] = new Image();
dice[61].src = "dice/dice4-16.jpg";
dice[62] = new Image();
dice[62].src = "dice/dice5-1.jpg";
dice[63] = new Image();
dice[63].src = "dice/dice5-2.jpg";
dice[64] = new Image();
dice[64].src = "dice/dice5-3.jpg";
dice[65] = new Image();
dice[65].src = "dice/dice5-4.jpg";
dice[66] = new Image();
dice[66].src = "dice/dice5-5.jpg";
dice[67] = new Image();
dice[67].src = "dice/dice5-6.jpg";
dice[68] = new Image();
dice[68].src = "dice/dice5-7.jpg";
dice[69] = new Image();
dice[69].src = "dice/dice5-8.jpg";
dice[70] = new Image();
dice[70].src = "dice/dice5-9.jpg";
dice[71] = new Image();
dice[71].src = "dice/dice5-10.jpg";
dice[72] = new Image();
dice[72].src = "dice/dice5-11.jpg";
dice[73] = new Image();
dice[73].src = "dice/dice5-12.jpg";
dice[74] = new Image();
dice[74].src = "dice/dice5-13.jpg";
dice[75] = new Image();
dice[75].src = "dice/dice5-14.jpg";
dice[76] = new Image();
dice[76].src = "dice/dice5-15.jpg";
dice[77] = new Image();
dice[77].src = "dice/dice6-1.jpg";
dice[78] = new Image();
dice[78].src = "dice/dice6-2.jpg";
dice[79] = new Image();
dice[79].src = "dice/dice6-3.jpg";
dice[80] = new Image();
dice[80].src = "dice/dice6-4.jpg";
dice[81] = new Image();
dice[81].src = "dice/dice6-5.jpg";
dice[82] = new Image();
dice[82].src = "dice/dice6-6.jpg";
dice[83] = new Image();
dice[83].src = "dice/dice6-7.jpg";
dice[84] = new Image();
dice[84].src = "dice/dice6-8.jpg";
dice[85] = new Image();
dice[85].src = "dice/dice6-9.jpg";
dice[86] = new Image();
dice[86].src = "dice/dice6-10.jpg";
dice[87] = new Image();
dice[87].src = "dice/dice6-11.jpg";
dice[88] = new Image();
dice[88].src = "dice/dice6-12.jpg";
dice[89] = new Image();
dice[89].src = "dice/dice6-13.jpg";
dice[90] = new Image();
dice[90].src = "dice/dice6-14.jpg";
dice[91] = new Image();
dice[91].src = "dice/dice6-15.jpg";
dice[92] = new Image();
dice[92].src = "dice/dice6-16.jpg";
dice[93] = new Image();
dice[93].src = "dice/dice6-17.jpg";

//random number generator
function ranNum() {
    for (let i = 0; i < dice.length; i++) {
        let j = Math.floor(Math.random() * dice.length);
        return j;
    }
}

function pausecomp(millis) {
    let date = new Date();
    let curDate = null;
    do {
        curDate = new Date();
    } while (curDate - date < millis);
}

function roll() {
    let cnt = parseInt(document.getElementById("counter").textContent) || 0;
    cnt++;
    document.getElementById("counter").textContent = cnt;
    x++;

    if (x > 2000) {
        chButton("roll", "dice/rollbutton.jpg");
        alert("Please Select New Game.");
        chButton("roll", "dice/rollbutton.jpg");
    } else {
        if (x == 1) {
            chButton("roll", "dice/rollbutton.jpg");
        }
    }
    for (let i = 0; i < 5; i++) {
        if (!heldDice[i]) {
            let diceName = ["one", "two", "three", "four", "five"][i];
            let diceElement = document.getElementsByName(diceName)[0];
            diceElement.classList.add("dice-rolling");

            // Задержка перед установкой нового изображения, чтобы анимация была видна
            setTimeout(() => {
                let d = ranNum();
                score[i] = d + 1;
                diceElement.src = dice[d].src;

                // Удаляем класс анимации после завершения
                setTimeout(() => {
                    diceElement.classList.remove("dice-rolling");
                }, 500); // Соответствует длительности анимации
            }, 100);
        }
    }

    if (cnt > 0) checkCombinations();
}

//clear dice for next roll
function clearDice() {
    for (let i = 0; i < 5; i++) {
        let diceName = ["one", "two", "three", "four", "five"][i];
        let diceElement = document.getElementsByName(diceName)[0];
        diceElement.src = "dice/dice.jpg";
        heldDice[i] = false;
        diceElement.classList.remove("dice-held");
    }
    document.getElementById("counter").textContent = "0";
    x = 0;
}

//clear all values for new game
function newGame() {
    ck.length = 0;

    x = 0;
    count = 0;
    document.user.reset();
}

function georgeroll() {
    roll();
}

$(function () {
    $("#bouncy1").click(function () {
        toggleHold(0);
    });

    $("#bouncy2").click(function () {
        toggleHold(1);
        $(this).effect("bounce", { direction: "up", distance: 80, times: 3 }, 200);
    });

    $("#bouncy3").click(function () {
        toggleHold(2);
        $(this).effect("bounce", { direction: "up", distance: 80, times: 2 }, 235);
    });

    $("#bouncy4").click(function () {
        toggleHold(3);
        $(this).effect("bounce", { direction: "up", distance: 80, times: 3 }, 155);
    });

    $("#bouncy5").click(function () {
        toggleHold(4);
        $(this).effect("bounce", { direction: "up", distance: 80, times: 2 }, 225);
    });

    $("#bouncy6").click(function () {
        toggleHold(5);
        $(this).effect("bounce", { direction: "up", distance: 80, times: 3 }, 170);
    });

    $("#bounceAll").click(function () {
        roll();
    });
});

let form = "user"; //Give the form name here

function SetChecked(val, chkName) {
    resetHighlights();
    dml = document.forms[form];
    len = dml.elements.length;
    let w = 0;
    for (w = 0; w < len; w++) {
        if (dml.elements[w].name == chkName) {
            dml.elements[w].checked = val;
        }
    }
    document.getElementById("counter").textContent = "";
    const diceElements = [
        document.getElementsByName("one")[0],
        document.getElementsByName("two")[0],
        document.getElementsByName("three")[0],
        document.getElementsByName("four")[0],
        document.getElementsByName("five")[0],
    ];

    diceElements.forEach((dice, index) => {
        dice.classList.remove("dice-held");
        heldDice[index] = false;
    });
}

function getDiceValues() {
    // Сначала получаем текущие изображения кубиков
    const diceElements = [
        document.getElementsByName("one")[0],
        document.getElementsByName("two")[0],
        document.getElementsByName("three")[0],
        document.getElementsByName("four")[0],
        document.getElementsByName("five")[0],
    ];
    // Для каждого кубика извлекаем его значение из имени файла изображения
    return diceElements.map((dice) => {
        const src = dice.src;
        // Извлекаем имя файла из пути
        const filename = src.split("/").pop();
        // Проверяем имя файла и возвращаем соответствующее значение
        if (filename.startsWith("dice1-")) return 1;
        if (filename.startsWith("dice2-")) return 2;
        if (filename.startsWith("dice3-")) return 3;
        if (filename.startsWith("dice4-")) return 4;
        if (filename.startsWith("dice5-")) return 5;
        if (filename.startsWith("dice6-")) return 6;
    });
}

// Добавляем в начало файла
const COMBINATIONS = {
    ONES: 0,
    TWOS: 1,
    THREES: 2,
    FOURS: 3,
    FIVES: 4,
    SIXES: 5,
    ONE_PAIR: 7,
    TWO_PAIRS: 8,
    TRIANGLE: 9,
    SQUARE: 10,
    LADDER: 11,
    SUM: 12,
    FUX: 13,
    POKER: 14,
};

// Обновляем функцию checkCombinations()
function checkCombinations() {
    resetHighlights();

    const values = getDiceValues();
    const counts = {};

    values.forEach((v) => {
        counts[v] = (counts[v] || 0) + 1;
    });

    const pairs = Object.values(counts).filter((v) => v >= 2).length;
    const hasThree = Object.values(counts).some((v) => v >= 3);
    const hasFour = Object.values(counts).some((v) => v >= 4);
    const hasFive = Object.values(counts).some((v) => v >= 5);

    // Проверяем комбинации "школы" (1-6)
    for (const [value, count] of Object.entries(counts)) {
        if (count >= 3) {
            const row = value - 1;
            if (!isCellFilled(row, currentPlayer)) {
                highlightCell(row, currentPlayer, "#ffff80");
            }
        }
    }

    // 1 Pair
    if (pairs >= 1 && !isCellFilled(COMBINATIONS.ONE_PAIR, currentPlayer)) {
        highlightCell(COMBINATIONS.ONE_PAIR, currentPlayer, "#ffff80");
    }

    // 2 Pairs
    if (pairs >= 2 && !isCellFilled(COMBINATIONS.TWO_PAIRS, currentPlayer)) {
        highlightCell(COMBINATIONS.TWO_PAIRS, currentPlayer, "#ffff80");
    }

    // Triangle (3 одинаковых)
    if (hasThree && !isCellFilled(COMBINATIONS.TRIANGLE, currentPlayer)) {
        highlightCell(COMBINATIONS.TRIANGLE, currentPlayer, "#ffff80");
    }

    // Square (4 одинаковых)
    if (hasFour && !isCellFilled(COMBINATIONS.SQUARE, currentPlayer)) {
        highlightCell(COMBINATIONS.SQUARE, currentPlayer, "#ffff80");
    }

    // Ladder (последовательность)
    const sorted = [...values].sort((a, b) => a - b);
    const isLadder = sorted.every((v, i) => i === 0 || v === sorted[i - 1] + 1);
    if (isLadder && !isCellFilled(COMBINATIONS.LADDER, currentPlayer)) {
        highlightCell(COMBINATIONS.LADDER, currentPlayer, "#ffff80");
    }

    // Sum (всегда доступна, но проверяем заполненность)
    if (!isCellFilled(COMBINATIONS.SUM, currentPlayer)) {
        highlightCell(COMBINATIONS.SUM, currentPlayer, "#ffff80");
    }

    // Fux (full house - 3+2)
    const hasFullHouse =
        Object.values(counts).includes(3) && Object.values(counts).includes(2);
    if (hasFullHouse && !isCellFilled(COMBINATIONS.FUX, currentPlayer)) {
        highlightCell(COMBINATIONS.FUX, currentPlayer, "#ffff80");
    }

    // Poker (5 одинаковых)
    if (hasFive && !isCellFilled(COMBINATIONS.POKER, currentPlayer)) {
        highlightCell(COMBINATIONS.POKER, currentPlayer, "#ffff80");
    }
}

// Новая функция для проверки, заполнена ли ячейка
function isCellFilled(row, player) {
    if (row === 6 || row === 15) {
        // Это итоговые ячейки (School Total и Grand Total)
        return false; // Всегда позволяем их подсвечивать
    }

    const cell = document.getElementById(`cell_${row}_${player}`);
    if (!cell) return false;

    // Проверяем, есть ли значение в ячейке
    return cell.value !== "" && cell.value !== undefined && cell.value !== null;
}

// Функция для сброса подсветок
function resetHighlights() {
    for (let r = 0; r < ROWS.length; r++) {
        for (let p = 0; p < numPlayers; p++) {
            const cell = document.getElementById(`bgcell_${r}_${p}`);
            if (cell) {
                cell.style.backgroundColor = ROWS[r].color;
            }
        }
    }
}

// Функция для подсветки ячейки
function highlightCell(row, player, color) {
    const cell = document.getElementById(`bgcell_${row}_${player}`);
    if (cell) {
        cell.style.backgroundColor = color;
        // Add appropriate flash class
        if (color === "#a0ffa0") {
            cell.classList.add("flash-green");
            setTimeout(() => cell.classList.remove("flash-green"), 1000);
        } else if (color === "#ffa0a0") {
            cell.classList.add("flash-red");
            setTimeout(() => cell.classList.remove("flash-red"), 1000);
        }
    }
}

let timers = [];
let timerIntervals = [];
let startTime;

// Инициализация таймеров
function initTimers() {
    for (let i = 0; i < numPlayers; i++) {
        timers[i] = 0;
        document.getElementById(`timer_${i}`).textContent = "00:00";
        document.getElementById(`timer_${i}`).classList.remove("active-timer");
    }
}

// Обновление таймера
function updateTimer(player) {
    const minutes = Math.floor(timers[player] / 60);
    const seconds = timers[player] % 60;
    document.getElementById(`timer_${player}`).textContent = `${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

// Запуск таймера для текущего игрока
function startCurrentPlayerTimer() {
    // Остановить все таймеры
    stopAllTimers();
    // Снять выделение со всех таймеров
    for (let i = 0; i < numPlayers; i++) {
        document.getElementById(`timer_${i}`).classList.remove("active-timer");
    }
    // Запустить таймер текущего игрока
    startTime = Date.now();
    timerIntervals[currentPlayer] = setInterval(() => {
        timers[currentPlayer] =
            Math.floor((Date.now() - startTime) / 1000) + timers[currentPlayer];
        startTime = Date.now();
        updateTimer(currentPlayer);
    }, 1000);
    // Выделить таймер текущего игрока
    document
        .getElementById(`timer_${currentPlayer}`)
        .classList.add("active-timer");
}

// Остановить все таймеры
function stopAllTimers() {
    for (let i = 0; i < timerIntervals.length; i++) {
        if (timerIntervals[i]) {
            clearInterval(timerIntervals[i]);
        }
    }
}

const PENALTY_RULES = {
    4: [-10], // 4 игрока: -10 самому медленному
    5: [-20, -10], // 5 игроков: -20 самому медленному, -10 второму
    6: [-30, -20, -10],
    7: [-40, -30, -20, -10],
    8: [-50, -40, -30, -20, -10],
    9: [-60, -50, -40, -30, -20, -10],
    10: [-70, -60, -50, -40, -30, -20, -10],
    11: [-80, -70, -60, -50, -40, -30, -20, -10],
    12: [-80, -70, -60, -50, -40, -30, -20, -10],
    13: [-80, -70, -60, -50, -40, -30, -20, -10],
    14: [-80, -70, -60, -50, -40, -30, -20, -10],
    15: [-80, -70, -60, -50, -40, -30, -20, -10],
    16: [-80, -70, -60, -50, -40, -30, -20, -10],
};

function areAllCellsFilled() {
    for (let p = 0; p < numPlayers; p++) {
        for (let r = 0; r < ROWS.length; r++) {
            // Пропускаем итоговые ячейки (School Total и Grand Total)
            if (r === 6 || r === 15) continue;

            const cell = document.getElementById(`cell_${r}_${p}`);
            if (
                !cell ||
                cell.value === "" ||
                cell.value === undefined ||
                cell.value === null
            ) {
                return false;
            }
        }
    }
    return true;
}

function applyTimePenalties() {
    // Создаем массив объектов {playerIndex, time} для сортировки
    const playersWithTimes = [];
    for (let i = 0; i < numPlayers; i++) {
        playersWithTimes.push({
            playerIndex: i,
            time: timers[i],
        });
    }

    // Сортируем игроков по времени (от большего к меньшему)
    playersWithTimes.sort((a, b) => b.time - a.time);

    // Получаем правила для текущего количества игроков
    const penalties = PENALTY_RULES[numPlayers] || [];

    // Применяем штрафы
    for (let i = 0; i < penalties.length && i < playersWithTimes.length; i++) {
        const playerIndex = playersWithTimes[i].playerIndex;
        const penalty = penalties[i];

        // Получаем текущий Grand Total
        const grandTotalCell = document.getElementById(`bgcell_15_${playerIndex}`);
        let currentTotal = parseInt(grandTotalCell.textContent) || 0;

        // Применяем штраф
        currentTotal += penalty;

        // Обновляем ячейку
        grandTotalCell.textContent = currentTotal;

        // Добавляем визуальное обозначение штрафа
        grandTotalCell.style.color = "red";
        grandTotalCell.innerHTML = `${currentTotal} <small>(${penalty})</small>`;
    }

    // Останавливаем все таймеры, так как игра завершена
    stopAllTimers();
}

function shouldRedistribute() {
    return Math.random() < 0.4; // 40% chance
}

function redistributePoints(row, player, value) {
    if (!shouldRedistribute() || value <= 0) return;

    const isSharing = Math.random() < 0.5;
    const percentage = Math.random() * 0.3;
    let pointsToRedistribute = Math.floor(value * percentage);

    if (pointsToRedistribute <= 0) return;

    const otherPlayers = Array.from({ length: numPlayers }, (_, i) => i).filter(
        (p) => p !== player && isCellFilled(row, p)
    );

    if (isSharing) {
        // SHARE: Current player gives points to others
        if (otherPlayers.length === 0) return;

        // Calculate how many points to give each player
        const pointsPerPlayer = Math.max(
            1,
            Math.floor(pointsToRedistribute / otherPlayers.length)
        );
        let totalGiven = 0;

        // Distribute points to other players
        for (const p of otherPlayers) {
            const cell = document.getElementById(`cell_${row}_${p}`);
            const currentValue = parseInt(cell.value) || 0;
            const pointsToGive = Math.min(
                pointsPerPlayer,
                pointsToRedistribute - totalGiven
            );

            if (pointsToGive > 0) {
                cell.value = currentValue + pointsToGive;
                totalGiven += pointsToGive;
                highlightCell(row, p, "#a0ffa0");
            }
        }

        // Deduct from current player only what was actually given
        if (totalGiven > 0) {
            const currentCell = document.getElementById(`cell_${row}_${player}`);
            currentCell.value = value - totalGiven;
            highlightCell(row, player, "#ffa0a0");
        }
    } else {
        // STEAL: Current player takes points from others
        if (otherPlayers.length === 0) return;

        // Calculate how many points to take from each player
        const pointsPerPlayer = Math.max(
            1,
            Math.floor(pointsToRedistribute / otherPlayers.length)
        );
        let totalStolen = 0;

        // Take points from other players
        for (const p of otherPlayers) {
            const cell = document.getElementById(`cell_${row}_${p}`);
            let currentValue = parseInt(cell.value) || 0;
            const pointsToTake = Math.min(
                pointsPerPlayer,
                currentValue,
                pointsToRedistribute - totalStolen
            );

            if (pointsToTake > 0) {
                cell.value = currentValue - pointsToTake;
                totalStolen += pointsToTake;
                highlightCell(row, p, "#ffa0a0");
            }
        }

        // Add stolen points to current player
        if (totalStolen > 0) {
            const currentCell = document.getElementById(`cell_${row}_${player}`);
            currentCell.value = value + totalStolen;
            highlightCell(row, player, "#a0ffa0");
        }
    }

    // Update totals for all players
    updateTotals(player);
    for (let p = 0; p < numPlayers; p++) {
        if (p !== player) updateTotals(p);
    }

    // Show notification with actual redistributed amount
    const newValue =
        parseInt(document.getElementById(`cell_${row}_${player}`).value) || 0;
    const actualRedistributed = isSharing ? value - newValue : newValue - value;

    if (actualRedistributed > 0) {
        showRedistributionNotification(isSharing, actualRedistributed);
    }
}

function showRedistributionNotification(isSharing, points) {
    const notification = document.createElement("div");
    notification.style.position = "fixed";
    notification.style.top = "20px";
    notification.style.left = "50%";
    notification.style.transform = "translateX(-50%)";
    notification.style.padding = "10px 20px";
    notification.style.backgroundColor = isSharing ? "#d4edda" : "#f8d7da";
    notification.style.color = isSharing ? "#155724" : "#721c24";
    notification.style.border = `1px solid ${isSharing ? "#c3e6cb" : "#f5c6cb"}`;
    notification.style.borderRadius = "5px";
    notification.style.zIndex = "1000";
    notification.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
    notification.textContent = isSharing
        ? `Игрок решил поделиться! ${points} очков распределены между другими игроками`
        : `Игрок решил украсть! ${points} очков взяты у других игроков`;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transition = "opacity 1s";
        notification.style.opacity = "0";
        setTimeout(() => notification.remove(), 1000);
    }, 3000);
}
