let clickCount = 0;

const countryInput = document.getElementById('country');
const myForm = document.getElementById('form');
const modal = document.getElementById('form-feedback-modal');
const clicksInfo = document.getElementById('click-count');
const phoneCodeInput = document.getElementById('countryCode');
const vatCheckbox = document.getElementById('vatUE');
const invoiceFields = document.getElementById('invoiceFields');

// zielony checkbox po wpisaniu poprawnej formy
const emailInput = document.getElementById('email');
const emailIcon = document.getElementById('email-valid-icon');
const zipInput = document.getElementById('zipCode');
const zipIcon = document.getElementById('zip-valid-icon');

function handleClick() {
    clickCount++;
    clicksInfo.innerText = clickCount;
}

async function fetchAndFillCountries() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        if (!response.ok) {
            throw new Error('Błąd pobierania danych');
        }
        const data = await response.json();

        // sortowanie alfabetyczne dla panstw
        const countries = data
            .map(country => country.name.common)
            .sort((a, b) => a.localeCompare(b));

        countryInput.innerHTML = countries
            .map(country => `<option value="${country}">${country}</option>`)
            .join('');

        getCountryByIP();
    } catch (error) {
        console.error('Wystąpił błąd:', error);
    }
}

function getCountryByIP() {
    fetch('https://get.geojs.io/v1/ip/geo.json')
        .then(response => response.json())
        .then(data => {
            const country = data.country;

            // dodawanie prefixu po adresie ip
            if (countryInput) {
                // znajdź opcję odpowiadającą krajowi i ustaw ją jako wybraną
                const optionExists = [...countryInput.options].some(opt => opt.value === country);
                if (optionExists) {
                    countryInput.value = country;
                }
            }
            getCountryCode(country);
        })
        .catch(error => {
            console.error('Błąd pobierania danych z serwera GeoJS:', error);
        });
}

function getCountryCode(countryName) {
    const apiUrl = `https://restcountries.com/v3.1/name/${countryName}?fullText=true`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Błąd pobierania danych');
            }
            return response.json();
        })
        .then(data => {
            const root = data[0].idd?.root || "";
            const suffixes = data[0].idd?.suffixes || [];
            const firstPrefix = suffixes.length > 0 ? `${root}${suffixes[0]}` : "";

            if (!firstPrefix) {
                console.warn(`Nie znaleziono prefixu dla kraju: ${countryName}`);
                return;
            }

            const fullPrefix = `${firstPrefix}`;

            if (phoneCodeInput) {
                // sprawdź, czy opcja już istnieje
                const exists = [...phoneCodeInput.options].some(opt => opt.value === fullPrefix);

                if (!exists) {
                    const newOption = document.createElement("option");
                    newOption.value = fullPrefix;
                    newOption.text = `${fullPrefix} (${countryName})`;
                    phoneCodeInput.appendChild(newOption);
                }

                phoneCodeInput.value = fullPrefix;
            }
        })
        .catch(error => {
            console.error('Wystąpił błąd przy pobieraniu prefixu:', error);
        });
}

function showCheckbox() {
    emailInput.addEventListener('input', () => {
        const email = emailInput.value;
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
        if (isValid) {
            emailIcon.classList.remove('d-none');
        } else {
            emailIcon.classList.add('d-none');
        }
    });

    zipInput.addEventListener('input', () => {
        const zip = zipInput.value;
        const isValidZip = /^\d{2}-\d{3}$/.test(zip);
    
        if (isValidZip) {
            zipIcon.classList.remove('d-none');
        } else {
            zipIcon.classList.add('d-none');
        }
    });
}

function enterKeyDownAction() {
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            const isFormValid = myForm.checkValidity();
    
            if (isFormValid) {
                myForm.requestSubmit();
            } else {
                event.preventDefault();
                myForm.classList.add('was-validated');
                alert("Uzupełnij poprawnie wszystkie wymagane pola!");
            }
        }
    });
}

(() => {
    // nasłuchiwania na zdarzenie kliknięcia myszką
    document.addEventListener('click', handleClick);

    fetchAndFillCountries();
    enterKeyDownAction();
    showCheckbox();

    // pokazywanie/ukrywanie pól faktury VAT
    if (vatCheckbox && invoiceFields) {
        vatCheckbox.addEventListener("change", function () {
            invoiceFields.style.display = this.checked ? "block" : "none";
        });
    }
})()
