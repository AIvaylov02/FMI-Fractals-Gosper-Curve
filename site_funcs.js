const recursionLevelsNode = document.getElementById('recursion-levels');
const colorButton = document.getElementById('lines-color');
const backgroundColorButton = document.getElementById('background-color');
const buttons = document.getElementsByTagName('button');
const fractalNode = document.getElementById('fractal');

function disableDownloadButton() {
    // заключи бутона за сваляне
    buttons[1].disabled = true;
    buttons[1].classList.remove('hoverable');
}

colorButton.addEventListener('change', disableDownloadButton);
backgroundColorButton.addEventListener('change', disableDownloadButton);

function toggleBackgroundColorPicker() {
    if (backgroundColorButton.disabled) {
        // show it
        backgroundColorButton.disabled = false;
        backgroundColorButton.parentElement.style.visibility = 'visible';
    } else {
        // hide the whole element
        backgroundColorButton.parentElement.style.visibility = 'hidden';
        backgroundColorButton.disabled = true;
    }
    
    // анулирай бутона за сваляне на изображение
    disableDownloadButton();
}

document.getElementById('put-background-color').addEventListener('click', toggleBackgroundColorPicker);

let gosperCurve = null;
let currentlyDrawnCurve = null;
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

recursionLevelsNode.addEventListener('change', updateCanvasSize); // добави слушател към промяна на нивата на задълбоченост на фрактала, за да оразмери чертожната дъска
updateCanvasSize();  // първоначално инициализиране на размера

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
    
    if (newFractalIsIdenticalToOldOne(iterationsLevel, fractalColor, backgroundColor)) // старият фрактал е идентичен на новия, няма смисъл да се генерира отново
        return;
    
    const startTime = performance.now();
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
    buttons[1].disabled = false;
    buttons[1].classList.add('hoverable');
})

function exportCanvasToImage(e) {
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