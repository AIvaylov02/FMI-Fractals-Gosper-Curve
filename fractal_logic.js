const canvas = document.getElementsByTagName("canvas")[0];
const drawer = canvas.getContext("2d");

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
    static startingAngle = -90;
    // 4 пиксела за мен е перфектната минимална дължина на линиите, така че те да са видими и при повече итерации (5+)

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
        drawer.lineTo(this.x, this.y) // драсни невидима линия до кординати х и y        
    }

    recalibrateDrawer() {
        drawer.moveTo(this.x, this.y);
    }

    resetPosition() {
        this.x = 0;
        this.y = 0;
        this.degrees = CurveDrawer.startingAngle;
        drawer.moveTo(this.x, this.y);
    }
}


// Ще генерира последователности по граматиката за Л-системата и ще се обръща към CurveDrawer да ги изпълнява
class GosperCurve {
    static startingAxiom = 'A';
    static rules = {
        "A": "A-B--B+A++AA+B-",
        "B": "+A-BB--B-A++A+B"
    }

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
    // TODO level 11 - 23k is maximum canvas size
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

    #expandSymbol(symbols, iterations) {
        let expandedSymbols = symbols;
        for (let i = 0; i < iterations; i++) {

            let thisIterationSymbols = '';
            for (const currentSymbol of expandedSymbols) {
                if (GosperCurve.rules.hasOwnProperty(currentSymbol))
                    thisIterationSymbols += GosperCurve.rules[currentSymbol]; // if it is A or B, it will be replaced by their sequence
                else
                    thisIterationSymbols += currentSymbol; // stick with the + or -
            }
            expandedSymbols = thisIterationSymbols;
        }
        return expandedSymbols;
    }

    // one iteration generates around 15 symbols, so the function grows 15^iterations, which for powers 7 and 8 are around 170mil and 2.5 billion characters, each of which is UTF-16 (4 bytes), so about 10 billion bytes needed or 10 GB! This is enormous

    #drawChunk() {
        drawer.stroke();
        drawer.beginPath();
        this.curveDrawer.recalibrateDrawer();
        return 0;
    }

    #drawGosperCurveByChunks(instructions, chunkSize) {
        let currentChunkSize = 0;
        for (const command of instructions) {
            if (currentChunkSize >= chunkSize) // ако сме достигнали допустимия размер на парчето, изрисувай го (анимиране + баланс между памет и производителност)
                currentChunkSize = this.#drawChunk();

            this.curveDrawer.interpretSymbol(command); // изпълни командата, която е на този символ
            currentChunkSize++;
        }
    }

    #drawGosperCurve() {
        // Mixed approach: expand up to a certain level, then iterate
        const detailedLevel = 5;
        const remainingIterations = this.iterations - detailedLevel;
        const chunkSize = 1000;
        let initialInstructions = '';

        

        if (remainingIterations <= 0) {
            initialInstructions = this.#expandSymbol(GosperCurve.startingAxiom, this.iterations);
            this.#drawGosperCurveByChunks(initialInstructions, chunkSize);
            drawer.stroke();
            return;
        }
            
        initialInstructions = this.#expandSymbol(GosperCurve.startingAxiom, detailedLevel);
        // we have the initial dots, transform each one of them to detailed, draw it, and then go to the next dot

        for (const instruction of initialInstructions) {
            
            const singleDetailedInstruction = this.#expandSymbol(instruction, remainingIterations);
            this.#drawGosperCurveByChunks(singleDetailedInstruction, chunkSize);
            
        }
        drawer.stroke(); // запълни невидимите линии, които са останали, тъй като не са направили цяло парче
    }
    

    draw(backgroundColor) {
        drawer.clearRect(0, 0, canvas.width, canvas.height); // изчиства цялата дъска
        if (backgroundColor !== null) { // трябва да се добави фон
            drawer.fillStyle = backgroundColor;
            drawer.fillRect(0, 0, canvas.width, canvas.height);
        }

        drawer.strokeStyle = this.color;
        drawer.beginPath(); // влез в режим на чертаене, като започнеш да рисуваш векторна пътека
        this.curveDrawer.recalibrateDrawer(); // премести чертожника на кординати х и у (без да чертаеш линия)
        this.#drawGosperCurve();
    }
}
