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
                blockLines.push(innerLine);
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
                blockLines.push(innerLine);
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
                blockLines.push(innerLine);
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
