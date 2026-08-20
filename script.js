const form = document.getElementById("gymForm");
const stepPanels = Array.from(document.querySelectorAll(".step-panel"));
const stepLabels = [
  document.getElementById("stepLabel1"),
  document.getElementById("stepLabel2"),
  document.getElementById("stepLabel3"),
];
const progressBar = document.getElementById("progressBar");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const formMessage = document.getElementById("formMessage");

const passwordInput = document.getElementById("password");
const togglePasswordBtn = document.getElementById("togglePassword");
const eyeOpen = document.getElementById("eyeOpen");
const eyeClosed = document.getElementById("eyeClosed");

const conditionRadios = document.querySelectorAll('input[name="hasCondition"]');
const conditionField = document.getElementById("conditionField");
const conditionDetails = document.getElementById("conditionDetails");

const countrySelect = document.getElementById("country");
const departmentSelect = document.getElementById("department");
const citySelect = document.getElementById("city");

const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');
const cardFields = ["cardNumber", "cardHolder", "expiry", "cvv"].map((id) =>
  document.getElementById(id)
);

const locationData = {
  Colombia: {
    Antioquia: ["Medellin", "Envigado", "Bello"],
    Cundinamarca: ["Bogota", "Soacha", "Chia"],
    Valle_del_Cauca: ["Cali", "Palmira", "Buenaventura"],
  },
  Mexico: {
    Jalisco: ["Guadalajara", "Zapopan", "Tlaquepaque"],
    CDMX: ["Coyoacan", "Benito Juarez", "Miguel Hidalgo"],
    Nuevo_Leon: ["Monterrey", "San Nicolas", "Guadalupe"],
  },
  Espana: {
    Madrid: ["Madrid", "Alcala de Henares", "Mostoles"],
    Cataluna: ["Barcelona", "Badalona", "Tarragona"],
    Andalucia: ["Sevilla", "Malaga", "Granada"],
  },
};

let currentStep = 1;

function setSelectOptions(selectEl, placeholder, values) {
  selectEl.innerHTML = "";

  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = placeholder;
  selectEl.appendChild(placeholderOption);

  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value.replaceAll("_", " ");
    selectEl.appendChild(option);
  });
}

function initializeCountrySelect() {
  const countries = Object.keys(locationData);
  setSelectOptions(countrySelect, "Selecciona un pais", countries);
}

function updateDepartments() {
  const country = countrySelect.value;

  if (!country) {
    departmentSelect.disabled = true;
    citySelect.disabled = true;
    setSelectOptions(departmentSelect, "Selecciona primero un pais", []);
    setSelectOptions(citySelect, "Selecciona primero un departamento", []);
    return;
  }

  const departments = Object.keys(locationData[country]);
  setSelectOptions(departmentSelect, "Selecciona un departamento", departments);
  setSelectOptions(citySelect, "Selecciona primero un departamento", []);
  departmentSelect.disabled = false;
  citySelect.disabled = true;
}

function updateCities() {
  const country = countrySelect.value;
  const department = departmentSelect.value;

  if (!country || !department) {
    citySelect.disabled = true;
    setSelectOptions(citySelect, "Selecciona primero un departamento", []);
    return;
  }

  setSelectOptions(citySelect, "Selecciona una ciudad", locationData[country][department]);
  citySelect.disabled = false;
}

function setError(fieldName, message) {
  const errorEl = document.querySelector(`[data-error-for="${fieldName}"]`);
  if (errorEl) {
    errorEl.textContent = message;
  }
}

function clearError(fieldName) {
  setError(fieldName, "");
}

function validateTextRegex(value, regex) {
  return regex.test(value.trim());
}

function validateStep(step) {
  let valid = true;

  const panel = document.querySelector(`.step-panel[data-step="${step}"]`);
  const fields = panel.querySelectorAll("input, select, textarea");

  fields.forEach((field) => {
    if (field.type === "radio" || field.type === "checkbox") {
      return;
    }

    const isVisible = field.offsetParent !== null;
    if (!isVisible || field.disabled) {
      return;
    }

    const name = field.name;
    clearError(name);

    if (!field.checkValidity()) {
      valid = false;
      setError(name, field.validationMessage || "Campo invalido");
      field.classList.add("border-red-500");
      field.classList.remove("border-zinc-700");
    } else {
      field.classList.remove("border-red-500");
      field.classList.add("border-zinc-700");
    }
  });

  if (step === 1) {
    const nameValue = form.fullName.value;
    if (!validateTextRegex(nameValue, /^[a-zA-Z\sÀ-ÿ'-]{3,}$/)) {
      valid = false;
      setError("fullName", "Ingresa un nombre valido (solo letras, minimo 3 caracteres).");
    }

    const passwordValue = form.password.value;
    if (!validateTextRegex(passwordValue, /^(?=.*[A-Za-z])(?=.*\d).{8,}$/)) {
      valid = false;
      setError("password", "La contrasena debe tener minimo 8 caracteres, letras y numeros.");
    }

    const hasConditionSelected = document.querySelector('input[name="hasCondition"]:checked');
    clearError("hasCondition");
    if (!hasConditionSelected) {
      valid = false;
      setError("hasCondition", "Selecciona una opcion.");
    }

    if (hasConditionSelected && hasConditionSelected.value === "si") {
      conditionDetails.required = true;
      if (conditionDetails.value.trim().length < 5) {
        valid = false;
        setError("conditionDetails", "Describe tu condicion con al menos 5 caracteres.");
      } else {
        clearError("conditionDetails");
      }
    } else {
      conditionDetails.required = false;
      clearError("conditionDetails");
    }
  }

  if (step === 2) {
    clearError("plan");
    const planSelected = document.querySelector('input[name="plan"]:checked');
    if (!planSelected) {
      valid = false;
      setError("plan", "Debes elegir un plan.");
    }
  }

  if (step === 3) {
    clearError("paymentMethod");
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');

    if (!paymentMethod) {
      valid = false;
      setError("paymentMethod", "Selecciona un metodo de pago.");
    }

    const isCardPayment = paymentMethod && paymentMethod.value === "tarjeta";

    cardFields.forEach((field) => {
      if (isCardPayment) {
        field.required = true;
      } else {
        field.required = false;
        clearError(field.name);
      }
    });

    if (isCardPayment) {
      const cardDigits = form.cardNumber.value.replace(/\s+/g, "");
      if (!/^\d{16}$/.test(cardDigits)) {
        valid = false;
        setError("cardNumber", "El numero de tarjeta debe tener 16 digitos.");
      }

      if (!validateTextRegex(form.cardHolder.value, /^[a-zA-Z\sÀ-ÿ'-]{3,}$/)) {
        valid = false;
        setError("cardHolder", "Ingresa un titular valido.");
      }

      if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(form.expiry.value)) {
        valid = false;
        setError("expiry", "Usa el formato MM/AA.");
      }

      if (!/^\d{3,4}$/.test(form.cvv.value)) {
        valid = false;
        setError("cvv", "El CVV debe tener 3 o 4 digitos.");
      }
    }

    clearError("terms");
    if (!form.terms.checked) {
      valid = false;
      setError("terms", "Debes aceptar los terminos para continuar.");
    }
  }

  return valid;
}

function updateStepper() {
  stepPanels.forEach((panel, index) => {
    panel.classList.toggle("hidden", index + 1 !== currentStep);
  });

  stepLabels.forEach((label, index) => {
    if (index + 1 === currentStep) {
      label.classList.add("text-orange-400");
      label.classList.remove("text-orange-200/70");
    } else {
      label.classList.remove("text-orange-400");
      label.classList.add("text-orange-200/70");
    }
  });

  progressBar.style.width = `${(currentStep / 3) * 100}%`;

  prevBtn.disabled = currentStep === 1;
  nextBtn.classList.toggle("hidden", currentStep === 3);
  submitBtn.classList.toggle("hidden", currentStep !== 3);
}

function toggleConditionField() {
  const selected = document.querySelector('input[name="hasCondition"]:checked');
  const show = selected && selected.value === "si";

  conditionField.classList.toggle("hidden", !show);
  conditionDetails.required = Boolean(show);

  if (!show) {
    conditionDetails.value = "";
    clearError("conditionDetails");
  }
}

function togglePassword() {
  const showPassword = passwordInput.type === "password";
  passwordInput.type = showPassword ? "text" : "password";
  eyeOpen.classList.toggle("hidden", showPassword);
  eyeClosed.classList.toggle("hidden", !showPassword);
  togglePasswordBtn.setAttribute(
    "aria-label",
    showPassword ? "Ocultar contrasena" : "Mostrar contrasena"
  );
}

function addRealtimeValidation() {
  form.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("blur", () => {
      if (field.type === "radio" || field.type === "checkbox") {
        return;
      }

      if (!field.checkValidity()) {
        setError(field.name, field.validationMessage || "Campo invalido");
      } else {
        clearError(field.name);
      }
    });
  });
}

nextBtn.addEventListener("click", () => {
  const isValid = validateStep(currentStep);

  if (!isValid) {
    formMessage.textContent = "Revisa los campos marcados antes de continuar.";
    formMessage.className = "text-sm font-semibold text-red-400";
    return;
  }

  if (currentStep < 3) {
    currentStep += 1;
    formMessage.textContent = "";
    updateStepper();
  }
});

prevBtn.addEventListener("click", () => {
  if (currentStep > 1) {
    currentStep -= 1;
    formMessage.textContent = "";
    updateStepper();
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const isStepThreeValid = validateStep(3);
  if (!isStepThreeValid) {
    formMessage.textContent = "Completa correctamente los datos de pago para finalizar.";
    formMessage.className = "text-sm font-semibold text-red-400";
    return;
  }

  formMessage.textContent = "Registro completado con exito. Bienvenido a FitForge Gym.";
  formMessage.className = "text-sm font-semibold text-green-400";
  form.reset();

  toggleConditionField();
  updateDepartments();
  updateCities();

  currentStep = 1;
  updateStepper();
});

countrySelect.addEventListener("change", () => {
  updateDepartments();
  clearError("country");
  clearError("department");
  clearError("city");
});

departmentSelect.addEventListener("change", () => {
  updateCities();
  clearError("department");
  clearError("city");
});

citySelect.addEventListener("change", () => {
  clearError("city");
});

conditionRadios.forEach((radio) => {
  radio.addEventListener("change", toggleConditionField);
});

paymentMethodRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    clearError("paymentMethod");
  });
});

togglePasswordBtn.addEventListener("click", togglePassword);

form.cardNumber.addEventListener("input", (event) => {
  const digitsOnly = event.target.value.replace(/\D/g, "").slice(0, 16);
  event.target.value = digitsOnly.replace(/(\d{4})(?=\d)/g, "$1 ");
});

form.expiry.addEventListener("input", (event) => {
  const value = event.target.value.replace(/\D/g, "").slice(0, 4);
  if (value.length >= 3) {
    event.target.value = `${value.slice(0, 2)}/${value.slice(2)}`;
  } else {
    event.target.value = value;
  }
});

form.cvv.addEventListener("input", (event) => {
  event.target.value = event.target.value.replace(/\D/g, "").slice(0, 4);
});

initializeCountrySelect();
updateDepartments();
updateStepper();
addRealtimeValidation();
