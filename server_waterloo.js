console.log("✅ Waterloo runtime loaded!");

// Run all <script type="water">
function runAllWaterScripts() {
  const scripts = document.querySelectorAll('script[type="water"]');
  scripts.forEach(script => {
    if (script.src) {
      fetch(script.src)
        .then(res => res.text())
        .then(code => runWaterCode(code))
        .catch(err => console.error("Error loading Water file:", err));
    } else {
      runWaterCode(script.textContent);
    }
  });
}

// Main Water interpreter
function runWaterCode(code) {
  const lines = code.split("\n");
  let i = 0;

  while (i < lines.length) {
    let line = lines[i].trim();
    if (!line) { i++; continue; }

    // ---- call ----
    if (line.startsWith("call ")) {
      console.log(line.replace("call ", "").replace(/"/g, ""));
      i++;
      continue;
    }

    // ---- button action ----
    if (line.startsWith("button action")) {
      // Match: button action {myBTN} {
      const match = line.match(/button action\s*\{([^}]*)\}\s*\{/);
      if (match) {
        const buttonId = match[1].trim();

        // Collect the block inside braces
        let blockLines = [];
        i++; // move to next line
        let openBraces = 1;

        while (i < lines.length && openBraces > 0) {
          const currentLine = lines[i];
          if (currentLine.includes("{")) openBraces++;
          if (currentLine.includes("}")) openBraces--;

          if (openBraces > 0) blockLines.push(currentLine);
          i++;
        }

        // Attach click handler
        const btn = document.getElementById(buttonId);
        if (btn) {
          btn.addEventListener("click", () => {
            runWaterCode(blockLines.join("\n")); // only run on click
          });
        }

        continue; // skip to next line after block
      }
    }

    i++;
  }
}

document.addEventListener("DOMContentLoaded", runAllWaterScripts);
