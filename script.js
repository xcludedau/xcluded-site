
/* XCLUDED - Instant Quote Calculator */

// Our standard retail prices
const tintPrices = {
    singleCab: 300,
    hatchback: 350,
    sedan: 400,
    dualCab: 400,
    suv: 450,
    large4wd: 500
};

// Additional charges
const tintRemovalPrice = 200;
const bookingDeposit = 50;

// Calculate an estimated quote
function calculateQuote(vehicleType, needsRemoval) {

    const tintPrice = tintPrices[vehicleType];

    if (tintPrice === undefined) {
        return null;
    }

    const removalCost = needsRemoval ? tintRemovalPrice : 0;

    const total = tintPrice + removalCost;

    return {
        tintPrice: tintPrice,
        removalCost: removalCost,
        total: total,
        deposit: bookingDeposit,
        remainingBalance: total - bookingDeposit
    };
}

/* Update the quote displayed on the website */

const vehicleSelect = document.getElementById("vehicleType");
const removalCheckbox = document.getElementById("tintRemoval");
const quoteTotal = document.getElementById("quoteTotal");
const quoteBreakdown = document.getElementById("quoteBreakdown");

function updateQuote() {

    const vehicleType = vehicleSelect.value;
    const needsRemoval = removalCheckbox.checked;

    const quote = calculateQuote(vehicleType, needsRemoval);

    if (quote === null) {
        quoteTotal.textContent = "Quote unavailable";
        quoteBreakdown.textContent = "";
        return;
    }

    quoteTotal.textContent = "$" + quote.total;

    quoteBreakdown.textContent =
        "Vehicle tinting: $" + quote.tintPrice +
        " | Removal: $" + quote.removalCost +
        " | $" + quote.deposit + " deposit credited towards total after confirmation";
}

// Update when a customer changes their selection
vehicleSelect.addEventListener("change", updateQuote);
removalCheckbox.addEventListener("change", updateQuote);

// Display the correct quote when the page loads
updateQuote();

// Pass the current estimate to the booking form in the same browser.
const quoteBookingLink = document.getElementById("quoteBookingLink");
if (quoteBookingLink) {
    quoteBookingLink.addEventListener("click", (event) => {
        const quote = calculateQuote(vehicleSelect.value, removalCheckbox.checked);
        const year = document.getElementById("vehicleYear").value.trim();
        const make = document.getElementById("vehicleMake").value.trim();
        const model = document.getElementById("vehicleModel").value.trim();
        const warning = document.getElementById("quoteValidation");
        warning.hidden = true;
        if (year && (!/^\d{4}$/.test(year) || Number(year) < 1950 || Number(year) > new Date().getFullYear() + 1)) {
            event.preventDefault();
            warning.textContent = "Please enter a valid vehicle year, or leave it blank if unsure.";
            warning.hidden = false;
            document.getElementById("vehicleYear").focus();
            return;
        }
        sessionStorage.setItem("xcludedQuoteDraft", JSON.stringify({
            vehicleType: vehicleSelect.value,
            vehicle: [year, make, model].filter(Boolean).join(" "),
            year: year,
            make: make,
            model: model,
            shade: document.getElementById("tintShade").value,
            removal: removalCheckbox.checked,
            quote: quote
        }));
        const params = new URLSearchParams({
            year, make, model,
            shade: document.getElementById("tintShade").value,
            vehicleType: vehicleSelect.value,
            removal: removalCheckbox.checked ? "Yes" : "No",
            estimate: String(quote.total)
        });
        quoteBookingLink.href = "booking.html?" + params.toString();
    });
}
