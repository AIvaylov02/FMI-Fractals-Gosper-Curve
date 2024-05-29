// Генератор на Криви на Госпер, Антоан Красимиров Ивайлов, СИ курс 3, група 4, факултетен номер 7MI0600129

const recursionLevelsNode = document.getElementById('recursion-levels');
const colorButton = document.getElementById('lines-color');
const backgroundColorButton = document.getElementById('background-color');
const buttons = document.getElementsByTagName('button');
const fractalNode = document.getElementById('fractal');

// деактивирай бутона за сваляне на изображение
function disableDownloadButton() {
    // заключи бутона за сваляне
    buttons[1].disabled = true;
    buttons[1].classList.remove('hoverable');
}

colorButton.addEventListener('change', disableDownloadButton);
backgroundColorButton.addEventListener('change', disableDownloadButton);

// в зависимост от състоянието на включено/изключено използване на фон, го смени на другото
function toggleBackgroundColorPicker() {
    if (backgroundColorButton.disabled) {
        // покажи целия елемент за смяна на фона
        backgroundColorButton.disabled = false;
        backgroundColorButton.parentElement.style.visibility = 'visible';
    } else {
        // скрий целия елемент за смяна на фона
        backgroundColorButton.parentElement.style.visibility = 'hidden';
        backgroundColorButton.disabled = true;
    }
    disableDownloadButton();
}

document.getElementById('put-background-color').addEventListener('click', toggleBackgroundColorPicker);

let gosperCurve = null;
let currentlyDrawnCurve = null;
// на база желаното ниво на итериране, обнови размера на дъската, зачисти я и зачисти текущо генерираната крива (освободи паметта), както и заглавието за кривата
function updateCanvasSize() {
    const BASE_SIZE = 500;
    let size = BASE_SIZE;
    const iterationsLevel = parseInt(recursionLevelsNode.value);
    if (iterationsLevel > 3)
        size = BASE_SIZE * 2;
    if (iterationsLevel > 4)
        size = BASE_SIZE * 4;
    if (iterationsLevel > 6)
        size = BASE_SIZE * 8;
    if (iterationsLevel > 7)
        size = BASE_SIZE * 16;
    if (iterationsLevel > 8)
        size = BASE_SIZE * 32;
    if (iterationsLevel > 9)
        size = BASE_SIZE * 46;

    canvas.width = parseInt(size);
    canvas.height = parseInt(size);
    
    // зачисти кривата на Госпер
    currentlyDrawnCurve = null;
    gosperCurve = null;
    
    // махни заглавието
    disableDownloadButton();
    fractalNode.children[0].innerText = '';
}

recursionLevelsNode.addEventListener('change', updateCanvasSize);
updateCanvasSize();  // първоначално инициализиране на размера

// провери, дали новият фрактал е идентичен на предишно генерираният (ако са еднакви, няма да се генерира наново същата рисунка)
function newFractalIsIdenticalToOldOne(iterationsLevel, fractalColor, backgroundColor) {
    const PARAMETERS_TO_CHECK = 3;
    let parametersMatching = 0;

    if (currentlyDrawnCurve !== null) { // фрактал е вече бил генериран
        if (iterationsLevel === currentlyDrawnCurve['iterationsLevel'])
            parametersMatching++;
        if (fractalColor === currentlyDrawnCurve['fractalColor'])
            parametersMatching++;
        if (backgroundColor === currentlyDrawnCurve['backgroundColor'])
            parametersMatching++;
    }
    return parametersMatching === PARAMETERS_TO_CHECK;
}

function getBackgroundColor() {
    let backgroundColor = null;
    if (!backgroundColorButton.disabled) {
        backgroundColor = backgroundColorButton.value;
    }
    return backgroundColor;
}

// прави бутона интерактивен, така че когато потребителят го натисне да стартира процеса по рисуване на фрактала
buttons[0].addEventListener('click', (e) => {
    e.preventDefault(); // не нулира въведените параметри от потребителя
    const backgroundColor = getBackgroundColor();

    const iterationsLevel = parseInt(recursionLevelsNode.value);
    const fractalColor = colorButton.value;
    
    // старият фрактал е идентичен на новия, няма смисъл да се генерира отново
    if (newFractalIsIdenticalToOldOne(iterationsLevel, fractalColor, backgroundColor)) 
        return;
    
    const startTime = performance.now(); // измерва времето за начертаване на фрактала
    gosperCurve = new GosperCurve(iterationsLevel, fractalColor);
    gosperCurve.draw(backgroundColor);
    const endTime = performance.now();

    let diff = (endTime - startTime) / 1000;
    const DIGITS_AFTER_INTEGER_PART = 4;
    const RESIZER = Math.pow(10, DIGITS_AFTER_INTEGER_PART);
    diff = Math.round((diff + Number.EPSILON) * RESIZER) / RESIZER; // закръгли резултатите до 4 знака след запетаята, ЕПСИЛОН служи за правилно закръгляне
    const fractalHeader = `Крива на Госпер от ред ${iterationsLevel}, генерирана за ${diff} секунди`;
    fractalNode.children[0].innerText = fractalHeader;

    currentlyDrawnCurve = {
        'iterationsLevel': iterationsLevel,
        'fractalColor': fractalColor,
        'backgroundColor': backgroundColor
    }

    // включи бутона за сваляне на изображението (направи го кликваем)
    buttons[1].disabled = false;
    buttons[1].classList.add('hoverable');
})

// свали текущата скица към .png изображение
function exportCanvasToImage(e) {
    // TODO имплементирай сваляне на изображение за големи фрактали (равни или имащи повече от 8 итерации)
    // снимката, даже не трябва да е растерно, а векторно изображение, понеже иначе размера расте драстично
    e.preventDefault();
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    const backgroundColor = getBackgroundColor();
    let name = `GosperCurve_lv${recursionLevelsNode.value}_color${colorButton.value}`;
    if (backgroundColor !== null) {
        name+=`_bg${backgroundColor}`;
    }
    link.download = `${name}.png`;
    link.click();
}

buttons[1].addEventListener('click', exportCanvasToImage);