const compounds = {
    oxidos: ["CO", "SO2", "NO2", "Fe2O3", "ZnO", "CuO", "PbO", "MnO2", "NiO", "SnO"],
    hidroxidos: ["NaOH", "KOH", "Ca(OH)2", "Mg(OH)2", "Al(OH)3", "LiOH", "Ba(OH)2", "Fe(OH)3", "Cu(OH)2", "Zn(OH)2"],
    acidos: ["HCl", "H2SO4", "HNO3", "HI", "HBr", "H3PO4", "HClO3", "HNO2", "H2CO3", "HF"],
    oxacidos: ["H2CO3", "H3PO4", "HClO3", "HNO2", "H2SO3", "HNO3", "HClO4", "H2CrO4", "HIO3", "H2SeO4"],
    sales: ["NaCl", "KNO3", "CaCO3", "MgSO4", "NaBr", "Na2SO4", "K2CO3", "CaCl2", "Ba(NO3)2", "NaI"],
    "iones-negativos": ["Cl^-", "SO4^2-", "NO3^-", "CO3^2-", "PO4^3-", "CH3COO^-", "OH^-", "CN^-", "NH4^+", "COO^-"]
};

let randomCompounds = [];
let currentPlayer = 1;
let scores = { 1: 0, 2: 0 };
let hasPlayed = { 1: false, 2: false };
let timerInterval;
let timeLeft = 30;
let roundCompounds = [];
let playerResults = { 1: { correct: 0, incorrect: [] }, 2: { correct: 0, incorrect: [] } };
let originalCompounds = [];
let turnCounter = 1;  // Contador de turnos

// Obtener compuestos aleatorios únicos
function getRandomCompounds() {
    const allCompounds = Object.values(compounds).flat();
    const selected = [];
    const usedIndices = new Set();
    const maxCompounds = 10;

    while (selected.length < maxCompounds) {
        const randomIndex = Math.floor(Math.random() * allCompounds.length);
        if (!usedIndices.has(randomIndex)) {
            usedIndices.add(randomIndex);
            selected.push(allCompounds[randomIndex]);
        }
    }
    return selected;
}

// Configurar la lista de compuestos
function setupCompounds() {
    const compoundList = document.getElementById("compound-list");
    compoundList.innerHTML = '';

    randomCompounds.forEach((compound) => {
        const div = document.createElement("div");
        div.className = "compound";
        div.draggable = true;
        div.textContent = compound;
        compoundList.appendChild(div);

        div.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text", compound);
        });
    });
}

// Actualizar pantalla del turno
function updateTurnDisplay() {
    const turnDisplay = document.getElementById("turn-display");
    turnDisplay.textContent = `Turno del Jugador ${currentPlayer}`;
}

// Reiniciar el juego
function resetGame() {
    clearInterval(timerInterval);
    document.getElementById("result-screen").classList.remove("active");
    document.getElementById("game-screen").classList.add("active");
    randomCompounds = getRandomCompounds();
    originalCompounds = [...randomCompounds];
    roundCompounds = [...randomCompounds];
    setupCompounds();
    clearCategories();
    scores = { 1: 0, 2: 0 };
    hasPlayed = { 1: false, 2: false };
    currentPlayer = 1;
    playerResults = { 1: { correct: 0, incorrect: [] }, 2: { correct: 0, incorrect: [] } };
    document.getElementById("player1-score").textContent = scores[1];
    document.getElementById("player2-score").textContent = scores[2];
    document.getElementById("time").textContent = timeLeft;
    updateTurnDisplay();
}

// Agregar el eventListener para reiniciar el juego solo una vez
document.getElementById("restart-btn").addEventListener("click", resetGame);


// Limpiar las categorías
function clearCategories() {
    const categories = document.querySelectorAll(".category");
    categories.forEach((category) => {
        category.innerHTML = '';
        const categoryName = category.dataset.category;
        const categoryTitle = document.createElement("h4");
        categoryTitle.textContent = categoryName;
        category.appendChild(categoryTitle);
    });
}

// Manejar el drag and drop
function handleDragAndDrop() {
    const categories = document.querySelectorAll(".category");

    categories.forEach((category) => {
        category.addEventListener("dragover", (e) => e.preventDefault());

        category.addEventListener("drop", (e) => {
            e.preventDefault();
            const compound = e.dataTransfer.getData("text");

            const div = document.createElement("div");
            div.className = "compound";
            div.textContent = compound;
            div.setAttribute("data-compound", compound);
            category.appendChild(div);

            // Eliminar el compuesto de la lista de compuestos
            const compoundList = document.getElementById("compound-list");
            [...compoundList.children].forEach((child) => {
                if (child.textContent === compound) child.remove();
            });

            const index = roundCompounds.indexOf(compound);
            if (index !== -1) {
                roundCompounds.splice(index, 1); 
            }

            // Permitir que se pueda devolver al listado
            div.addEventListener("dblclick", () => {
                category.removeChild(div);
                const newDiv = document.createElement("div");
                newDiv.className = "compound";
                newDiv.textContent = compound;
                newDiv.draggable = true;
                compoundList.appendChild(newDiv);

                // Volver a añadir el compuesto a roundCompounds
                roundCompounds.push(compound);
            });
        });
    });
}

// Temporizador
function startTimer() {
    timeLeft = 30;  // Usar la variable global
    document.getElementById("time").textContent = timeLeft;
    clearInterval(timerInterval);  // Asegurarse de que no haya intervalos previos activos
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("time").textContent = timeLeft;

        if (timeLeft === 0) {
            clearInterval(timerInterval);
            document.getElementById("pass-turn").click(); // Pasar el turno cuando el tiempo termine
        }
    }, 1000);
}

// Selección de jugadores
document.getElementById("player1-btn").addEventListener("click", () => {
    currentPlayer = 1;  
    startGame();
});

document.getElementById("player2-btn").addEventListener("click", () => {
    currentPlayer = 2;  
    startGame();
});

// Iniciar juego
function startGame() {
    document.getElementById("player-selection-screen").classList.remove("active");
    document.getElementById("game-screen").classList.add("active");

    randomCompounds = getRandomCompounds();
    originalCompounds = [...randomCompounds];
    roundCompounds = [...randomCompounds];
    setupCompounds();
    clearCategories();
    handleDragAndDrop();
    document.getElementById("score").textContent = "0";
    timeLeft = 30;
    startTimer();  
    updateTurnDisplay();
}

// Finalizar ronda y pasar al siguiente jugador
document.getElementById("pass-turn").addEventListener("click", () => {
    let score = 0;
    const categories = document.querySelectorAll(".category");
    let compoundsNotClassified = [...roundCompounds]; // Usamos una copia de la lista original

    // Revisamos las categorías y clasificamos los compuestos
    categories.forEach((category) => {
        const categoryName = category.dataset.category;
        const compoundsInCategory = [...category.children].map((child) => child.textContent);
        const correctCompounds = compounds[categoryName];
        score += compoundsInCategory.filter(compound => correctCompounds.includes(compound)).length;

        // Guardamos los resultados correctos e incorrectos
        compoundsInCategory.forEach(compound => {
            if (correctCompounds.includes(compound)) {
                playerResults[currentPlayer].correct++;
            } else {
                playerResults[currentPlayer].incorrect.push({ compound, category: categoryName });
            }
        });

        // Actualizamos los compuestos no clasificados
        compoundsInCategory.forEach(compound => {
            const index = compoundsNotClassified.indexOf(compound);
            if (index !== -1) compoundsNotClassified.splice(index, 1);
        });
    });

    // Sumar el puntaje al jugador actual
    scores[currentPlayer] += score;
    document.getElementById(`player${currentPlayer}-score`).textContent = scores[currentPlayer];

    // Limpiar las categorías y devolver los compuestos al listado original para el próximo turno
    clearCategories();
    roundCompounds = [...originalCompounds];
    setupCompounds();

    // Revisamos si ambos jugadores ya jugaron en este turno
    if (hasPlayed[1] && hasPlayed[2]) {
        showResults();
    } else {
        // Aumentar el contador de turnos
        turnCounter++;

        // Si el contador de turnos es mayor que 2, reiniciar
        if (turnCounter > 2) {
            turnCounter = 1; // Resetear el contador de turnos
            // Re-iniciar el estado de jugabilidad
            hasPlayed = { 1: false, 2: false };
        }

        // Pasar al siguiente jugador
        hasPlayed[currentPlayer] = true;
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updateTurnDisplay();
        startTimer();
    }
});


// Mostrar resultados finales
function showResults() {
    clearInterval(timerInterval);
    document.getElementById("result-screen").classList.add("active");
    document.getElementById("game-screen").classList.remove("active");

    document.getElementById("final-score").textContent = `Puntaje Final: Jugador 1: ${scores[1]} | Jugador 2: ${scores[2]}`;

    const winner = scores[1] > scores[2] ? "Jugador 1" : scores[1] < scores[2] ? "Jugador 2" : "Empate";
    const winnerMessage = document.createElement("h3");
    winnerMessage.textContent = `¡El ganador es: ${winner}!`;
    document.getElementById("result-screen").appendChild(winnerMessage);

    const resultSummary = document.createElement("div");
    resultSummary.innerHTML = `<p>Jugador 1: ${playerResults[1].correct} Correctos</p>
    <p>Jugador 2: ${playerResults[2].correct} Correctos</p>`;
    document.getElementById("result-screen").appendChild(resultSummary);
}




// Función para manejar el paso de turno
document.getElementById("pass-turn").addEventListener("click", () => {
    let score = 0;
    const categories = document.querySelectorAll(".category");
    let compoundsNotClassified = [...roundCompounds]; // Usamos una copia de la lista original

    // Revisamos las categorías y clasificamos los compuestos
    categories.forEach((category) => {
        const categoryName = category.dataset.category;
        const compoundsInCategory = [...category.children].map((child) => child.textContent);
        const correctCompounds = compounds[categoryName];
        score += compoundsInCategory.filter(compound => correctCompounds.includes(compound)).length;

        // Guardamos los resultados correctos e incorrectos
        compoundsInCategory.forEach(compound => {
            if (correctCompounds.includes(compound)) {
                playerResults[currentPlayer].correct++;
            } else {
                playerResults[currentPlayer].incorrect.push({ compound, category: categoryName });
            }
        });

        // Actualizamos los compuestos no clasificados
        compoundsInCategory.forEach(compound => {
            const index = compoundsNotClassified.indexOf(compound);
            if (index !== -1) compoundsNotClassified.splice(index, 1);
        });
    });

    scores[currentPlayer] += score;  // Actualizamos el puntaje del jugador
    document.getElementById(`player${currentPlayer}-score`).textContent = scores[currentPlayer];

    // Revisamos si ambos jugadores ya jugaron en este turno
    if (hasPlayed[1] && hasPlayed[2]) {
        showResults();
    } else {
        // Limpiar las categorías y devolver los compuestos al listado original si el jugador 1 ya jugó
        if (currentPlayer === 1) {
            clearCategories();
            randomCompounds = [...originalCompounds];
            setupCompounds();
        } else {
            clearCategories();
            roundCompounds = [...originalCompounds];
            setupCompounds();
        }

        // Aumentar el contador de turnos
        turnCounter++;

        // Si el contador de turnos es mayor que 2, reiniciar
        if (turnCounter > 2) {
            turnCounter = 1; // Resetear el contador de turnos
            // Re-iniciar el estado de jugabilidad
            hasPlayed = { 1: false, 2: false };
        }
// Detener el temporizador actual
        stopTimer();
        
        // Pasar al siguiente jugador
        hasPlayed[currentPlayer] = true;
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updateTurnDisplay();
        startTimer();
    }
});


// Función única para pasar el turno
document.getElementById("pass-turn").addEventListener("click", () => {

     
    let score = 0;
    const categories = document.querySelectorAll(".category");
    let compoundsNotClassified = [...roundCompounds];

    // Revisamos las categorías y clasificamos los compuestos
    categories.forEach((category) => {
        const categoryName = category.dataset.category;
        const compoundsInCategory = [...category.children].map((child) => child.textContent);
        const correctCompounds = compounds[categoryName];
        score += compoundsInCategory.filter(compound => correctCompounds.includes(compound)).length;

        // Guardamos los resultados correctos e incorrectos
        compoundsInCategory.forEach(compound => {
            if (correctCompounds.includes(compound)) {
                playerResults[currentPlayer].correct++;
            } else {
                playerResults[currentPlayer].incorrect.push({ compound, category: categoryName });
            }
        });

        // Actualizamos los compuestos no clasificados
        compoundsInCategory.forEach(compound => {
            const index = compoundsNotClassified.indexOf(compound);
            if (index !== -1) compoundsNotClassified.splice(index, 1);
        });
    });

    // Sumar el puntaje al jugador actual
    scores[currentPlayer] += score;
    document.getElementById(`player${currentPlayer}-score`).textContent = scores[currentPlayer];

    // Limpiar las categorías y devolver los compuestos al listado original para el próximo turno
    clearCategories();
    roundCompounds = [...originalCompounds];
    setupCompounds();

    // Revisamos si ambos jugadores ya jugaron en este turno
    if (hasPlayed[1] && hasPlayed[2]) {
        showResults();
    } else {
        // Aumentar el contador de turnos
        turnCounter++;

        // Si el contador de turnos es mayor que 2, reiniciar
        if (turnCounter > 2) {
            turnCounter = 1; // Resetear el contador de turnos
            // Re-iniciar el estado de jugabilidad
            hasPlayed = { 1: false, 2: false };
        }

        // Pasar al siguiente jugador
        hasPlayed[currentPlayer] = true;
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updateTurnDisplay();
        startTimer();
    }
});
function updateTurnDisplay() {
    document.getElementById("turn-display").textContent = `Turno: Jugador ${currentPlayer}`;
}

// Función para actualizar la pantalla con el turno actual
    function updateTurnDisplay() {
    document.getElementById("turn-display").textContent = `Turno: Jugador ${currentPlayer}`;
}

function showResults() {
    clearInterval(timerInterval);  // Detener el temporizador si está corriendo
    document.getElementById("result-screen").classList.add("active");
    document.getElementById("game-screen").classList.remove("active");

    // Actualizar el puntaje final
    document.getElementById("final-score").textContent = `Puntaje Final: Jugador 1: ${scores[1]} | Jugador 2: ${scores[2]}`;

    // Determinar el ganador
    const winner = scores[1] > scores[2] ? "Jugador 1" : scores[1] < scores[2] ? "Jugador 2" : "Empate";
    const winnerMessage = document.createElement("h3");
    winnerMessage.textContent = `¡El ganador es: ${winner}!`;
    document.getElementById("result-screen").appendChild(winnerMessage);

    // Mostrar el resumen de los resultados
    const resultSummary = document.createElement("div");
    resultSummary.innerHTML = `<p>Jugador 1: ${playerResults[1].correct} Correctos</p>
    <p>Jugador 2: ${playerResults[2].correct} Correctos</p>`;
    document.getElementById("result-screen").appendChild(resultSummary);
}


// Función para actualizar el tiempo restante en la pantalla
function updateTimer() {
    const timerDisplay = document.getElementById("time");
    timerDisplay.textContent = timeLeft; // Actualiza el contador del temporizador
    if (timeLeft === 0) {
      clearInterval(timerInterval); // Detiene el temporizador cuando llegue a 0
      alert("¡Se acabó el tiempo!");
      // Aquí puedes agregar el código para finalizar la partida o hacer alguna acción
      passTurn(); // Finaliza el turno cuando se acaba el tiempo
    } else {
      timeLeft--; // Disminuye el tiempo restante
    }
  }
  // Inicia el temporizador cuando se comience el juego
function startTimer() {
    timeLeft = 30; // Reinicia el temporizador a 30 segundos cada vez que comienza un turno
    const timerDisplay = document.getElementById("time");
    timerDisplay.textContent = timeLeft; // Muestra el tiempo inicial
    timerInterval = setInterval(updateTimer, 1000); // Llama a updateTimer cada segundo
  }
  
  // Detener el temporizador actual
  function stopTimer() {
    clearInterval(timerInterval); // Detiene el temporizador actual
  }


// Llama a startTimer cuando se inicie la pantalla de juego
document.getElementById("game-screen").classList.add("active"); // Asegúrate de que la pantalla del juego se active
startTimer(); // Comienza el temporizador
