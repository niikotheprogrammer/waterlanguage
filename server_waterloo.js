console.log("✅ Water runtime (Waterloo) loaded!");

// Store saved variables
let variables = {};

function runWaterCode(code) {
  let lines = code.split("\n").map(l => l.trim()).filter(l => l);

  lines.forEach(line => {
    // --- CALL ---
    if (line.startsWith("call")) {
      let msg = line.replace("call", "").trim();
      console.log(msg);

    // --- SAVE ---
    } else if (line.startsWith("save")) {
      // Format: save x = element myBtn  OR  save x = 123
      let parts = line.split("=");
      if (parts.length === 2) {
        let name = parts[0].replace("save", "").trim();
        let right = parts[1].trim();

        if (right.startsWith("element")) {
          let elId = right.replace("element", "").trim();
          variables[name] = document.getElementById(elId);
        } else {
          variables[name] = right;
        }
      }

    // --- BUTTON ACTION ---
    } else if (line.startsWith("button action")) {
      let match = line.match(/button action (\w+)/);
      if (match) {
        let elName = match[1];
        let blockCode = getBlockCode(lines, line);
        if (variables[elName]) {
          variables[elName].addEventListener("click", () => {
            runWaterCode(blockCode);
          });
        }
      }

    // --- INPUT ACTION ---
    } else if (line.startsWith("input action")) {
      let match = line.match(/input action (\w+)/);
      if (match) {
        let elName = match[1];
        let blockCode = getBlockCode(lines, line);
        if (variables[elName]) {
          variables[elName].addEventListener("input", () => {
            runWaterCode(blockCode);
          });
        }
      }

    // --- SET TEXT ---
    } else if (line.startsWith("setText")) {
      // Format: setText myVar = Hello
      let parts = line.split("=");
      if (parts.length === 2) {
        let name = parts[0].replace("setText", "").trim();
        let text = parts[1].trim().replace(/^"(.*)"$/, "$1"); // remove quotes
        if (variables[name]) {
          variables[name].innerText = text;
        }
      }

    // --- WAIT ---
    } else if (line.startsWith("wait")) {
      let ms = parseInt(line.replace("wait", "").trim());
      let start = Date.now();
      while (Date.now() - start < ms) {}
    
    // --- IF CONDITION THEN ---
    } else if (line.startsWith("if")) {
      // Example: if myInput == "hello" then ( call Hello World )
      let match = line.match(/if (.+?) then \((.+)\)/);
      if (match) {
        let condition = match[1].trim();
        let action = match[2].trim();

        try {
          let evalCondition = condition.replace(/\b\w+\b/g, m => {
            return variables[m] ? 
              (variables[m].value || variables[m].innerText || variables[m]) : `"${m}"`;
          });
          if (eval(evalCondition)) {
            runWaterCode(action);
          }
        } catch (err) {
          console.error("IF error:", err);
        }
      }

    // --- FADE IN {element} {duration} ---
    } else if (line.startsWith("fadeIn")) {
      let matches = [...line.matchAll(/\{(.+?)\}/g)];
      let name = matches[0] ? matches[0][1] : null;
      let duration = matches[1] ? parseInt(matches[1][1]) : 1000;

      if (variables[name]) {
        let el = variables[name];
        el.style.transition = `opacity ${duration}ms`;
        el.style.opacity = 0;
        setTimeout(() => {
          el.style.opacity = 1;
        }, 50);
      }

    // --- FADE OUT {element} {duration} ---
    } else if (line.startsWith("fadeOut")) {
      let matches = [...line.matchAll(/\{(.+?)\}/g)];
      let name = matches[0] ? matches[0][1] : null;
      let duration = matches[1] ? parseInt(matches[1][1]) : 1000;

      if (variables[name]) {
        let el = variables[name];
        el.style.transition = `opacity ${duration}ms`;
        el.style.opacity = 1;
        setTimeout(() => {
          el.style.opacity = 0;
        }, 50);
      }
    }
  });
}

// Helper to extract block {...}
function getBlockCode(lines, startLine) {
  let startIndex = lines.indexOf(startLine);
  let block = [];
  for (let i = startIndex + 1; i < lines.length; i++) {
    if (lines[i] === "}") break;
    block.push(lines[i]);
  }
  return block.join("\n");
}

// Run all <script type="water">
function runAllWaterScripts() {
  document.querySelectorAll('script[type="water"]').forEach(script => {
    runWaterCode(script.innerText);
  });
}

window.addEventListener("DOMContentLoaded", runAllWaterScripts);

