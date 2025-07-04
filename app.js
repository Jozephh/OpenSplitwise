let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

const form = document.getElementById("expense-form");
const splitSelect = document.getElementById("split-mode");
const joeShareInput = document.getElementById("joe-share");
const customShareDiv = document.getElementById("custom-share");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const desc = document.getElementById("desc").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const mode = splitSelect.value;

  let payer, joeShare;

  if (mode === "joe-50") {
    payer = "Joe";
    joeShare = 0.5;
  } else if (mode === "caitlin-50") {
    payer = "Caitlin";
    joeShare = 0.5;
  } else if (mode === "joe-custom") {
    payer = "Joe";
    joeShare = parseFloat(joeShareInput.value);
  } else if (mode === "caitlin-custom") {
    payer = "Caitlin";
    joeShare = parseFloat(joeShareInput.value);
  } else if (mode === "joe-full") {
    payer = "Joe";
    joeShare = 1;
  } else if (mode === "caitlin-full") {
    payer = "Caitlin";
    joeShare = 0;
  }

  const expense = {
    desc,
    amount,
    payer,
    joeShare,
    date: new Date().toISOString()
  };

  expenses.push(expense);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  form.reset();
  customShareDiv.style.display = "none";
  render();
});

splitSelect.addEventListener("change", () => {
  const mode = splitSelect.value;
  customShareDiv.style.display = mode.includes("custom") ? "block" : "none";
});

function render() {
  const list = document.getElementById("expense-list");
  list.innerHTML = "";
  let joeTotal = 0, caitlinTotal = 0;

  expenses.forEach(e => {
    const li = document.createElement("li");
    li.textContent = `${e.date.split("T")[0]} - ${e.payer} paid £${e.amount.toFixed(2)} for ${e.desc}`;
    list.appendChild(li);

    const joeOwes = e.amount * e.joeShare;
    const caitlinOwes = e.amount * (1 - e.joeShare);

    if (e.payer === "Joe") {
      caitlinTotal += caitlinOwes;
    } else if (e.payer === "Caitlin") {
      joeTotal += joeOwes;
    }
  });

  const net = joeTotal - caitlinTotal;
  const output = document.getElementById("balance-output");
  if (net > 0) output.textContent = `Caitlin owes Joe £${net.toFixed(2)}`;
  else if (net < 0) output.textContent = `Joe owes Caitlin £${Math.abs(net).toFixed(2)}`;
  else output.textContent = `You’re even! 🎉`;
}

function settleUp() {
  expenses = [];
  localStorage.setItem("expenses", JSON.stringify([]));
  render();
}

function exportCSV() {
  let csv = "Date,Description,Amount,Payer,JoeShare\n";
  expenses.forEach(e => {
    csv += `${e.date},${e.desc},${e.amount},${e.payer},${e.joeShare}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = "budget.csv";
  link.click();
}

render();

// PWA support
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("Service Worker registered"));
}
