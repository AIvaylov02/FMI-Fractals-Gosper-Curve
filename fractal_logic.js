const canvas = document.getElementsByTagName("canvas")[0];
const drawer = canvas.getContext("2d");

// ще се разхожда из платното, обработвайки буквите на граматиката
class CurveDrawer {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.degrees = CurveDrawer.startingAngle;
    }

    static angleRotation = 60;
    static startingAngle = -90;
    static lengthOfStep = 4; // 4 пиксела за мен е перфектната минимална дължина на линиите, така че те да са видими и при повече итерации (5+)

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
        const xMovement = CurveDrawer.lengthOfStep * Math.cos(calculatedAngle);
        this.x += xMovement;
        const yMovement = CurveDrawer.lengthOfStep * Math.sin(calculatedAngle);
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

    constructor(iterations, color) {
        // think of the traversal as an DFS - we draw, when we reach the bottom layer of the grammar!
        this.iterations = iterations;
        this.color = color;
        // TODO CHANGE THE STARTING POSITION OF DRAWER
        this.curveDrawer = new CurveDrawer(canvas.width * 0.25, canvas.height * 0.25);
    }

    // Генерирай последователност от инструкции за изпълнение (Л-система), като подадеш нивото на итерация спрямо текущите инструкции
    #expandSymbol(symbols, iterations) {
        if (iterations === 0)
            return symbols;

        let expandedSymbols = '';
        for (const currentSymbol of symbols) {
            if (GosperCurve.rules.hasOwnProperty(currentSymbol))
                expandedSymbols += GosperCurve.rules[currentSymbol]; // if it is A or B, it will be replaced by their sequence
            else
                expandedSymbols += currentSymbol; // stick with the + or -
        }
        return this.#expandSymbol(expandedSymbols, iterations - 1);
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

        
        let startTime;
        let endTime;
        if (remainingIterations <= 0) {
            let startTime = performance.now();
            initialInstructions = this.#expandSymbol(GosperCurve.startingAxiom, this.iterations);
            this.#drawGosperCurveByChunks(initialInstructions, chunkSize);
            drawer.stroke();
            endTime = performance.now();
            console.log(`Time taken for first 5 levels: ${(endTime - startTime) / 1000} seconds`);
            return;
        }
            
        initialInstructions = this.#expandSymbol(GosperCurve.startingAxiom, detailedLevel);
        // we have the initial dots, transform each one of them to detailed, draw it, and then go to the next dot

        startTime = performance.now();
        for (const instruction of initialInstructions) {
            
            const singleDetailedInstruction = this.#expandSymbol(instruction, remainingIterations);
            this.#drawGosperCurveByChunks(singleDetailedInstruction, chunkSize);
            
        }
        endTime = performance.now();
        console.log(`Time taken for a full instruction of level 8: ${(endTime - startTime) / 1000} seconds`);
        startTime = performance.now();
        drawer.stroke(); // запълни невидимите линии, които са останали, тъй като не са направили цяло парче
        endTime = performance.now();
        console.log(`Drawing took: ${(endTime - startTime) / 1000} seconds`);
    }
    

    draw() {
        drawer.clearRect(0, 0, canvas.width, canvas.height);
        // TODO - resize this height and width of the constructor
        drawer.beginPath(); // влез в режим на чертаене, като започнеш да рисуваш векторна пътека
        this.curveDrawer.recalibrateDrawer(); // премести чертожника на кординати х и у (без да чертаеш линия)
        this.#drawGosperCurve();
    }
}
