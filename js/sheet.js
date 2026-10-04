/* RegSheet — fills a static template with the strings you type.
   No network calls. No model. Empty answers stay empty and print as
   "you still need this". Dates below are copied from the sources in SOURCES.md. */

(function () {
  "use strict";

  /* Draft SI, regulation 1(3): date the remaining regulations come into force
     for entries in that region. NRLA table: "Deadline to register (by midnight)".
     The midnight dates are the NRLA's, not a column in the draft instrument. */
  var REGIONS = [
    { id: "wm", name: "West Midlands", inForce: "15 December 2026", nrlaDeadline: "14 March 2027" },
    { id: "eoe", name: "East of England", inForce: "15 January 2027", nrlaDeadline: "14 April 2027" },
    { id: "em", name: "East Midlands", inForce: "15 February 2027", nrlaDeadline: "14 May 2027" },
    { id: "se", name: "South East", inForce: "15 March 2027", nrlaDeadline: "14 June 2027" },
    { id: "yh", name: "Yorkshire and Humber", inForce: "15 April 2027", nrlaDeadline: "14 July 2027" },
    { id: "nw", name: "North West", inForce: "15 May 2027", nrlaDeadline: "14 August 2027" },
    { id: "ne", name: "North East", inForce: "15 June 2027", nrlaDeadline: "14 September 2027" },
    { id: "lon", name: "London", inForce: "15 July 2027", nrlaDeadline: "14 October 2027" },
    { id: "sw", name: "South West", inForce: "15 August 2027", nrlaDeadline: "14 November 2027" }
  ];

  var NEED = "you still need this";

  var form = document.getElementById("sheet-form");
  if (!form) return;
  form.addEventListener("submit", function (e) { e.preventDefault(); });

  var regionSelect = document.getElementById("region");
  var countSelect = document.getElementById("property-count");
  var landlordKind = form.querySelectorAll('input[name="landlord-kind"]');
  var trustBox = document.getElementById("is-trust");
  var capacity = document.getElementById("capacity");
  var regionNote = document.getElementById("region-note");
  var priceNote = document.getElementById("price-note");
  var printRoot = document.getElementById("print-sheet");
  var live = document.getElementById("live-region");

  function regionById(id) {
    for (var i = 0; i < REGIONS.length; i++) {
      if (REGIONS[i].id === id) return REGIONS[i];
    }
    return null;
  }

  function val(el) {
    if (!el) return "";
    return String(el.value || "").trim();
  }

  function selectedText(select) {
    if (!select || select.selectedIndex < 0) return "";
    var opt = select.options[select.selectedIndex];
    if (!opt || !opt.value) return "";
    return opt.text.trim();
  }

  function radioValue(name, scope) {
    var root = scope || form;
    var node = root.querySelector('input[name="' + name + '"]:checked');
    return node ? node.value : "";
  }

  function radioLabel(name, scope) {
    var root = scope || form;
    var node = root.querySelector('input[name="' + name + '"]:checked');
    if (!node) return "";
    var label = node.closest("label");
    return label ? label.textContent.replace(/\s+/g, " ").trim() : node.value;
  }

  function show(el, on) {
    if (!el) return;
    el.classList.toggle("hidden", !on);
  }

  function updateRegionNote() {
    var r = regionById(regionSelect.value);
    if (!r) {
      regionNote.textContent = "Choose the region the property is in. The draft regulations time the rules by the dwelling’s region, not by where you live.";
      return;
    }
    regionNote.textContent = r.name + ": the draft regulations come into force for entries there on " + r.inForce + ". The NRLA says the deadline to register is midnight on " + r.nrlaDeadline + ". That midnight date is the NRLA’s table, not a date printed in the draft instrument.";
  }

  function updatePriceNote() {
    var n = parseInt(countSelect.value, 10) || 1;
    if (n <= 1) {
      priceNote.textContent = "One property is the £29 sheet. Checkout is not connected. Nothing is charged on this page.";
    } else {
      priceNote.textContent = "Two to five properties is the £49 sheet. Checkout is not connected. Nothing is charged on this page.";
    }
  }

  function updateLandlordKind() {
    var kind = radioValue("landlord-kind");
    show(document.getElementById("individual-fields"), kind === "individual");
    show(document.getElementById("organisation-fields"), kind === "organisation");
    updateTrust();
  }

  function updateTrust() {
    var org = radioValue("landlord-kind") === "organisation";
    show(document.getElementById("trust-fields"), org && trustBox.checked);
  }

  function updateCapacity() {
    var third = capacity.value && capacity.value !== "self";
    show(document.getElementById("third-party-fields"), third);
  }

  function updateCount() {
    var n = parseInt(countSelect.value, 10) || 1;
    var blocks = form.querySelectorAll(".dwelling");
    for (var i = 0; i < blocks.length; i++) {
      show(blocks[i], i < n);
    }
    updatePriceNote();
  }

  function bindDwelling(block) {
    var gas = block.querySelector(".gas-supply");
    var epcRequired = block.querySelector(".epc-required");
    var epcValid = block.querySelector(".epc-valid");
    var below = block.querySelector(".below-min");
    var hmo = block.querySelectorAll(".licence-need");

    var elec = block.querySelector(".elec-route");
    var rentUtils = block.querySelector(".rent-utils");

    function refresh() {
      show(block.querySelector(".gas-extra"), gas.value === "yes");
      show(block.querySelector(".epc-extra"), epcRequired.value === "yes");
      show(block.querySelector(".epc-invalid-extra"), epcValid.value === "no");
      show(block.querySelector(".mees-extra"), below.value === "yes");
      var pairs = [".lic-hmo", ".lic-add", ".lic-sel"];
      for (var i = 0; i < pairs.length; i++) {
        var sel = block.querySelector(pairs[i]);
        var wrap = sel ? sel.parentElement.nextElementSibling : null;
        if (wrap && wrap.classList.contains("licence-block")) {
          show(wrap.querySelector(".licence-number-wrap"), sel.value === "yes");
        }
      }
      var route = elec.value;
      show(block.querySelector(".eicr-expiry").closest("label"), route === "eicr");
      show(block.querySelector(".eic-date").closest("label"), route === "eic");
      show(block.querySelector(".which-utils").closest("label"), rentUtils.value === "yes");
    }

    gas.addEventListener("change", refresh);
    epcRequired.addEventListener("change", refresh);
    epcValid.addEventListener("change", refresh);
    below.addEventListener("change", refresh);
    elec.addEventListener("change", refresh);
    rentUtils.addEventListener("change", refresh);
    for (var i = 0; i < hmo.length; i++) hmo[i].addEventListener("change", refresh);
    refresh();

    var sameAddr = block.querySelector(".same-address");
    var sameEmail = block.querySelector(".same-email");
    var sameName = block.querySelector(".same-name");
    if (sameName) {
      sameName.addEventListener("click", function () {
        block.querySelector(".dwell-ll-name").value = landlordName();
      });
    }
    if (sameAddr) {
      sameAddr.addEventListener("click", function () {
        block.querySelector(".dwell-corr").value = landlordAddress();
      });
    }
    if (sameEmail) {
      sameEmail.addEventListener("click", function () {
        block.querySelector(".dwell-email").value = landlordEmail();
      });
    }
  }

  function landlordName() {
    if (radioValue("landlord-kind") === "organisation") return val(document.getElementById("org-name"));
    return val(document.getElementById("ind-name"));
  }

  function landlordAddress() {
    if (radioValue("landlord-kind") === "organisation") return val(document.getElementById("org-address"));
    return val(document.getElementById("ind-address"));
  }

  function landlordEmail() {
    if (radioValue("landlord-kind") === "organisation") return val(document.getElementById("org-email"));
    return val(document.getElementById("ind-email"));
  }

  function line(label, value, opts) {
    opts = opts || {};
    var empty = !value;
    var showNeed = empty && !opts.optional;
    var vClass = showNeed ? "v need" : "v";
    var shown = showNeed ? NEED : (value || "—");
    return '<div class="row"><div class="k">' + escapeHtml(label) + '</div><div class="' + vClass + '">' + escapeHtml(shown) + "</div></div>";
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function yesNoLabel(select) {
    if (!select || !select.value) return "";
    if (select.value === "yes") return "Yes";
    if (select.value === "no") return "No";
    return selectedText(select);
  }

  function buildLandlord() {
    var html = "<h2>Landlord entry</h2>";
    var kind = radioValue("landlord-kind");
    html += line("Who the landlord entry is for", kind === "individual" ? "An individual" : kind === "organisation" ? "Not an individual (organisation or other body)" : "");

    if (kind === "individual") {
      html += line("Name", val(document.getElementById("ind-name")));
      html += line("Date of birth", val(document.getElementById("ind-dob")));
      html += line("Residential address", val(document.getElementById("ind-address")));
      html += line("Telephone number", val(document.getElementById("ind-phone")));
      html += line("Email address", val(document.getElementById("ind-email")));
    } else if (kind === "organisation") {
      html += line("Name of organisation, or description by which it is known", val(document.getElementById("org-name")));
      html += line("Type of legal entity", val(document.getElementById("org-entity")));
      html += line("Address (not a PO Box)", val(document.getElementById("org-address")));
      html += line("Telephone number", val(document.getElementById("org-phone")));
      html += line("Email address", val(document.getElementById("org-email")));
      html += line("Name of the individual making the entry", val(document.getElementById("maker-name")));
      html += line("Date of birth of the individual making the entry", val(document.getElementById("maker-dob")));
      html += line("Email address of the individual making the entry", val(document.getElementById("maker-email")));
      html += line("Telephone number of the individual making the entry", val(document.getElementById("maker-phone")));
      html += line("Nominated contact name", val(document.getElementById("nom-name")));
      html += line("Nominated contact email address", val(document.getElementById("nom-email")));
      html += line("Nominated contact telephone number", val(document.getElementById("nom-phone")));
      var ch = val(document.getElementById("ch-number"));
      html += line("Companies House registration number, if applicable", ch, { optional: true });
      html += line("Charity number, if applicable", val(document.getElementById("charity-number")), { optional: true });
      if (!ch) {
        html += line("Names, dates of birth and addresses of all directors, trustees, partners or members of the governing body (required by the draft regulations where no Companies House number is given)", val(document.getElementById("governors")));
      } else {
        html += line("Governing body details", "Not printed. A Companies House number was given, and the draft regulations ask for those details where a Companies House number is not provided.", { optional: true });
      }
      if (trustBox.checked) {
        html += line("Lead trustee name", val(document.getElementById("trust-name")));
        html += line("Lead trustee date of birth", val(document.getElementById("trust-dob")));
        html += line("Lead trustee address", val(document.getElementById("trust-address")));
        html += line("Lead trustee email address", val(document.getElementById("trust-email")));
        html += line("Lead trustee telephone number", val(document.getElementById("trust-phone")));
      } else {
        html += line("Lead trustee", "Not printed. You did not mark this organisation as a trust. The draft regulations ask for a lead trustee where the organisation is constituted as a trust.", { optional: true });
      }
    }

    var cap = capacity.value;
    html += line("Capacity of the person making the entry", cap ? selectedText(capacity) : "");
    if (cap && cap !== "self") {
      html += line("Name of the person making the entry in that capacity", val(document.getElementById("tp-name")));
      html += line("Address of the person making the entry in that capacity", val(document.getElementById("tp-address")));
      html += line("Telephone number of the person making the entry in that capacity", val(document.getElementById("tp-phone")));
      html += line("Email address of the person making the entry in that capacity", val(document.getElementById("tp-email")));
      html += line("Authority document (type and date). The draft regulations ask for a certified or sealed copy. This sheet does not store the copy.", val(document.getElementById("tp-doc")));
    } else if (cap === "self") {
      html += line("Third-party authority", "Not used. You marked this entry as made by the landlord, not by one of the other capacities in Schedule 2.", { optional: true });
    }
    return html;
  }

  function buildDwelling(block, index) {
    var html = "<h2>Dwelling entry " + index + "</h2>";
    html += line("Address of dwelling", val(block.querySelector(".dwell-address")));
    html += line("Name of the person who is, or intends to become, the residential landlord", val(block.querySelector(".dwell-ll-name")));
    html += line("Correspondence address in England and Wales (not a PO Box)", val(block.querySelector(".dwell-corr")));
    html += line("Email address for that person in relation to the dwelling", val(block.querySelector(".dwell-email")));
    html += line("Ownership type", val(block.querySelector(".ownership")));

    var dtype = block.querySelector(".dwell-type").value;
    var dtypeText = dtype === "other" ? val(block.querySelector(".dwell-type-other")) : selectedText(block.querySelector(".dwell-type"));
    html += line("Dwelling type", dtypeText);
    html += line("Number of bedrooms", val(block.querySelector(".bedrooms")));
    html += line("Whether the dwelling is currently under let", yesNoLabel(block.querySelector(".under-let")));

    html += line("Owner of the freehold: name (write “none” if there is no such person to name)", val(block.querySelector(".fh-name")));
    html += line("Owner of the freehold: email address (write “none” if none)", val(block.querySelector(".fh-email")));
    html += line("Any other superior landlord: name (write “none” if none)", val(block.querySelector(".sup-name")));
    html += line("Any other superior landlord: email address (write “none” if none)", val(block.querySelector(".sup-email")));
    html += line("Property manager: name (write “none” if none)", val(block.querySelector(".pm-name")));
    html += line("Property manager: email address (write “none” if none)", val(block.querySelector(".pm-email")));

    html += "<h2>Tenancy, rent, and safety — dwelling " + index + "</h2>";
    html += '<p class="small">Draft regulation 6(2): for a dwelling which is let, this Part 2 information must be provided before the end of 28 days beginning with the date the dwelling entry is made. A letting agent or property manager may provide Part 2 on the landlord’s behalf (regulation 4(5)). They are not listed as someone who may make the entry itself (regulation 4(2)).</p>';

    html += line("Number of occupants", val(block.querySelector(".occupants")));
    html += line("Number of households", val(block.querySelector(".households")));

    html += licenceLine(block, ".lic-hmo", ".lic-hmo-no", "HMO licence (Housing Act 2004, section 55)");
    html += licenceLine(block, ".lic-add", ".lic-add-no", "Additional licence (Housing Act 2004, section 56)");
    html += licenceLine(block, ".lic-sel", ".lic-sel-no", "Selective licence (Housing Act 2004, section 80)");

    var gas = block.querySelector(".gas-supply").value;
    html += line("Does the dwelling have a gas supply?", yesNoLabel(block.querySelector(".gas-supply")));
    if (gas === "yes") {
      html += line("Gas safety record issue date", val(block.querySelector(".gas-date")));
      html += line("Copy of the gas safety record, if one exists", "Not stored on this sheet. The draft regulations ask for a copy. You would give that on the government service, not here.", { optional: true });
    } else if (gas === "no") {
      html += line("Gas safety record", "Not asked above, because you answered that there is no gas supply. The draft regulations ask for the record only if the dwelling has a gas supply.", { optional: true });
    }

    var route = block.querySelector(".elec-route").value;
    html += line("Electrical safety document you will rely on", route ? selectedText(block.querySelector(".elec-route")) : "");
    if (route === "eicr") {
      html += line("EICR expiry date (the date by which the next inspection and test must be carried out)", val(block.querySelector(".eicr-expiry")));
      html += line("Copy of the EICR, if one exists", "Not stored on this sheet. The draft regulations ask for a copy.", { optional: true });
    } else if (route === "eic") {
      html += line("EIC issue date", val(block.querySelector(".eic-date")));
      html += line("Copy of the appropriate EIC", "Not stored on this sheet. The draft regulations ask for a copy.", { optional: true });
    }

    var epcReq = block.querySelector(".epc-required").value;
    html += line("Was the landlord required to give a valid EPC to the tenant currently occupying the dwelling?", yesNoLabel(block.querySelector(".epc-required")));
    if (epcReq === "yes") {
      html += line("Copy of the most recent EPC, if one exists", "Not stored on this sheet. The draft regulations ask for a copy where the landlord was required to give a valid EPC.", { optional: true });
    }
    var epcValid = block.querySelector(".epc-valid").value;
    html += line("Is the most recent EPC still valid?", yesNoLabel(block.querySelector(".epc-valid")));
    if (epcValid === "no") {
      html += line("Date the current tenancy started (asked where the most recent EPC is no longer valid)", val(block.querySelector(".tenancy-start")));
    }
    var below = block.querySelector(".below-min").value;
    html += line("Does the most recent EPC give a rating below the minimum level of energy efficiency?", yesNoLabel(block.querySelector(".below-min")));
    if (below === "yes") {
      html += line("Has the dwelling a registered MEES exemption?", yesNoLabel(block.querySelector(".mees-reg")));
      if (block.querySelector(".mees-reg").value === "yes") {
        html += line("What types of exemption apply?", val(block.querySelector(".mees-types")));
      } else if (block.querySelector(".mees-reg").value === "no") {
        html += line("Types of exemption", "Not printed. You answered that there is no registered MEES exemption.", { optional: true });
      }
    }

    html += line("Rent charged", val(block.querySelector(".rent-amount")));
    html += line("Frequency of payment", val(block.querySelector(".rent-frequency")));
    html += line("Is the rent inclusive of utilities?", yesNoLabel(block.querySelector(".rent-utils")));
    if (block.querySelector(".rent-utils").value === "yes") {
      html += line("Which utilities are included?", val(block.querySelector(".which-utils")));
    } else if (block.querySelector(".rent-utils").value === "no") {
      html += line("Utilities included", "None. You answered that the rent is not inclusive of utilities.", { optional: true });
    }

    var furn = block.querySelector(".furnished").value;
    html += line("Whether the dwelling is let furnished, partly furnished or unfurnished", furn ? selectedText(block.querySelector(".furnished")) : "");
    return html;
  }

  function licenceLine(block, selClass, numClass, label) {
    var sel = block.querySelector(selClass);
    var answer = yesNoLabel(sel);
    var html = line("Requires " + label + "?", answer);
    if (sel.value === "yes") {
      var num = val(block.querySelector(numClass));
      html += line(label + " number, if available", num || "Not entered. The draft regulations ask for the number only if it is available.", { optional: true });
    }
    return html;
  }

  function build() {
    var r = regionById(regionSelect.value);
    var n = parseInt(countSelect.value, 10) || 1;
    var when = new Date();
    var printed = when.toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" });

    var html = "";
    html += "<h1>RegSheet</h1>";
    html += "<p>A personal copy of fields for the “Register your rental property” service. Filled in by you on " + escapeHtml(printed) + ". Sources checked 4 October 2026.</p>";
    html += "<p><strong>Not legal advice.</strong> This sheet does not say you are compliant, exempt, licensable, or safe from a penalty. It is not sent anywhere. You copy what you choose onto the government service yourself. RegSheet is not affiliated with GOV.UK, the NRLA, or any tenancy deposit scheme.</p>";

    html += "<h2>Region and how many dwellings are on this sheet</h2>";
    html += line("Region of the property or properties (helper — not a numbered field in Schedules 2 or 3)", r ? r.name : "");
    if (r) {
      html += line("Draft regulations come into force for entries in this region", r.inForce, { optional: true });
      html += line("NRLA deadline to register, by midnight", r.nrlaDeadline, { optional: true });
    }
    html += line("Number of dwelling entries on this sheet", String(n), { optional: true });
    html += '<p class="small">The £65 a year per property figure is what the NRLA and LandlordZONE report. You would pay that on the government service, not to RegSheet. The draft regulations say the database operator sets the fee and do not print £65. The NRLA says registration opens on 15 December 2026 and that a property can be registered from then even if that region’s rules are not in force yet. LandlordZONE also says landlords can register before they are required to. The draft instrument’s regulation 1 brings regulation 1 and regulation 3 into force on 15 December 2026, and the rest by region.</p>';

    html += buildLandlord();

    var blocks = form.querySelectorAll(".dwelling");
    for (var i = 0; i < n; i++) {
      html += buildDwelling(blocks[i], i + 1);
    }

    html += "<h2>What this sheet does not do</h2>";
    html += "<ul>";
    html += "<li>It does not register you, pay a fee, or submit an entry.</li>";
    html += "<li>It does not store copies of a gas safety record, an EICR, an EIC, an EPC, or an authority document. The draft regulations ask for those copies. You keep them and give them on the government service if you register.</li>";
    html += "<li>It does not decide whether a property must be registered, whether a licence is required, or whether an EPC meets the minimum level.</li>";
    html += "<li>An agent is not, on the draft regulations, a person who may make the landlord or dwelling entry, except in the limited capacities listed. Your agent cannot press submit for you. Regulation 4(5) does allow a letting agent or property manager to provide the Part 2 information.</li>";
    html += "</ul>";
    html += '<p class="small">Field list taken from Schedule 2 and Schedule 3 of the draft Private Rented Sector Database Regulations 2026, as published on legislation.gov.uk (still marked draft, not yet made). Regional midnight deadlines from the NRLA. See SOURCES.md.</p>';

    printRoot.innerHTML = html;
  }

  regionSelect.addEventListener("change", updateRegionNote);
  countSelect.addEventListener("change", updateCount);
  for (var i = 0; i < landlordKind.length; i++) landlordKind[i].addEventListener("change", updateLandlordKind);
  trustBox.addEventListener("change", updateTrust);
  capacity.addEventListener("change", updateCapacity);

  var dwellings = form.querySelectorAll(".dwelling");
  for (var d = 0; d < dwellings.length; d++) bindDwelling(dwellings[d]);

  document.getElementById("print-btn").addEventListener("click", function () {
    build();
    if (live) live.textContent = "Print view ready. Use the print dialogue to save a PDF. Empty answers are marked you still need this.";
    window.print();
  });

  document.getElementById("preview-btn").addEventListener("click", function () {
    build();
    printRoot.style.display = "block";
    printRoot.setAttribute("tabindex", "-1");
    printRoot.scrollIntoView();
    if (live) live.textContent = "Preview updated below the form.";
  });

  document.getElementById("reset-btn").addEventListener("click", function () {
    form.reset();
    updateLandlordKind();
    updateCapacity();
    updateCount();
    updateRegionNote();
    var blocks = form.querySelectorAll(".dwelling");
    for (var i = 0; i < blocks.length; i++) {
      blocks[i].querySelector(".gas-supply").dispatchEvent(new Event("change"));
    }
    printRoot.innerHTML = "";
    printRoot.style.display = "none";
  });

  updateLandlordKind();
  updateCapacity();
  updateCount();
  updateRegionNote();
})();
