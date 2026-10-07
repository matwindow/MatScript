let localvar = {};
let activeForeverLoop = null;
let lastKeyPressed = "";

window.addEventListener('keydown', (e) => {
    let keyName = e.key.toLowerCase();
    if (keyName === " ") keyName = "space";
    lastKeyPressed = keyName;
});

window.addEventListener('keyup', () => {
    lastKeyPressed = "";
});

const colorsformated = {
    "\\black\\": "color: #ffffff;",
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
    "\(\bold\\\)": "font-weight: bold;",
    "\\italic\\": "font-style: italic;",
    "\\shiny\\": "animation: customShine 1.5s linear infinite;",
    "\\rainbow\\": "background: linear-gradient(to right, #ff453a, #ff9f0a, #ffd60a, #30d158, #0a84ff, #bf5af2, #ff453a); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: customRainbow 3s linear infinite; width: max-content; display: block;",
    "\\decay\\": "animation: customShake 0.1s linear infinite; width: max-content; display: block;",
    "\\shake\\": "animation: customShake 0.1s linear infinite; width: max-content; display: block;"
};

function printToConsole(text) {
    const consoleBox = document.getElementById('console');
    if (!consoleBox) return;
    const lineElement = document.createElement('div');
    
    let cleanText = String(text);
    const tagNames = Object.keys(colorsformated).map(t => t.replace(/\\/g, '\\\\')).join('|');
    const regex = new RegExp(`(${tagNames})`, 'g');
    let parts = cleanText.split(regex);
    
    let finalHtml = "";
    let isSpanOpen = false;
    
    for (let part of parts) {
        if (colorsformated[part] !== undefined) {
            if (isSpanOpen) {
                finalHtml += "</span>";
                isSpanOpen = false;
            }
            finalHtml += `<span style="${colorsformated[part]}">`;
            isSpanOpen = true;
        } else {
            finalHtml += part;
        }
    }
    
    if (isSpanOpen) {
        finalHtml += "</span>";
    }
    
    lineElement.innerHTML = finalHtml;
    consoleBox.appendChild(lineElement);
    consoleBox.scrollTop = consoleBox.scrollHeight;
}

function evaluateExpression(expr, lineNum) {
    expr = expr.trim();
    if (expr.endsWith(".lenght")) {
        let baseExpr = expr.slice(0, -7).trim();
        let baseVal = evaluateExpression(baseExpr, lineNum);
        if (baseVal === null) return null;
        return String(baseVal).length;
    }
    if (expr.startsWith("window.key.press(") && expr.endsWith(")")) {
        let targetKey = expr.slice(17, -1).trim();
        if (targetKey.startsWith("'") && targetKey.endsWith("'")) {
            targetKey = targetKey.slice(1, -1);
        }
        return lastKeyPressed === targetKey.toLowerCase();
    }
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
        const consoleBox = document.getElementById('console');
        if (consoleBox) consoleBox.innerHTML = "";
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
        let eqIdx = cleanLine.indexOf("=");
        let varName = cleanLine.substring(0, eqIdx).replace("localvar.", "").trim();
        let expr = cleanLine.substring(eqIdx + 1).trim();
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
    if (cleanLine.startsWith("Say.error(")) {
        if (!cleanLine.endsWith(")")) {
            printToConsole("\\glow\\\\red\\Error In Line " + lineNum + "; Missing closing parenthesis.");
            return false;
        }
        let inner = cleanLine.slice(10, -1).trim();
        try {
            let validJson = inner.replace(/([a-zA-Z0-9_]+)\s*:/g, '"\$1":').replaceAll("'", '"');
            let errorObj = JSON.parse(validJson);
            printToConsole("\\glow\\\\red\\Error In Line " + lineNum + ";");
            printToConsole("\\glow\\\\red\\" + errorObj.error);
            if (errorObj.stop === true) return false;
            return true;
        } catch (e) {
            printToConsole("\\glow\\\\red\\Error In Line " + lineNum + "; Invalid Say.error object syntax.");
            return false;
        }
    }
    printToConsole("\\glow\\\\red\\Error In Line " + lineNum + "; Command layout not recognized.");
    return false;
}

function parseBlocks(lines) {
    let program = [];
    for (let i = 0; i < lines.length; i++) {
        let lineNum = i + 1;
        let cleanLine = lines[i].trim();
        if (cleanLine === "" || cleanLine.startsWith("@@")) continue;

        if (cleanLine.startsWith("forever")) {
            let blockLines = [];
            let j = i + 1;
            let braceCount = 1;
            while (j < lines.length) {
                let innerLine = lines[j].trim();
                if (innerLine.includes("{")) braceCount++;
                if (innerLine === "}") braceCount--;
                if (braceCount === 0) break;
                blockLines.push(lines[j]);
                j++;
            }
            program.push({ type: 'forever', body: blockLines, line: lineNum });
            i = j;
            continue;
        }

        if (cleanLine.startsWith("loop(")) {
            let closeParen = cleanLine.indexOf(")");
            let countExpr = cleanLine.slice(5, closeParen).trim();
            let blockLines = [];
            let j = i + 1;
            let braceCount = 1;
            while (j < lines.length) {
                let innerLine = lines[j].trim();
                if (innerLine.includes("{")) braceCount++;
                if (innerLine === "}") braceCount--;
                if (braceCount === 0) break;
                blockLines.push(lines[j]);
                j++;
            }
            program.push({ type: 'loop', countExpr: countExpr, body: blockLines, line: lineNum });
            i = j;
            continue;
        }

        if (cleanLine.startsWith("if(")) {
            let closeParen = cleanLine.indexOf(")");
            let condExpr = cleanLine.slice(3, closeParen).trim();
            let blockLines = [];
            let j = i + 1;
            let braceCount = 1;
            while (j < lines.length) {
                let innerLine = lines[j].trim();
                if (innerLine.includes("{")) braceCount++;
                if (innerLine === "}") braceCount--;
                if (braceCount === 0) break;
                blockLines.push(lines[j]);
                j++;
            }
            program.push({ type: 'if', condExpr: condExpr, body: blockLines, line: lineNum });
            i = j;
            continue;
        }

        program.push({ type: 'single', text: cleanLine, line: lineNum });
    }
    return program;
}

function executeBlockList(blocks) {
    for (let block of blocks) {
        if (block.type === 'single') {
            let success = executeLine(block.text, block.line);
            if (!success) return false;
        } else if (block.type === 'if') {
            let expr = block.condExpr;
            let match = expr.match(/(.+)(==|!=|<|>)(.+)/);
            if (match) {
                let left = evaluateExpression(match[1], block.line);
                let op = match[2].trim();
                let right = evaluateExpression(match[3], block.line);
                let conditionMet = false;
                
                if (op === "==") conditionMet = (left == right);
                else if (op === "!=") conditionMet = (left != right);
                else if (op === "<") conditionMet = (left < right);
                else if (op === ">") conditionMet = (left > right);
                
                if (conditionMet) {
                    let innerBlocks = parseBlocks(block.body);
                    let success = executeBlockList(innerBlocks);
                    if (!success) return false;
                }
            }
        } else if (block.type === 'loop') {
            let count = Number(evaluateExpression(block.countExpr, block.line));
            if (!isNaN(count)) {
                let innerBlocks = parseBlocks(block.body);
                for (let c = 0; c < count; c++) {
                    let success = executeBlockList(innerBlocks);
                    if (!success) return false;
                }
            }
        }
    }
    return true;
}

export function RUN(code) {
    if (activeForeverLoop) {
        clearInterval(activeForeverLoop);
        activeForeverLoop = null;
    }
    localvar = {};
    let lines = code.split('\n');
    let blocks = parseBlocks(lines);
    let hasForever = blocks.find(b => b.type === 'forever');
    if (hasForever) {
        let initialBlocks = blocks.filter(b => b.type !== 'forever');
        let success = executeBlockList(initialBlocks);
        if (!success) return;
        let innerForeverBlocks = parseBlocks(hasForever.body);
        let loopId = setInterval(() => {
            if (activeForeverLoop !== loopId) {
                clearInterval(loopId);
                return;
            }
            executeBlockList(innerForeverBlocks);
        }, 60);
        activeForeverLoop = loopId;
    } else {
        executeBlockList(blocks);
    }
}
