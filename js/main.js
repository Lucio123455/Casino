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
let saldo = parseInt(localStorage.getItem('saldo')) || 0;
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
    carta.classList.add('flip'); 
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

const valorDeLaRecargaDelSaldo = 5000

function recargarSaldo() {
    if (comenzoElGame === false && saldo === 0  && apuesta === 0) {
        saldo += valorDeLaRecargaDelSaldo
        saldoEnPantalla.textContent = saldo
        actualizarSaldo(saldo)
    }
}


let seleccionApuesta = document.getElementById("seleccionApuesta");
let valorDeLaApuestaGenerica = 50
    
    
function cambiarApuesta() {
    // Obtener el elemento select
    let seleccionApuesta = document.getElementById("seleccionApuesta");
    
    // Obtener el valor seleccionado
    valorDeLaApuestaGenerica = parseInt(seleccionApuesta.value);
}

function apostar() {
    if (comenzoElGame === false && (saldo - valorDeLaApuestaGenerica) >= 0) {
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

// PACKS 

let fondosDelUsuario = JSON.parse(localStorage.getItem('fondosDelUsuario')) || ['fondo_predeterminado.jpg','fondo_11_V.mp4'];
let contadorDeFondos = JSON.parse(localStorage.getItem('contadorDeFondos')) || 2;

guardarEnLocalStorageLosFondos()

function guardarEnLocalStorageLosFondos() {
    localStorage.setItem('fondosDelUsuario', JSON.stringify(fondosDelUsuario));
    localStorage.setItem('contadorDeFondos', JSON.stringify(contadorDeFondos));
}

async function obtenerFondoPorRareza(rareza) {
    const numeroFondoComun = (Math.floor(Math.random() * 3) + 1).toString();

    try {
        const response = await fetch('../data/fondos.json');
        const fondos = await response.json();
       
        for (let i = 0; i < fondos.length; i++) {
            if (fondos[i].rareza === rareza && fondos[i].numero === numeroFondoComun) {
                return fondos[i].url;
            }
        }
        
    } catch (error) {
        console.error(error);
        throw new Error('Error al obtener fondo por rareza');
    }
}




function abrirPack(premio, tipo, esVideo) {
    const packContainer = document.getElementById('packContainer');
    const prizeMessage = document.getElementById('prizeMessage');
    const imagenFondo = document.getElementById('fondoGanado');
    const videoFondo = document.getElementById('fondoGanadoVideo');

    videoFondo.style.width = '100%';
    videoFondo.style.height = 'auto';
    let valorDeFondoRepetido = 300;

    if (tipo === "saldo") {
        prizeMessage.textContent = `Felicitaciones!!! Ganaste ${premio}`;
    } else if (tipo === "fondo") {
        prizeMessage.textContent = `Felicitaciones!!! Ganaste un fondo`;
        imagenFondo.src = `../imagenes_fondo/${premio}`;

        if (esVideo === true) {
            videoFondo.src = `../imagenes_fondo/${premio}`;
            videoFondo.load();  
        }
    } else if (tipo === "fondoRepetido") {
        prizeMessage.textContent = `Ganaste un fondo que ya tienes!!! te devolveremos ${valorDeFondoRepetido}`;
        imagenFondo.src = `../imagenes_fondo/${premio}`;
        if (esVideo === true) {
            videoFondo.src = `../imagenes_fondo/${premio}`;
            videoFondo.load(); 
        }
    }
    packContainer.style.display = 'block';
    packContainer.classList.add('abierto');

    const packCentral = document.getElementById('pack_central')
    packCentral.style.display = 'none'
}

function comprobarSiYaExiste(fondo) {
    let existe = false
    for (let i = 0; i < fondosDelUsuario.length; i++) {
        if (fondosDelUsuario[i] === fondo) {
            
            existe = true
        }
    }
    
    return existe
}

async function comprarPackBasico() {
    const valorDelPack = 500;

    if (saldo >= valorDelPack) {
        saldo -= valorDelPack;
        actualizarSaldo(saldo);
        saldoEnPantalla.textContent = saldo;

        const probabilidad = Math.random() * 1000;

        if (probabilidad <= 200) {
            saldo += 1000;
            saldoEnPantalla.textContent = saldo;
            actualizarSaldo(saldo);
            abrirPack(1000, "saldo");

        } else {
            
            try {
                let rareza = probabilidad <= 900 ? "basico" : "comun";
                let nuevoFondo = await obtenerFondoPorRareza(rareza);

                if (!comprobarSiYaExiste(nuevoFondo)) {
                    fondosDelUsuario.push(nuevoFondo);
                    contadorDeFondos++;
                    guardarEnLocalStorageLosFondos();
                    abrirPack(nuevoFondo, "fondo");
                } else {
                    saldo += 300;
                    saldoEnPantalla.textContent = saldo;
                    actualizarSaldo(saldo);
                    abrirPack(nuevoFondo, "fondoRepetido");
                }
            } catch (error) {
                console.error(error);
            }
        }
    }
}


async function comprarPackEspecial() {
    const valorDelPack = 10000;

    if (saldo >= valorDelPack) {
        saldo -= valorDelPack;
        actualizarSaldo(saldo);
        saldoEnPantalla.textContent = saldo;

        const probabilidad = Math.random() * 1000;

        if (probabilidad <= 200) {
            saldo += 50000;
            saldoEnPantalla.textContent = saldo;
            abrirPack(50000, "saldo");
        } else {
            try {
                let rareza;
                if (probabilidad <= 300) {
                    rareza = "basico";
                } else if (probabilidad <= 500) {
                    rareza = "comun";
                } else if (probabilidad <= 900) {
                    rareza = "especial";
                } else if (probabilidad <= 990) {
                    rareza = "epico";
                } else {
                    rareza = probabilidad <= 1000 ? "mitico" : "basico";
                }

                let nuevoFondo = await obtenerFondoPorRareza(rareza);

                if (!comprobarSiYaExiste(nuevoFondo)) {
                    fondosDelUsuario.push(nuevoFondo);
                    contadorDeFondos++;
                    guardarEnLocalStorageLosFondos();
                    abrirPack(nuevoFondo, "fondo");
                } else {
                    saldo += 300;
                    saldoEnPantalla.textContent = saldo;
                    actualizarSaldo(saldo);
                    abrirPack(nuevoFondo, "fondoRepetido");
                }
            } catch (error) {
                console.error(error);
            }
        }
    }
}


async function comprarPackLegendario() {
    const valorDelPack = 50000;

    if (saldo >= valorDelPack) {
        saldo -= valorDelPack;
        actualizarSaldo(saldo);
        saldoEnPantalla.textContent = saldo;

        const probabilidad = Math.random() * 1000;

        if (probabilidad <= 200) {
            saldo += 100000;
            saldoEnPantalla.textContent = saldo;
            actualizarSaldo(saldo);
            abrirPack(100000, "saldo");
        } else {
            try {
                let rareza;
                if (probabilidad <= 250) {
                    rareza = "comun";
                } else if (probabilidad <= 350) {
                    rareza = "especial";
                } else if (probabilidad <= 700) {
                    rareza = "epico";
                } else if (probabilidad <= 900) {
                    rareza = "mitico";
                } else {
                    rareza = probabilidad <= 1000 ? "legendario" : "comun";
                }

                let nuevoFondo = await obtenerFondoPorRareza(rareza);

                if (!comprobarSiYaExiste(nuevoFondo)) {
                    fondosDelUsuario.push(nuevoFondo);
                    contadorDeFondos++;
                    guardarEnLocalStorageLosFondos();
                    abrirPack(nuevoFondo, "fondo", true);
                } else {
                    saldo += 300;
                    saldoEnPantalla.textContent = saldo;
                    actualizarSaldo(saldo);
                    abrirPack(nuevoFondo, "fondoRepetido", true);
                }
            } catch (error) {
                console.error(error);
            }
        }
    }
}



function cerrarPack() {
    const packContainer = document.getElementById('packContainer');
    const imagenFondo = document.getElementById('fondoGanado')
    const videoFondo = document.getElementById('fondoGanadoVideo');
    packContainer.classList.remove('abierto');
    imagenFondo.src = '';
    videoFondo.src = '';
    packContainer.style.display = 'none';

    const packCentral = document.getElementById('pack_central')
    packCentral.style.display = 'block'
    location.reload();
}

const coleccionContainer = document.getElementById('coleccion');

function mostrarFondosDelUsuario() {
    coleccionContainer.innerHTML = ''; 

    for (let i = 0; i < contadorDeFondos; i++) {
        const esVideo = fondosDelUsuario[i].endsWith('.mp4'); 
        const elementoFondo = esVideo ? document.createElement('video') : document.createElement('img');

        elementoFondo.src = `./imagenes_fondo/${fondosDelUsuario[i]}`;
        elementoFondo.alt = `Fondo ${i + 1}`; 
        elementoFondo.classList.add('fondoDelUsuario');
        elementoFondo.dataset.fondo = fondosDelUsuario[i];
        elementoFondo.style.cursor = 'pointer';
        elementoFondo.style.transition = 'transform 0.3s ease';

        elementoFondo.addEventListener('click', function () {
            
            const nuevoFondo = elementoFondo.dataset.fondo;
            cambiarFondo(nuevoFondo, esVideo);

            elementoFondo.style.transform = 'scale(1.1)';
            setTimeout(() => {
                elementoFondo.style.transform = 'scale(1)';
            }, 300);
        });

        coleccionContainer.appendChild(elementoFondo);
    }
}

function cambiarFondo(nuevoFondo) {
    if (revisarUltimo(nuevoFondo)) {
        const video = document.getElementById("background-video");
        const imagen = document.getElementById('background-img');
        video.style.display = 'block';
        imagen.style.display = 'none';

        let nuevoVideoURL = `./imagenes_fondo/${nuevoFondo}`;
        video.src = nuevoVideoURL;
        video.play();
    } else {
        const video = document.getElementById("background-video");
        const imagen = document.getElementById('background-img');
        video.style.display = 'none';
        imagen.style.display = 'block';

        const fondo = document.getElementById('background-img');
        fondo.src = `./imagenes_fondo/${nuevoFondo}`;
    }
    localStorage.setItem('fondoActual', nuevoFondo);
    
}

function revisarUltimo(nuevoFondo) {
    let hayUnaV = false; 
    for (let i = 0; i < nuevoFondo.length; i++) {
        if (nuevoFondo[i] === 'V') {
            hayUnaV = true; 
        }
    }
    return hayUnaV;
}




// APUESTA

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
        await mostrarCartaMaquinaConRetraso(indicePosicionUno, 0);

        sePlanto = true;
        sumaDeLaMaquina = sumarCartasDelComienzoDePartida(cartasDeLaMaquina);
        await mostrarSumaMaquinaDomConRetraso(sumaDeLaMaquina, cartasDeLaMaquina);
        ronda++;

        while (sumaDeLaMaquina < NUMERO_MAXIMO && sumaDeLaMaquina < sumaDelJugador) {
            let indice = repartirCarta();
            cartasDeLaMaquina[ronda] = cartas[indice].numero;
            await mostrarCartaMaquinaConRetraso(indice, ronda * 560); 
            sumaDeLaMaquina = sumarCartaConIndexOF(sumaDeLaMaquina, cartasDeLaMaquina, ronda);
            await mostrarSumaMaquinaDomConRetraso(sumaDeLaMaquina, cartasDeLaMaquina);
            ronda++;
        }
        resultadoBlackJack(sumaDelJugador, sumaDeLaMaquina);
    }
}

async function mostrarCartaMaquinaConRetraso(indice, retraso) {
    return new Promise(resolve => {
        setTimeout(async function () {
            await mostrarCartaMaquinaImg(indice);
            resolve();
        }, retraso);
    });
}

async function mostrarSumaMaquinaDomConRetraso(suma, cartas) {
    return new Promise(resolve => {
        setTimeout(async function () {
            await mostrarSumaMaquinaDom(suma, cartas);
            resolve();
        }, 560); 
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


//SONIDOS 

let sonidoApuesta = document.getElementById("sonido_apuesta");
let sonidoGanar = document.getElementById("ganar_sonido")
let sonidoCartas = document.getElementById("sonido_cartas")
let sonidoCartasComienzo = document.getElementById("sonido_cartas_comienzo")
let gameOver = document.getElementById("game_over")


let musicaFondo = document.getElementById("musica_fondo");


let iconoMusica = document.getElementById("iconoMusica");

function toggleMusica() {
    if (musicaFondo.paused) {
        musicaFondo.play();
        iconoMusica.src = "./img/pausa.png";
    } else {
        musicaFondo.pause();
        iconoMusica.src = "./img/audio.png"; 
    }
}

//COLECCION
function mostrarColeccion(){
    document.getElementById('coleccion').style.display = 'block';
    const boton = document.getElementById('botonColeccion')
    const img = document.getElementById('coleccionImg')

    img.src = './img/cruz.png'
    document.getElementById('botonColeccion').onclick = function() {
        
        cerrarColeccion()
    };
}

function cerrarColeccion(){
    document.getElementById('coleccion').style.display = 'none';
    const boton = document.getElementById('')
    const img = document.getElementById('coleccionImg')

    img.src = './img/coleccion.png'
    document.getElementById('botonColeccion').onclick = function() {
        
        mostrarColeccion()
    };
}

//INSTRUCCIONES TIENDA
actualizarSaldo(saldo)
mostrarFondosDelUsuario();
document.addEventListener('DOMContentLoaded', function () {
    const fondoActual = localStorage.getItem('fondoActual');
    if (fondoActual) {
        cambiarFondo(fondoActual);
    }
});
