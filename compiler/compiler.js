function RUN(code){
let lines=code.split('\n')
  let lineNum=0
  for (const line of lines){
    lineNum++
    if (line.startsWith("Say(")) {
    if (!line.endsWith(")")) {
        printToConsole("\\glow\\\\red\\Error In Line " + lineNum + ";\n\\glow\\\\red\\Missing closing parenthesis.");
        break;
    }
    
    let inner = line.slice(4, -1).trim();

    if (inner.startsWith("'") && inner.endsWith("'")) {
        let cleanText = inner.slice(1, -1);
        printToConsole(cleanText);
    } else {
        printToConsole("\\glow\\\\red\\Error In Line " + lineNum + ";\n\\glow\\\\red\\" + inner + " is not known.");
        break;
    }
}
  }
}
