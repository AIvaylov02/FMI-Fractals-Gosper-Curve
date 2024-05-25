function updateWindowSizeText()
{
    let newSizeText = 'Вашият текущ размер на екрана е ';
    const width = window.innerWidth;
    const height = window.innerHeight;
    newSizeText = `${newSizeText} ${width} x ${height}`;
    document.getElementById('screen-size').innerText = newSizeText;
}

window.addEventListener('resize', updateWindowSizeText);
document.addEventListener('DOMContentLoaded', updateWindowSizeText);

const imageSizeNode = document.getElementById('image-size');

function updateCanvasSize() {
    // TODO nullify the Gosper curve? if it has been drawn
    canvas.width = parseInt(imageSizeNode.value);
    canvas.height = parseInt(imageSizeNode.value);
    // redraw gosper curve
}

imageSizeNode.addEventListener('change', updateCanvasSize); // добави слушател към промяна на размерите, за да оразмери чертожната дъска
updateCanvasSize();  // първоначално инициализиране на размера

// направи бутона интерактивен, така че когато потребителят го натисне да стартира процеса по рисуване на фрактала
let gosperCurve = null;
document.getElementsByTagName('button')[0].addEventListener('click', (e) => {
    e.preventDefault(); // не нулира въведените параметри от потребителя
    const backgroundColor = document.getElementById("background-color").value;
    canvas.style.backgroundColor = backgroundColor;

    const iterationsLevel = parseInt(document.getElementById("recursion-levels").value);
    const fractalColor = document.getElementById("lines-color").value;
    
    gosperCurve = new GosperCurve(iterationsLevel, fractalColor);
    gosperCurve.draw();
})