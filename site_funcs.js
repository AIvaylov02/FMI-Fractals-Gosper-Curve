const recursionLevelsNode = document.getElementById('recursion-levels');

function updateCanvasSize() {
    const BASE_SIZE = 500;
    let size = BASE_SIZE;
    const iterationsLevel = parseInt(document.getElementById("recursion-levels").value);
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
}

recursionLevelsNode.addEventListener('change', updateCanvasSize); // добави слушател към промяна на нивата на задълбоченост на фрактала, за да оразмери чертожната дъска
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