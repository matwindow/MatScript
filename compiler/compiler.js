let localvar = {};

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
    "\\rainbow\\": "animation: customRainbow 3s linear infinite;",
    "\\shake\\": "animation: customShake 0.1s linear infinite; display: inline-block;"
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
