const canvas = document.getElementsByTagName("canvas")[0];
const drawer = canvas.getContext("2d");

class Point {
    constructor(x, y, degrees) {
        this.x = x;
        this.y = y;
        // question for tomorrow - rotate the canvas for each point, or have the degrees offset from the previous point. No idea, which will be better
        this.degrees = degrees; // will be used for the logical point
    }
}

class GosperCurve {
    static startingAxiom = 'A';
    static rules = {
        "A": "A-B--B+A++AA+B-",
        "B": "+A-BB--B-A++A+B"
    }
    static baseLengthOfStep = 100; // calculated to be viewed good for 500x500 on 1 iteration
    static angleRotation = 60;
    static startingAngle = -90;

    constructor(iterations, color) {
        // the whole drawing will be a BFS traversal of a graph, -1 means we up the level
        // interestingPoints = [];
        // interestingPoints.append(startPoint);
        // interestingPoints.append(-1);
        this.iterations = iterations;
        this.color = color;
        this.instructions = this.#generateLSystem();
    }

    #generateLSystem() {

        // TODO checks to start on next block and not from scratch

        let currentRule = GosperCurve.startingAxiom;

        for (let i = 0; i < this.iterations; i++) {
            let nextRule = '';

            for (let characterSequence of currentRule) {
                if (GosperCurve.rules.hasOwnProperty(characterSequence))
                    characterSequence = GosperCurve.rules[characterSequence]; // if it is A or B, it will be replaced by their sequence
                nextRule += characterSequence;
            }

            
            currentRule = nextRule;
        }

        // TODO DONT KEEP THE ENTIRE STRING, DRAW ON THE FLY
        // one iteration generates around 15 symbols, so the function grows 15^iterations, which for powers 7 and 8 are around 170mil and 2.5 billion characters, each of which is UTF-16 (4 bytes), so about 10 billion bytes needed or 10 GB! This is enormous
        return currentRule;
    }

    drawGosperCurve() {
        const startHeight = canvas.height / 2 - this.iterations * 30; // in order to keep the fractal in the plane, I have to offset it depending on the circumstances
        const startWidth = this.iterations * 30;
        const point = new Point(startWidth, startHeight, GosperCurve.startingAngle);
        drawer.beginPath(); // влез в режим на чертаене, като започнеш да рисуваш векторна пътека
        drawer.moveTo(point.x, point.y); // премести чертожника на кординати х и у (без да чертаеш линия)

        const lengthOfStep = GosperCurve.baseLengthOfStep / Math.pow(7, this.iterations - 1) * Math.pow(4, this.iterations - 1);

        // TODO put length here to be calculated
        for (const command of this.instructions) {
            if (command === '-') { // завърти се по часовника (60 градуса)
                point.degrees += GosperCurve.angleRotation;
            } else if (command === '+') { // завърти се в обратно на часовника (60 градуса)
                point.degrees -= GosperCurve.angleRotation;
            } else { // правилото е А или B, трябва да се предвижим
                const calculatedAngle = point.degrees * Math.PI / 180;
                const xMovement = lengthOfStep * Math.cos(calculatedAngle);
                point.x += xMovement;
                const yMovement = lengthOfStep * Math.sin(calculatedAngle);
                point.y += yMovement;
                drawer.lineTo(point.x, point.y) // драсни невидима линия до кординати х и y
            }
        }

        drawer.stroke(); // запълни невидимите линии, ефективно правейки ги видими
    }

    // checks if it is drawn
}

function clearCanvas() {
    //drawer.clearRect()
}

// rotate(degrees) -> for rotation