let localvar = {};
let activeForeverLoop = null;

const colorsformated = {
    "\\white\\": "color: #ffffff;",
    "\\red\\": "color: #ff453a;",
    "\\blue\\": "color: #0a84ff;",
    "\\green\\": "color: #30d158;",
    "\\yellow\\": "color: #ffd60a;",
    "\\purple\\": "color: #bf5af2;",
    "\\orange\\": "color: #ff9f0a;",
    "\\pink\\": "color: #ff375f;",
    "\\cyan\\": "color: #64d2ff;",
    "\\gray\\": "color: #8e8e93;",
    "\\darkred\\": "color: #8b0000;",
    "\\darkblue\\": "color: #00008b;",
    "\\darkgreen\\": "color: #006400;",
    "\\gold\\": "color: #ffd700;",
    "\\silver\\": "color: #c0c0c0;",
    "\\magenta\\": "color: #ff00ff;",
    "\\lime\\": "color: #00ff00;",
    "\\teal\\": "color: #008080;",
    "\\brown\\": "color: #a52a2a;",
    "\\navy\\": "color: #000080;",
    "\\olive\\": "color: #808000;",
    "\\maroon\\": "color: #800000;",
    "\\aquamarine\\": "color: #7fffd4;",
    "\\coral\\": "color: #ff7f50;",
    "\\crimson\\": "color: #dc143c;",
    "\\fuchsia\\": "color: #ff00ff;",
    "\\indigo\\": "color: #4b0082;",
    "\\khaki\\": "color: #f0e68c;",
    "\\lavender\\": "color: #e6e6fa;",
    "\\plum\\": "color: #dda0dd;",
    "\\salmon\\": "color: #fa8072;",
    "\\violet\\": "color: #ee82ee;",
    "\\glow\\": "text-shadow: 0 0 8px currentColor, 0 0 15px currentColor;",
    "\\bold\\": "font-weight: bold;",
    "\\italic\\": "font-style: italic;",
    "\\shiny\\": "animation: customShine 1.5s linear infinite;",
    "\\rainbow\\": "background: linear-gradient(to right, #ff453a, #ff9f0a, #ffd60a, #30d158, #0a84ff, #bf5af2, #ff453a); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: customRainbow 3s linear infinite; width: max-content; display: block;",
    "\\shake\\": "animation: customShake 0.1s linear infinite; width: max-content; display: block;"
};

function printToConsole(text) {
    const consoleBox = document.getElementById('console');
    const lineElement = document.createElement('div');
    
    let finalStyle = "";
    let cleanText = String(text);

    for (const [tag, styleValue] of Object.entries(colorsformated)) {
        if (cleanText.includes(tag)) {
            finalStyle += styleValue + " ";
            cleanText = cleanText.replaceAll(tag, "");
        }
    }

    if (finalStyle !== "") {
        lineElement.style.cssText = finalStyle;
    }
    
    lineElement.innerText = cleanText;
    consoleBox.appendChild(lineElement);
    consoleBox.scrollTop = consoleBox.scrollHeight;
}

function evaluateExpression(expr, lineNum) {
    expr = expr.trim();

    if (expr.includes('+')) {
        let parts = expr.split('+');
        let allNumbers = true;
        let evaluatedParts = [];

        for (let part of parts) {
            let val = evaluateExpression(part, lineNum);
            if (val === null) return null;
            if (typeof val !== 'number') allNumbers = false;
            evaluatedParts.push(val);
        }

        if (allNumbers) {
            return evaluatedParts.reduce((a, b) => a + b, 0);
        } else {
            return evaluatedParts.map(String).join('');
        }
    }

    if (expr.startsWith("'") && expr.endsWith("'")) {
        return expr.slice(1, -1);
    }

    if (!isNaN(expr) && expr !== "") {
        return Number(expr);
    }

    let varName = expr;
    if (expr.startsWith("localvar.")) {
        varName = expr.replace("localvar.", "");
    }

    if (localvar.hasOwnProperty(varName)) {
        return localvar[varName];
    }

    printToConsole("\\glow\\\\red\\Error In Line " + lineNum + ";");
    printToConsole("\\glow\\\\red\\" + expr + " is not known.");
    return null;
}

function executeLine(cleanLine, lineNum) {
    if (cleanLine === "" || cleanLine.startsWith("@@")) {
        return true;
    }

    if (cleanLine === "Say.clear()") {
        document.getElementById('console').innerHTML = "";
        return true;
    }

    if (cleanLine.startsWith("locdef ")) {
        let content = cleanLine.slice(7).trim();
        let firstSpace = content.indexOf(' ');
        if (firstSpace === -1) {
            printToConsole("\\glow\\\\red\\Error In Line " + lineNum + "; Invalid locdef syntax.");
            return false;
        }
        let varName = content.substring(0, firstSpace).trim();
        let varValueExpr = content.substring(firstSpace + 1).trim();

        let value = evaluateExpression(varValueExpr, lineNum);
        if (value === null) return false;

        localvar[varName] = value;
        return true;
    }

    if (cleanLine.startsWith("localvar.") && cleanLine.includes("=")) {
        let parts = cleanLine.split("=");
        let varName = parts[0].replace("localvar.", "").trim();
        let expr = parts[1].trim();

        let value = evaluateExpression(expr, lineNum);
        if (value === null) return false;

        localvar[varName] = value;
        return true;
    }

    if (cleanLine.startsWith("Say(")) {
        if (!cleanLine.endsWith(")")) {
            printToConsole("\\glow\\\\red\\Error In Line " + lineNum + "; Missing closing parenthesis.");
            return false;
        }
        let inner = cleanLine.slice(4, -1).trim();
        let result = evaluateExpression(inner, lineNum);
        if (result === null) return false;
        printToConsole(result);
        return true;
    }

    printToConsole("\\glow\\\\red\\Error In Line " + lineNum + "; Command layout not recognized.");
    return false;
}

export function RUN(code) {
    if (activeForeverLoop) {
        clearInterval(activeForeverLoop);
        activeForeverLoop = null;
    }

    localvar = {};
    let lines = code.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        let lineNum = i + 1;
        let cleanLine = lines[i].trim();

        if (cleanLine === "" || cleanLine.startsWith("@@")) {
            continue;
        }

        if (cleanLine.startsWith("forever{")) {
            let loopLines = [];
            let j = i + 1;
            while (j < lines.length && lines[j].trim() !== "}") {
                loopLines.push(lines[j]);
                j++;
            }

            if (j >= lines.length) {
                printToConsole("\\glow\\\\red\\Error In Line " + lineNum + "; Missing closing brace '}' for forever loop.");
                break;
            }

            let loopId = setInterval(() => {
                if (activeForeverLoop !== loopId) {
                    clearInterval(loopId);
                    return;
                }
                
                for (let k = 0; k < loopLines.length; k++) {
                    let success = executeLine(loopLines[k].trim(), i + 2 + k);
                    if (!success) {
                        clearInterval(loopId);
                        break;
                    }
                }
            }, 60);

            activeForeverLoop = loopId;
            break;
        }

        let success = executeLine(cleanLine, lineNum);
        if (!success) break;
    }
}
