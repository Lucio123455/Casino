//Variables globales del blackJack
const NUMERO_MAXIMO = 21
const RONDAS_NECESARIAS_PARA_COMENZAR = 2
const AS = 1
const valorDelAsAdicional = 11

let cartasDelJugador = []
let cartasDeLaMaquina = []
let sumaDelJugador = 0
let sumaDeLaMaquina = 0
let ronda = RONDAS_NECESARIAS_PARA_COMENZAR
let sePlanto = false
let terminoElGame = true
let comenzoElGame = false
let saldo = parseInt(localStorage.getItem('saldo')) || 5000;
let apuesta = 0

const saldoEnPantalla = document.getElementById("valorSaldo")
const apuestaEnPantalla = document.getElementById("valorApuesta")
const cartasJugadorMostrar = document.getElementById("cartasJugador");
const cartasMaquinaMostrar = document.getElementById("cartasMaquina");
const resultado = document.getElementById("resultado");
saldoEnPantalla.textContent = saldo

// ARRAY DE OBJETOS CARTAS
let palos = ['pica', 'corazón', 'diamante', 'trébol'];
let cartas = [];

for (let i = 1; i <= 10; i++) {
    for (let j = 0; j < palos.length; j++) {
        cartas.push({ numero: i, palo: palos[j] });
    }
}

let letras = ['J', 'Q', 'K'];
for (let k = 0; k < letras.length; k++) {
    for (let l = 0; l < palos.length; l++) {
        cartas.push({ numero: 10, letra: letras[k], palo: palos[l] });
    }
}

for (let i = 0; i < cartas.length; i++) {
    cartas[i].imagen = `imagenes_cartas/${i}.png`;
}

function mostrarCartaJugadorImg(indice) {
    let carta = document.createElement('img');
    carta.src = cartas[indice].imagen;
    carta.classList.add('flip'); // Agregar la clase para activar la animación
    document.getElementById('cartasJugador').appendChild(carta);
    sonidoCartas.play()
}


function mostrarCartaMaquinaImg(indice) {
    let carta = document.createElement('img');
    carta.src = cartas[indice].imagen
    carta.classList.add('flip');
    document.getElementById('cartasMaquina').appendChild(carta);
    sonidoCartas.play()
}

//FUNCIONES RELACIONADAS SALDOS Y APUESTA
function actualizarSaldo(nuevoSaldo) {
    saldo = nuevoSaldo;
    localStorage.setItem('saldo', saldo.toString());
}

const valorDeLaRecargaDelSaldo = 1000

function recargarSaldo() {
    if (comenzoElGame === false) {
        saldo += valorDeLaRecargaDelSaldo
        saldoEnPantalla.textContent = saldo
        actualizarSaldo(saldo)
    }
}

const valorDeLaApuestaGenerica = 100

function apostar() {
    if (comenzoElGame === false && saldo > 0) {
        apuesta += valorDeLaApuestaGenerica;
        apuestaEnPantalla.textContent = apuesta;
        sonidoApuesta.play();
        restarSaldo();
    }
}

function borrarApuesta() {
    if (comenzoElGame === false) {
        saldo += apuesta
        saldoEnPantalla.textContent = saldo
        apuesta = 0;
        apuestaEnPantalla.textContent = apuesta;
    }
}

function restarSaldo() {
    if (comenzoElGame === false) {
        saldo -= valorDeLaApuestaGenerica;
        saldoEnPantalla.textContent = saldo;
    }
}

let intervaloApostar;

function iniciarApostar() {
    apostar();
    
    intervaloApostar = setInterval(apostar, 100);
}

function detenerApostar() {
    clearInterval(intervaloApostar);
}

function modificarSaldo() {
    saldoEnPantalla.textContent = saldo
    actualizarSaldo(saldo)
}

//FUNCIONES PRINCIPALES PARA EL FUNCIONAMIENTO DEL JUEGO
function jugarPartida() {
    if (terminoElGame === true) {
        cartasDelJugador = []
        cartasDeLaMaquina = []
        sumaDelJugador = 0
        sumaDeLaMaquina = 0
        ronda = RONDAS_NECESARIAS_PARA_COMENZAR
        sePlanto = false
        actualizarSaldo(saldo)
        iniciarJuego()
        sonidoCartasComienzo.play()
    }
}

function iniciarJuego() {
    sumaDelJugador = comienzoDePartidaDom(cartasDelJugador, cartasDeLaMaquina)
    terminoElGame = false
    comenzoElGame = true
    if (sumaDelJugador === NUMERO_MAXIMO) {
        resultadoBlackJack(primeraSuma, sumaDeLaMaquina)
        sePlanto = true
    }
}

let indicePosicionUno

function comienzoDePartidaDom(cartasDelJugador, cartasDeLaMaquina) {
    for (let i = 0; i < RONDAS_NECESARIAS_PARA_COMENZAR; i++) {
        let indice = repartirCarta()
        cartasDeLaMaquina[i] = cartas[indice].numero
        if (i === 0) {
            mostrarCartaMaquinaImg(indice)
        } else {
            indicePosicionUno = indice
        }

        indice = repartirCarta()
        cartasDelJugador[i] = cartas[indice].numero
        mostrarCartaJugadorImg(indice)
    }
    primeraSuma = sumarCartasDelComienzoDePartida(cartasDelJugador)
    mostrarSumaDom(primeraSuma, cartasDelJugador)
    mostrarSumaMaquinaDom(cartasDeLaMaquina[0], cartasDeLaMaquina)
    return primeraSuma
}

function sumarCartasDelComienzoDePartida(cartas) {
    const casoDeDosOnces = 22
    let suma = 0
    for (let i = 0; i < RONDAS_NECESARIAS_PARA_COMENZAR; i++) {
        if (cartas[i] === AS) {
            cartas[i] = valorDelAsAdicional
        }
        suma += cartas[i]
    }
    if (suma === casoDeDosOnces) {
        suma = suma - 10
        cartas[0] = NaN
    }
    return suma
}

const LIMITE_CARTAS = 8

function pedirCarta() {
    if (comenzoElGame === true && ronda < LIMITE_CARTAS && sumaDelJugador < NUMERO_MAXIMO && sePlanto === false) {
        let indice = repartirCarta()
        cartasDelJugador[ronda] = cartas[indice].numero
        mostrarCartaJugadorImg(indice);
        sumarCartasDelJugador();

        if (sumaDelJugador > NUMERO_MAXIMO) {
            resultadoBlackJack(sumaDelJugador, sumaDeLaMaquina)
            sePlanto = true
        }
        ronda++;
    }
}

async function plantarse() {
    ronda = 1;
    if (comenzoElGame === true && sumaDelJugador <= NUMERO_MAXIMO && sePlanto === false) {
        // Mostrar la primera carta inmediatamente
        await mostrarCartaMaquinaConRetraso(indicePosicionUno, 0);

        sePlanto = true;
        sumaDeLaMaquina = sumarCartasDelComienzoDePartida(cartasDeLaMaquina);
        await mostrarSumaMaquinaDomConRetraso(sumaDeLaMaquina, cartasDeLaMaquina);
        ronda++;

        // Mostrar las cartas de la máquina con retraso
        while (sumaDeLaMaquina < NUMERO_MAXIMO && sumaDeLaMaquina < sumaDelJugador) {
            let indice = repartirCarta();
            cartasDeLaMaquina[ronda] = cartas[indice].numero;
            await mostrarCartaMaquinaConRetraso(indice, ronda * 560);  // Se aplica un retraso de 1 segundo por carta
            sumaDeLaMaquina = sumarCartaConIndexOF(sumaDeLaMaquina, cartasDeLaMaquina, ronda);
            await mostrarSumaMaquinaDomConRetraso(sumaDeLaMaquina, cartasDeLaMaquina);
            ronda++;
        }

        // Mostrar el resultado después de que todas las cartas estén visibles
        resultadoBlackJack(sumaDelJugador, sumaDeLaMaquina);
    }
}

// Función para mostrar una carta de la máquina con retraso
async function mostrarCartaMaquinaConRetraso(indice, retraso) {
    return new Promise(resolve => {
        setTimeout(async function () {
            await mostrarCartaMaquinaImg(indice);
            resolve();
        }, retraso);
    });
}

// Función para mostrar la suma de la máquina con retraso
async function mostrarSumaMaquinaDomConRetraso(suma, cartas) {
    return new Promise(resolve => {
        setTimeout(async function () {
            await mostrarSumaMaquinaDom(suma, cartas);
            resolve();
        }, 560);  // Se aplica un retraso de 1 segundo
    });
}


function sumarCartasDelJugador() {
    sumaDelJugador = sumarCartaConIndexOF(sumaDelJugador, cartasDelJugador, ronda);
    mostrarSumaDom(sumaDelJugador, cartasDelJugador);
}

function sumarCartaConIndexOF(suma, cartas, ronda) {
    suma = suma + cartas[ronda];
    let indiceAs = cartas.lastIndexOf(AS);

    if (indiceAs !== -1) {
        cartas[indiceAs] = valorDelAsAdicional;
        suma = suma + 10;
    }

    if (suma > NUMERO_MAXIMO) {
        let indiceAsAdicional = cartas.lastIndexOf(valorDelAsAdicional);
        if (indiceAsAdicional !== -1) {
            cartas[indiceAsAdicional] = NaN;
            suma = suma - 10;
        }
    }

    return suma;
}

function mostrarAlerta(titulo, mensaje, tipo, callback) {
    Swal.fire({
        position: "top",
        allowOutsideClick: false,
        title: titulo,
        text: mensaje,
        icon: tipo,
        confirmButtonText: 'Aceptar'
    }).then((result) => {
        if (result.isConfirmed) {
            if (callback) {
                callback();
            }
        }
    });
}

function resultadoBlackJack(sumaDelJugador, sumaDeLaMaquina) {
    if (sumaDelJugador > NUMERO_MAXIMO) {
        mostrarAlerta('¡PERDISTE!', 'Tu puntuación superó el límite', 'error', borrarMesa);
        saldo = saldo;
        gameOver.play()
    } else if (sumaDelJugador === NUMERO_MAXIMO && cartasDelJugador.length === 2) {
        mostrarAlerta('¡GANASTE!', 'BlackJack. ¡Felicidades!', 'success', borrarMesa);
        saldo = saldo + apuesta * 2.5;
        sonidoGanar.play()
    } else if (sumaDeLaMaquina > NUMERO_MAXIMO) {
        mostrarAlerta('¡GANASTE!', 'La máquina se pasó del límite', 'success', borrarMesa);
        saldo = saldo + apuesta * 2;
        sonidoGanar.play()
    } else if (sumaDelJugador === sumaDeLaMaquina) {
        mostrarAlerta('¡EMPATE!', 'La partida terminó en empate', 'info', borrarMesa);
        saldo = saldo + apuesta;
    } else if (sumaDelJugador > sumaDeLaMaquina) {
        mostrarAlerta('¡GANASTE!', 'Tu puntuación es mayor que la de la máquina', 'success', borrarMesa);
        saldo = saldo + apuesta * 2;
        sonidoGanar.play()
    } else if (sumaDeLaMaquina > sumaDelJugador) {
        mostrarAlerta('¡PERDISTE!', 'La puntuación de la máquina es mayor que la tuya', 'error', borrarMesa);
        saldo = saldo;
        gameOver.play()

    }

    terminoElGame = true
    comenzoElGame = false
    apuesta = 0
    apuestaEnPantalla.textContent = 0
    modificarSaldo()
}

function borrarMesa() {
    cartasJugadorMostrar.textContent = "";
    cartasMaquinaMostrar.textContent = "";
    sumaJugador.textContent = "";
    sumaMaquina.textContent = "";
}

const sumaJugador = document.getElementById("sumaJugador")

function mostrarSumaDom(suma, cartas) {
    let yaSalioUnOnce = cartas.lastIndexOf(valorDelAsAdicional);

    if (yaSalioUnOnce !== -1) {
        sumaJugador.textContent = suma + " o " + (suma - 10);
    } else {
        sumaJugador.textContent = suma
    }
}

const sumaMaquina = document.getElementById("sumaMaquina")

function mostrarSumaMaquinaDom(suma, cartas) {
    let yaSalioUnOnce = cartas.lastIndexOf(valorDelAsAdicional);

    if (yaSalioUnOnce !== -1) {
        sumaMaquina.textContent = suma + " o " + (suma - 10);
    } else {
        sumaMaquina.textContent = suma
    }
    if (cartas.length === 2 && cartas[0] === 1) {
        sumaMaquina.textContent = "11 o " + cartas[0]
    }
}

const CARTAS_MAZO = 52

function repartirCarta() {
    let indiceCarta = Math.floor(Math.random() * CARTAS_MAZO);
    return indiceCarta
}

//INSTRUCCIONES

let noMostrarMas = JSON.parse(localStorage.getItem('noMostrarMas')) || false;

function mostrarInstruccionesDesdeElJuego() {
    document.getElementById('instrucciones-container').style.display = 'block';
    document.getElementById('no-mostrar-mas').style.display = 'none';
}

function mostrarInstrucciones() {
    if (noMostrarMas !== true) {
        document.getElementById('instrucciones-container').style.display = 'block';
    }
}

function cerrarInstrucciones() {
    document.getElementById('instrucciones-container').style.display = 'none';
}

function noMostrarMasFuncion() {
    cerrarInstrucciones();
    localStorage.setItem('noMostrarMas', JSON.stringify(true));
}

mostrarInstrucciones();

// CAMBIAR FONDO 

let imagenesDeFondo = [];

for (let i = 0; i < 6; i++) {
    imagenesDeFondo[i] = `imagenes_fondo/fondo_${i}.jpg`;
}

function cambiarFondo() {
    const imgFondo = document.getElementById("background-img");
    const nuevaImagen = imagenesDeFondo[Math.floor(Math.random() * imagenesDeFondo.length)];
    imgFondo.src = nuevaImagen;
    musicaFondo.play()
}

//SONIDOS 

let sonidoApuesta = document.getElementById("sonido_apuesta");
let musicaFondo = document.getElementById("musica_fondo");
let sonidoGanar = document.getElementById("ganar_sonido")
let sonidoCartas = document.getElementById("sonido_cartas")
let sonidoCartasComienzo = document.getElementById("sonido_cartas_comienzo")
let gameOver = document.getElementById("game_over")
cambiarFondo();

