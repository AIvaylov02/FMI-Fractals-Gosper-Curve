// Генератор на Криви на Госпер, Антоан Красимиров Ивайлов, СИ курс 3, група 4, факултетен номер 7MI0600129

const canvas = document.getElementsByTagName("canvas")[0];
const drawer = canvas.getContext("2d"); //

// ще се разхожда из платното, обработвайки буквите на граматиката
class CurveDrawer {
    constructor(x, y, lengthOfStep, drawingColour) {
        this.x = x;
        this.y = y;
        this.degrees = CurveDrawer.startingAngle;
        this.lengthOfStep = lengthOfStep
        drawer.strokeStyle = drawingColour;
    }

    static angleRotation = 60;
    static startingAngle = -90; // за да започне да чертае по начина, който е указан в уикипедия (право нагоре)

    interpretSymbol(symbol) {
        switch (symbol) {
            case 'A':
            case 'B':
                this.#moveByDrawing();
                break;
            case '-':
                this.#rotateRight();
                break;
            case '+':
                this.#rotateLeft();
                break;
        }
    }

    #rotateLeft() {
        this.degrees -= CurveDrawer.angleRotation;
    }

    #rotateRight() {
        this.degrees += CurveDrawer.angleRotation;
    }

    #moveByDrawing() {
        const calculatedAngle = this.degrees * Math.PI / 180;
        const xMovement = this.lengthOfStep * Math.cos(calculatedAngle);
        this.x += xMovement;
        const yMovement = this.lengthOfStep * Math.sin(calculatedAngle);
        this.y += yMovement;
        drawer.lineTo(this.x, this.y) // 'драсни' невидима линия до кординати х и y. След като се мине посредством drawer.stroke(), тя ще се покаже       
    }

    recalibrateDrawer() {
        drawer.moveTo(this.x, this.y); // премести чертожника на x и y, без да рисува линия до там
    }

}

// Ще генерира частични последователности по дадената граматиката за Л-системата и ще се обръща към CurveDrawer да ги изпълнява
class GosperCurve {
    static startingAxiom = 'A'; // начално състояние
    static rules = { // граматиката, по която се изгражда Л-системата
        "A": "A-B--B+A++AA+B-",
        "B": "+A-BB--B-A++A+B"
    }

    // служи за преоразмеряване на дължината на линиите спрямо броя на итерациите на фрактала
    static stepCalculator = {
        1: 190, // 500 x 500
        2: 65,
        3: 23,
        4: 17.5, // 1000 x 1000
        5: 13, // 2000 x 2000
        6: 4.9,
        7: 3.7, // 4000 x 4000
        8: 2.8, // 8000 x 8000
        9: 2.1, // 16k x 16k
        10: 1.15 // 23k x 23k
    }

    // служи за преоразмеряване на началната позиция спрямо нивото на детайлност на фрактала
    static startAdjuster = {
        1: {x: 80, y: 490},
        2: {x: 25, y: 365},
        3: {x: 11, y: 270},
        4: {x: 25, y: 360},
        5: {x: 200, y: 440},
        6: {x: 439, y: 210},
        7: {x: 1450, y: 140},
        8: {x: 4150, y: 130},
        9: {x: 10880, y: 850},
        10: {x: 18800, y: 3080}
    }

    constructor(iterations, color) {
        this.iterations = iterations;
        this.color = color;
        const lengthOfStep = GosperCurve.stepCalculator[iterations];
        const startPosition = GosperCurve.startAdjuster[iterations];
        this.curveDrawer = new CurveDrawer(startPosition.x, startPosition.y, lengthOfStep);
    }


    // Генерирай последователност от инструкции за изпълнение (Л-система), като подадеш нивото на итерация спрямо текущите инструкции
    // ВНИМАНИЕ ! - не трябва да се подават прекалено много инструкции или нива на итерация, тъй като функцията за генериране на такива изпълнява
    // за всеки символ по 15 нови символа, 7 от които следва да се разпишат допълнително (подлежат на още итерации). Крайния резултат расте експоненциално с темпове
    // от поне 7^x, където x е броя итерации (най-много може да е 15^x)
    // Обърнете внимание, че 15^8 = 2.5 млрд. символа, или 5 ГБ РАМ (тъй като символите в JS са UTF-16) - не е разумно да съхранявате повече от 15^5 или 15^6 неща в паметта
    #expandSymbol(symbols, iterations) {
        let expandedSymbols = symbols;
        for (let i = 0; i < iterations; i++) {

            let thisIterationSymbols = '';
            for (const currentSymbol of expandedSymbols) {
                if (GosperCurve.rules.hasOwnProperty(currentSymbol))
                    thisIterationSymbols += GosperCurve.rules[currentSymbol]; // Ако е 'А' или 'B', то го замени по правилото от граматиката
                else
                    thisIterationSymbols += currentSymbol; // Ако е '+' или '-', то ги запиши пак същите
            }
            expandedSymbols = thisIterationSymbols;
        }
        return expandedSymbols;
    }

    // При вече попълнен набор от въображеми линии, то ги оцвети
    #drawChunk() {
        drawer.stroke();
        drawer.beginPath();
        this.curveDrawer.recalibrateDrawer();
        return 0;
    }

    // обикаляй инструкциите и интерпретирай всяка от тях, като изначертаеш фрактала
    #drawGosperCurveByChunks(instructions, chunkSize) {
        let currentChunkSize = 0;
        for (const command of instructions) {
            if (currentChunkSize >= chunkSize) // ако сме достигнали допустимия размер на парчето, изрисувай го (баланс между памет и производителност)
                currentChunkSize = this.#drawChunk();

            this.curveDrawer.interpretSymbol(command); // изпълни командата, която е на този символ
            currentChunkSize++;
        }
    }

    // Смесен похват за итерация до базовите няколко нива и в последствие обхождане в дълбочина за всеки базов символ, така че да се изчертае фрактала
    #drawGosperCurve() {
        const detailedLevel = 5;
        const remainingIterations = this.iterations - detailedLevel;
        const chunkSize = 1000;
        let initialInstructions = '';

        // TODO в бъдеще да се направи анимиране на чертаенето (много браузъри НЕ го поддържат)

        // Ако итерациите са по-малко от 5, то не прави втора разбивка на инструкции
        if (remainingIterations <= 0) {
            initialInstructions = this.#expandSymbol(GosperCurve.startingAxiom, this.iterations);
            this.#drawGosperCurveByChunks(initialInstructions, chunkSize);
            drawer.stroke();
            return;
        }
            
        // получи първоначалните инструкции
        initialInstructions = this.#expandSymbol(GosperCurve.startingAxiom, detailedLevel);
        // всяка базова първоначална инструкция я обходи в дълбочина, като я разгърнеш и интерпретираш (изчертаеш)
        for (const instruction of initialInstructions) {
            const singleDetailedInstruction = this.#expandSymbol(instruction, remainingIterations);
            this.#drawGosperCurveByChunks(singleDetailedInstruction, chunkSize);
        }
        drawer.stroke(); // запълни невидимите линии, които са останали, тъй като не са направили цяло парче
    }
    
    // нарисувай изцяло фрактала, като подготвиш дъската, след което започнеш процеса по генериране на Л-системата и изчертаване на инструкциите от нея
    draw(backgroundColor) {
        drawer.clearRect(0, 0, canvas.width, canvas.height); // изчиства цялата дъска
        if (backgroundColor !== null) { // трябва да се добави фон
            drawer.fillStyle = backgroundColor; // промени цвета на фона
            drawer.fillRect(0, 0, canvas.width, canvas.height); // добави фона, като запълниш правоъгълник с размерите и координатите на чертожната дъска
        }

        drawer.strokeStyle = this.color; // смени цвета на фракталните линии
        drawer.beginPath(); // влез в режим на чертаене, като започнеш да рисуваш векторна пътека
        this.curveDrawer.recalibrateDrawer(); // премести чертожника на кординати х и у (без да чертаеш линия)
        this.#drawGosperCurve();
    }
}
