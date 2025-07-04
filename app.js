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

  let joePaid = 0, caitlinPaid = 0;
  let joeShouldPay = 0;

  expenses.forEach(e => {
    const li = document.createElement("li");
    li.textContent = `${e.date.split("T")[0]} – ${e.payer} paid £${e.amount.toFixed(2)} for ${e.desc}`;
    list.appendChild(li);

    if (e.payer === "Joe") joePaid += e.amount;
    if (e.payer === "Caitlin") caitlinPaid += e.amount;

    joeShouldPay += e.amount * e.joeShare;
  });

  const joeBalance = joePaid - joeShouldPay;
  const output = document.getElementById("balance-output");
  const tolerance = 0.01;

  if (Math.abs(joeBalance) < tolerance) {
    output.textContent = `You’re even! 🎉`;
  } else if (joeBalance > 0) {
    output.textContent = `Caitlin owes Joe £${joeBalance.toFixed(2)}`;
  } else {
    output.textContent = `Joe owes Caitlin £${Math.abs(joeBalance).toFixed(2)}`;
  }
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

// Optional: PWA support
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("Service Worker registered"));
}
