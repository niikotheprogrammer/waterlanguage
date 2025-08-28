console.log("✅ Waterloo runtime loaded!");

// ---------------- Helper to run Water code from text ----------------
function runWaterScriptText(code) {
  const fakeScriptEl = { textContent: code };
  runWaterScript(fakeScriptEl);
}
// ----------------------------------------------------------------------

// ---------------- Main Water runtime ----------------
function runWaterScript(scriptEl) {
  const code = scriptEl.textContent || "";
  const lines = code.split("\n").map(l => l.trim()).filter(l => l);

  const elements = {};

  lines.forEach(line => {
    if (line.startsWith("call ")) {
      console.log(line.replace("call ", ""));
    } else if (line.startsWith("save ")) {
      const [, name, , elId] = line.split(" ");
      elements[name] = document.getElementById(elId);
    } else if (line.startsWith("button action ")) {
      const btnName = line.split(" ")[2];
      const btn = elements[btnName];
      const start = code.indexOf("{", code.indexOf(line)) + 1;
      const end = code.indexOf("}", start);
      const inner = code.substring(start, end).trim();

      if (btn) {
        btn.addEventListener("click", () => {
          inner.split("\n").forEach(cmd => processCommand(cmd, elements));
        });
      }
    } else if (line.startsWith("input action ")) {
      const inputName = line.split(" ")[2];
      const inputEl = elements[inputName];
      const start = code.indexOf("{", code.indexOf(line)) + 1;
      const end = code.indexOf("}", start);
      const inner = code.substring(start, end).trim();

      if (inputEl) {
        inputEl.addEventListener("input", () => {
          inner.split("\n").forEach(cmd => processCommand(cmd, elements, inputEl));
        });
      }
    }
  });

  function processCommand(cmd, elements, inputEl) {
    cmd = cmd.trim();
    if (cmd.startsWith("call ")) console.log(cmd.replace("call ", ""));
    else if (cmd.startsWith("setText ")) {
      const [_, el, __, ...rest] = cmd.split(" ");
      const text = rest.join(" ");
      if (elements[el]) elements[el].innerText = text.replace(/"/g, "");
    } else if (cmd.startsWith("fadeOut ")) {
      const m = cmd.match(/\{(.*)\} \{(.*)\}/);
      if (m) fadeOut(elements[m[1]], parseInt(m[2]));
    } else if (cmd.startsWith("fadeIn ")) {
      const m = cmd.match(/\{(.*)\} \{(.*)\}/);
      if (m) fadeIn(elements[m[1]], parseInt(m[2]));
    } else if (cmd.startsWith("wait ")) {
      const m = cmd.match(/wait (\d+)/);
      if (m) {
        const ms = parseInt(m[1]);
        setTimeout(() => {}, ms); // non-blocking
      }
    } else if (cmd.startsWith("if ")) {
      const m = cmd.match(/if (.*) == "(.*)" then \((.*)\)/);
      if (m && inputEl && inputEl.value === m[2]) {
        processCommand(m[3].trim(), elements, inputEl);
      }
    }
  }

  function fadeOut(el, duration) {
    if (!el) return;
    el.style.transition = `opacity ${duration}ms`;
    el.style.opacity = 0;
  }

  function fadeIn(el, duration) {
    if (!el) return;
    el.style.transition = `opacity ${duration}ms`;
    el.style.opacity = 1;
  }
}

// ---------------- Run Water after DOM is ready ----------------
window.addEventListener("DOMContentLoaded", () => {
  fetch('app.water')
    .then(r => r.text())
    .then(code => runWaterScriptText(code))
    .catch(err => console.error("Failed to load Water file:", err));
});