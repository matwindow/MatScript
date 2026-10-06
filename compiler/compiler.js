let localvar = {};

const colorsformated = {
    "\white\": "color: #ffffff;",
    "\red\": "color: #ff453a;",
    "\glow\": "text-shadow: 0 0 8px currentColor, 0 0 15px currentColor;",
    "\bold\": "font-weight: bold;",
    "\italic\": "font-style: italic;",
    "\shiny\": "background: linear-gradient(90deg, #ffffff, #e6edf3, #ffffff); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shine 2s linear infinite;"
};

function printToConsole(text) {
    const consoleBox = document.getElementById('console');
    const lineElement = document.createElement('div');
    
    let finalStyle = "";
    let cleanText = text;

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
}

export function RUN(code) {
    let lines = code.split('\n');
    let lineNum = 0;

    for (const line of lines) {
        lineNum++;
        let cleanLine = line.trim();

        if (cleanLine === "" || cleanLine.startsWith("@@")) {
            continue;
        }

        if (cleanLine.startsWith("Say(")) {
            if (!cleanLine.endsWith(")")) {
                printToConsole("\\glow\\\\red\\Error In Line " + lineNum + "; Missing closing parenthesis.");
                break;
            }
            
            let inner = cleanLine.slice(4, -1).trim();

            if (inner.startsWith("'") && inner.endsWith("'")) {
                let cleanText = inner.slice(1, -1);
                printToConsole(cleanText);
            } else {
                printToConsole("\\glow\\\\red\\Error In Line " + lineNum + "; " + inner + " is not known.");
                break;
            }
        } else {
            printToConsole("\\glow\\\\red\\Error In Line " + lineNum + "; Command layout not recognized.");
            break;
        }
    }
}
