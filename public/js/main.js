// ---Функции для работы с сервером---

const PORT = 3000;

const modalDelete = document.querySelector(".modal-delete");
const modalChange = document.querySelector(".modal-change");
const modalAdd = document.querySelector(".modal-add");
const modalCloseBtns = document.querySelectorAll(".modal__close-btn");

let allNames;
let clientsArrayData;
async function getClientsData() {
  const response = await fetch(`http://localhost:${PORT}/api/clients`);
  const data = await response.json();
  clientsArrayData = data;

  allNames = [];
  clientsArrayData.forEach((client) => {
    let clientName = `${client.surname} ${client.name} ${client.lastName}`;
    allNames.push(clientName);
  });
}

let responseAdd;
async function addClientData() {
  const contactWrappers = modalAdd.querySelectorAll(
    ".add-contact__field-wrapper"
  );
  let contactsArray = [];
  contactWrappers.forEach((wrapper) => {
    let newContact = {};
    newContact.type = wrapper.querySelector(".current").textContent;
    newContact.value = wrapper.querySelector("input").value;
    contactsArray.push(newContact);
  });
  responseAdd = await fetch(`http://localhost:${PORT}/api/clients`, {
    method: "POST",
    body: JSON.stringify({
      name: modalAdd.querySelector('[name = "name"]').value,
      surname: modalAdd.querySelector('[name = "surname"]').value,
      lastName: modalAdd.querySelector('[name = "middle-name"]').value,
      contacts: contactsArray,
    }),
    headers: { "Content-Type": "application/json" },
  });
}

async function deleteClientData() {
  await fetch(
    `http://localhost:${PORT}/api/clients/${document
      .querySelector('[data-delete= "delete"]')
      .querySelector(".content-row__cell--id").textContent
    }`,
    {
      method: "DELETE",
    }
  );
}

let responseChange;
async function saveChanges() {
  const contactWrappers = modalChange.querySelectorAll(
    ".add-contact__field-wrapper"
  );
  let contactsArray = [];
  contactWrappers.forEach((wrapper) => {
    let newContact = {};
    newContact.type = wrapper.querySelector(".current").textContent;
    newContact.value = wrapper.querySelector("input").value;
    contactsArray.push(newContact);
  });
  responseChange = await fetch(
    `http://localhost:${PORT}/api/clients/${document
      .querySelector(".modal__client-id")
      .textContent.slice(4, 100)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        name: modalChange.querySelector('[name = "name"]').value,
        surname: modalChange.querySelector('[name = "surname"]').value,
        lastName: modalChange.querySelector('[name = "middle-name"]').value,
        contacts: contactsArray,
      }),
      headers: { "Content-Type": "application/json" },
    }
  );
}

// ---Валидация---

let customConfig = {
  // class of the parent element where the error/success class is added
  classTo: "wrapper",
  // class of the parent element where error text element is appended
  errorTextParent: "wrapper",
  // type of element to create for the error text
  errorTextTag: "div",
  // class of the error text element
  errorTextClass: "input-error-message",
  errorClass: "has-danger",
  successClass: "has-success",
};

let form, phones, pristine;

function validateForm() {
  form = document.querySelector(".modal--is-active").querySelector(".form");
  pristine = new Pristine(form, customConfig);
  phones = form.querySelectorAll('[type = "tel"]');
  phones.forEach((phone) => {
    pristine.addValidator(
      phone,
      function (value, el) {
        const tel = phone.inputmask.unmaskedvalue();
        if (tel.length === 10) {
          return true;
        }
        return false;
      }, "Недопустимый формат", 2, false
    );
  });
}

// ---Вспомогательные функции---

function clearTable() {
  const tableRows = document.querySelectorAll(".table__content-row");
  if (tableRows) {
    tableRows.forEach((row) => row.remove());
  }
}

function clearModal() {
  const activeModal = document.querySelector(".modal--is-active");
  activeModal.querySelectorAll(".to-validate").forEach((input) => {
    input.removeEventListener("input", inputListener);
  });
  activeModal.querySelectorAll("input").forEach((input) => {
    if (input.inputmask) {
      input.inputmask.remove();
    }
    input.value = null;
  });

  if (pristine) pristine.destroy();

  activeModal
    .querySelectorAll(".contact-wrapper")
    .forEach((contact) => contact.remove());
  activeModal.classList.remove("modal--is-active");
}

function checkContactsAmount(modal) {
  if (modal.querySelectorAll(".add-contact__field-wrapper").length === 10) {
    modal.querySelector(".add-contact__btn").classList.add("btn-disabled");
    modal
      .querySelector(".add-contact__btn")
      .setAttribute("disabled", "disabled");
  }
}

function removeDeleteFlag() {
  if (document.querySelector('[data-delete= "delete"]')) {
    document
      .querySelector('[data-delete= "delete"]')
      .removeAttribute("data-delete");
  }
}

// ---Функции отрисовки---

let contactSelect, customSelect, contactInput;

function createElement(tag, classes, textContent = null, attributes = null) {
  const el = document.createElement(tag);
  classes ? classes.forEach((className) => el.classList.add(className)) : null;
  el.textContent = textContent;
  attributes
    ? attributes.forEach((attribute) =>
      el.setAttribute(attribute.name, attribute.value)
    )
    : null;
  return el;
}

function createAddContactField(modal) {
  const contactsWrapper = modal.querySelector(".form__contacts-wrapper");
  const contactFieldsWrapper = createElement("div", [
    "add-contact__field-wrapper",
    "wrapper",
    "flex",
  ]);
  contactSelect = createElement("select", ["add-contact__select"]);
  contactSelect.innerHTML = `<option value="Телефон" selected>Телефон</option>
  <option value="Email">Email</option>
  <option value="Facebook">Facebook</option>
  <option value="Vk">Vk</option>
  <option value="Другое">Другое</option>`;

  contactInput = createElement("input", ["add-contact__input"], null, [
    { name: "type", value: "tel" },
    { name: "required", value: "true" },
    {
      name: "data-pristine-required-message",
      value: "Нельзя добавить пустое поле",
    },
  ]);
  new Inputmask("+7(999) 999-99-99").mask(contactInput);

  contactSelect.addEventListener("change", function () {
    pristine.destroy();
    if (contactInput.inputmask) {
      contactInput.inputmask.remove();
    }
    if (this.value === "Телефон") {
      contactInput.setAttribute("type", "tel");
      new Inputmask("+7(999) 999-99-99").mask(contactInput);
    } else if (this.value === "Email") {
      contactInput.setAttribute("type", "email");
      contactInput.setAttribute(
        "data-pristine-email-message",
        "Введите e-mail в формате xxx@xxx.xxx"
      );
    } else {
      contactInput.setAttribute("type", "text");
    }
    contactInput.value = "";
  });

  const contactDeleteBtn = createElement(
    "button",
    ["add-contact__delete-btn", "btn-reset"],
    null,
    [{ name: "type", value: "button" }]
  );
  contactDeleteBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 0C2.682 0 0 2.682 0 6C0 9.318 2.682 12 6 12C9.318 12 12 9.318 12 6C12 2.682 9.318 0 6 0ZM6 10.8C3.354 10.8 1.2 8.646 1.2 6C1.2 3.354 3.354 1.2 6 1.2C8.646 1.2 10.8 3.354 10.8 6C10.8 8.646 8.646 10.8 6 10.8ZM8.154 3L6 5.154L3.846 3L3 3.846L5.154 6L3 8.154L3.846 9L6 6.846L8.154 9L9 8.154L6.846 6L9 3.846L8.154 3Z"
  fill="#B0B0B0" /></svg>`;

  contactFieldsWrapper.append(contactSelect, contactInput, contactDeleteBtn);
  contactsWrapper.append(contactFieldsWrapper);
  contactDeleteBtn.addEventListener("click", (ev) => {
    ev.stopPropagation();
    contactFieldsWrapper.remove();
  });
  customSelect = NiceSelect.bind(contactSelect);
}

function createTableRow(client) {
  const tbody = document.querySelector(".tbody");
  const tr = createElement("tr", ["table__content-row", "content-row"]);
  tbody.append(tr);

  const tdId = createElement(
    "td",
    ["content-row__cell", "content-row__cell--id"],
    client.id
  );
  const tdName = createElement(
    "td",
    ["content-row__cell", "content-row__cell--name"],
    `${client.surname} ${client.name} ${client.lastName}`
  );
  tdName.setAttribute("data-name", `${tdName.textContent}`);

  const tdCreate = createElement("td", [
    "content-row__cell",
    "content-row__cell--create-time",
  ]);
  const span1 = createElement(
    "span",
    null,
    `${client.createdAt.slice(8, 10)}.${client.createdAt.slice(5, 7
    )}.${client.createdAt.slice(0, 4)} `
  );
  const span2 = createElement("span", null, client.createdAt.slice(11, 16));
  span1.append(span2);
  tdCreate.append(span1);

  const tdChange = createElement("td", [
    "content-row__cell",
    "content-row__cell--change-time",
  ]);
  const span11 = createElement(
    "span",
    null,
    `${client.updatedAt.slice(8, 10)}.${client.updatedAt.slice(5, 7
    )}.${client.updatedAt.slice(0, 4)} `
  );
  const span22 = createElement("span", null, client.updatedAt.slice(11, 16));
  span11.append(span22);
  tdChange.append(span11);

  const tdContacts = createElement("td", [
    "content-row__cell",
    "content-row__cell--contacts",
    "contacts",
  ]);
  if (client.contacts) {
    for (let n = 0; n < client.contacts.length; ++n) {
      const btn = createElement(
        "button",
        ["contacts__icon", "btn-reset"],
        null,
        [
          { name: "data-microtip-position", value: "top" },
          { name: "role", value: "tooltip" },
          {
            name: "aria-label",
            value: `${client.contacts[n].type}: ${client.contacts[n].value}`,
          },
        ]
      );

      if (client.contacts[n].type === "Телефон") {
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"
        xmlns="http://www.w3.org/2000/svg"> <g opacity="0.7">
          <circle cx="8" cy="8" r="8" fill="#9873FF" />
          <path d="M11.56 9.50222C11.0133 9.50222 10.4844 9.41333 9.99111 9.25333C9.83556 9.2 9.66222 9.24 9.54222 9.36L8.84444 10.2356C7.58667 9.63556 6.40889 8.50222 5.78222 7.2L6.64889 6.46222C6.76889 6.33778 6.80444 6.16444 6.75556 6.00889C6.59111 5.51556 6.50667 4.98667 6.50667 4.44C6.50667 4.2 6.30667 4 6.06667 4H4.52889C4.28889 4 4 4.10667 4 4.44C4 8.56889 7.43556 12 11.56 12C11.8756 12 12 11.72 12 11.4756V9.94222C12 9.70222 11.8 9.50222 11.56 9.50222Z" fill="white" /></g></svg>`;
      } else if (client.contacts[n].type === "Email") {
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path opacity="0.7" fill-rule="evenodd" clip-rule="evenodd"
          d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM4 5.75C4 5.3375 4.36 5 4.8 5H11.2C11.64 5 12 5.3375 12 5.75V10.25C12 10.6625 11.64 11 11.2 11H4.8C4.36 11 4 10.6625 4 10.25V5.75ZM8.424 8.1275L11.04 6.59375C11.14 6.53375 11.2 6.4325 11.2 6.32375C11.2 6.0725 10.908 5.9225 10.68 6.05375L8 7.625L5.32 6.05375C5.092 5.9225 4.8 6.0725 4.8 6.32375C4.8 6.4325 4.86 6.53375 4.96 6.59375L7.576 8.1275C7.836 8.28125 8.164 8.28125 8.424 8.1275Z" fill="#9873FF" /> </svg>`;
      } else if (client.contacts[n].type === "Vk") {
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <g opacity="0.7">
          <path d="M8 0C3.58187 0 0 3.58171 0 8C0 12.4183 3.58187 16 8 16C12.4181 16 16 12.4183 16 8C16 3.58171 12.4181 0 8 0ZM12.058 8.86523C12.4309 9.22942 12.8254 9.57217 13.1601 9.97402C13.3084 10.1518 13.4482 10.3356 13.5546 10.5423C13.7065 10.8371 13.5693 11.1604 13.3055 11.1779L11.6665 11.1776C11.2432 11.2126 10.9064 11.0419 10.6224 10.7525C10.3957 10.5219 10.1853 10.2755 9.96698 10.037C9.87777 9.93915 9.78382 9.847 9.67186 9.77449C9.44843 9.62914 9.2543 9.67366 9.1263 9.90707C8.99585 10.1446 8.96606 10.4078 8.95362 10.6721C8.93577 11.0586 8.81923 11.1596 8.43147 11.1777C7.60291 11.2165 6.81674 11.0908 6.08606 10.6731C5.44147 10.3047 4.94257 9.78463 4.50783 9.19587C3.66126 8.04812 3.01291 6.78842 2.43036 5.49254C2.29925 5.2007 2.39517 5.04454 2.71714 5.03849C3.25205 5.02817 3.78697 5.02948 4.32188 5.03799C4.53958 5.04143 4.68362 5.166 4.76726 5.37142C5.05633 6.08262 5.4107 6.75928 5.85477 7.38684C5.97311 7.55396 6.09391 7.72059 6.26594 7.83861C6.45582 7.9689 6.60051 7.92585 6.69005 7.71388C6.74734 7.57917 6.77205 7.43513 6.78449 7.29076C6.82705 6.79628 6.83212 6.30195 6.75847 5.80943C6.71263 5.50122 6.53929 5.30218 6.23206 5.24391C6.07558 5.21428 6.0985 5.15634 6.17461 5.06697C6.3067 4.91245 6.43045 4.81686 6.67777 4.81686L8.52951 4.81653C8.82136 4.87382 8.88683 5.00477 8.92645 5.29874L8.92808 7.35656C8.92464 7.47032 8.98521 7.80751 9.18948 7.88198C9.35317 7.936 9.4612 7.80473 9.55908 7.70112C10.0032 7.22987 10.3195 6.67368 10.6029 6.09801C10.7279 5.84413 10.8358 5.58142 10.9406 5.31822C11.0185 5.1236 11.1396 5.02785 11.3593 5.03112L13.1424 5.03325C13.195 5.03325 13.2483 5.03374 13.3004 5.04274C13.6009 5.09414 13.6832 5.22345 13.5903 5.5166C13.4439 5.97721 13.1596 6.36088 12.8817 6.74553C12.5838 7.15736 12.2661 7.55478 11.9711 7.96841C11.7001 8.34652 11.7215 8.53688 12.058 8.86523Z" fill="#9873FF" /> </g> </svg>`;
      } else if (client.contacts[n].type === "Facebook") {
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"
        xmlns="http://www.w3.org/2000/svg"> <g opacity="0.7">
          <path d="M7.99999 0C3.6 0 0 3.60643 0 8.04819C0 12.0643 2.928 15.3976 6.75199 16V10.3775H4.71999V8.04819H6.75199V6.27309C6.75199 4.25703 7.94399 3.14859 9.77599 3.14859C10.648 3.14859 11.56 3.30121 11.56 3.30121V5.28514H10.552C9.55999 5.28514 9.24799 5.90362 9.24799 6.53815V8.04819H11.472L11.112 10.3775H9.24799V16C11.1331 15.7011 12.8497 14.7354 14.0879 13.2772C15.3261 11.819 16.0043 9.96437 16 8.04819C16 3.60643 12.4 0 7.99999 0Z" fill="#9873FF" /> </g> </svg>`;
      } else {
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path opacity="0.7" fill-rule="evenodd" clip-rule="evenodd"
          d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM3 8C3 5.24 5.24 3 8 3C10.76 3 13 5.24 13 8C13 10.76 10.76 13 8 13C5.24 13 3 10.76 3 8ZM9.5 6C9.5 5.17 8.83 4.5 8 4.5C7.17 4.5 6.5 5.17 6.5 6C6.5 6.83 7.17 7.5 8 7.5C8.83 7.5 9.5 6.83 9.5 6ZM5 9.99C5.645 10.96 6.75 11.6 8 11.6C9.25 11.6 10.355 10.96 11 9.99C10.985 8.995 8.995 8.45 8 8.45C7 8.45 5.015 8.995 5 9.99Z" fill="#9873FF" /> </svg>`;
      }
      tdContacts.append(btn);
    }
  }

  const tdActions = createElement("td", [
    "content-row__cell",
    "content-row__cell--actions",
    "actions",
  ]);
  const btnChacnge = createElement("button", ["actions__btn", "btn-reset"]);
  btnChacnge.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <g opacity="0.7">
        <path d="M2 11.5V14H4.5L11.8733 6.62662L9.37333 4.12662L2 11.5ZM13.8067 4.69329C14.0667 4.43329 14.0667 4.01329 13.8067 3.75329L12.2467 2.19329C11.9867 1.93329 11.5667 1.93329 11.3067 2.19329L10.0867 3.41329L12.5867 5.91329L13.8067 4.69329Z" fill="#9873FF" /> </g> </svg> <span>Изменить</span>`;

  btnChacnge.addEventListener("click", () => {
    modalChange.classList.add("modal--is-active");
    document.querySelector("html").classList.add("no-scroll");
    modalChange.querySelector(".server-error-message").textContent = null;
    modalChange
      .querySelector(".add-contact__btn")
      .classList.remove("btn-disabled");
    modalChange.querySelector(".add-contact__btn").removeAttribute("disabled");
    tr.setAttribute("data-delete", "delete");
    modalChange.querySelector(
      ".modal__client-id"
    ).textContent = `ID: ${client.id}`;

    const surnameInput = modalChange.querySelector('[name = "surname"]');
    const nameInput = modalChange.querySelector('[name = "name"]');
    const middlenameInput = modalChange.querySelector('[name = "middle-name"]');

    surnameInput.value = client.surname;
    nameInput.value = client.name;
    middlenameInput.value = client.lastName;

    if (surnameInput.value) modalChange.querySelector('[name = "surname"] + label').classList.add('active');

    if (nameInput.value) modalChange.querySelector('[name = "name"] + label').classList.add('active');

    if (middlenameInput.value) modalChange.querySelector('[name = "middle-name"] + label').classList.add('active');

    modalChange
      .querySelectorAll(".add-contact__field-wrapper")
      .forEach((item) => item.remove());
    if (client.contacts) {
      client.contacts.forEach((contact) => {
        createAddContactField(modalChange);
        contactInput.inputmask.remove();
        contactInput.value = contact.value;
        contactSelect
          .querySelectorAll("option")
          .forEach((option) => option.removeAttribute("selected"));
        if (contactSelect.querySelector(`[value = "${contact.type}"]`)) {
          contactSelect
            .querySelector(`[value = "${contact.type}"]`)
            .setAttribute("selected", "true");
        } else {
          contactSelect
            .querySelector('[value = "Другое"]')
            .setAttribute("selected", "true");
        }

        if (contactSelect.value === "Телефон") {
          contactInput.setAttribute("type", "tel");
          new Inputmask("+7(999) 999-99-99").mask(contactInput);
        } else if (contactSelect.value === "Email") {
          contactInput.setAttribute("type", "email");
          contactInput.setAttribute(
            "data-pristine-email-message",
            "Введите e-mail в формате xxx@xxx.xxx"
          );
        } else {
          contactInput.setAttribute("type", "text");
        }

        customSelect.update();
      });
    }
    checkContactsAmount(modalChange);
  });

  const btnDelete = createElement("button", ["actions__btn", "btn-reset"]);
  btnDelete.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.7">
      <path
        d="M8 2C4.682 2 2 4.682 2 8C2 11.318 4.682 14 8 14C11.318 14 14 11.318 14 8C14 4.682 11.318 2 8 2ZM8 12.8C5.354 12.8 3.2 10.646 3.2 8C3.2 5.354 5.354 3.2 8 3.2C10.646 3.2 12.8 5.354 12.8 8C12.8 10.646 10.646 12.8 8 12.8ZM10.154 5L8 7.154L5.846 5L5 5.846L7.154 8L5 10.154L5.846 11L8 8.846L10.154 11L11 10.154L8.846 8L11 5.846L10.154 5Z"
        fill="#F06A4D" /></g></svg><span>Удалить</span>`;
  btnDelete.addEventListener("click", () => {
    modalDelete.classList.add("modal--is-active");
    tr.setAttribute("data-delete", "delete");
  });
  tdActions.append(btnChacnge, btnDelete);

  tr.append(tdId, tdName, tdCreate, tdChange, tdContacts, tdActions);
}

// ---Функции сортировки---

const sortIdBtn = document.querySelector(".sort-btn--id");
const sortNameBtn = document.querySelector(".sort-btn--name");
const sortCreateBtn = document.querySelector(".sort-btn--create");
const sortChangeBtn = document.querySelector(".sort-btn--change");
const allSortBtns = document.querySelectorAll(".sort-btn");
let sortedArray;

// Функция для сортировки по клику на кнопку сортировки
async function sortTable(element, param) {
  allSortBtns.forEach((btn) => btn.classList.remove("sort-btn--active"));
  element.classList.add("sort-btn--active");
  await getClientsData();
  if (element.querySelector(".sorted-upwards")) {
    if (element === sortNameBtn) {
      sortedArray = clientsArrayData.sort((a, b) =>
        `${a.surname.toUpperCase()}${a.name.toUpperCase()}${a.lastName.toUpperCase()}` >
          `${b.surname.toUpperCase()}${b.name.toUpperCase()}${b.lastName.toUpperCase()}`
          ? 1
          : -1
      );
    } else {
      sortedArray = clientsArrayData.sort((a, b) =>
        a[param] > b[param] ? 1 : -1
      );
    }
  } else {
    if (element === sortNameBtn) {
      sortedArray = clientsArrayData.sort((a, b) =>
        `${a.surname.toUpperCase()}${a.name.toUpperCase()}${a.lastName.toUpperCase()}` <
          `${b.surname.toUpperCase()}${b.name.toUpperCase()}${b.lastName.toUpperCase()}`
          ? 1
          : -1
      );
    } else {
      sortedArray = clientsArrayData.sort((a, b) =>
        a[param] < b[param] ? 1 : -1
      );
    }
  }
  clearTable();
  sortedArray.forEach((client) => createTableRow(client));
}

// Функция, которая восстанавливает сортировку при добавлении/удалении/изменении клиента
function createSortedTable() {
  const activeBtn = document.querySelector(".sort-btn--active");

  if (activeBtn === sortIdBtn) sortTable(sortIdBtn, "id");

  if (activeBtn === sortNameBtn) sortTable(sortNameBtn);

  if (activeBtn === sortCreateBtn) sortTable(sortCreateBtn, "createdAt");

  if (activeBtn === sortChangeBtn) {
    sortTable(sortChangeBtn, "updatedAt");
  }
}

// ---Функции для поиска---

function autocomplete(inp, arr) {
  let currentFocus;
  inp.addEventListener("input", function () {
    closeAllLists();
    let val = this.value;
    if (!val.trim()) {
      return false;
    }
    currentFocus = -1;
    const autocompleteList = createElement(
      "div",
      ["autocomplete-items"],
      null,
      [{ name: "id", value: this.id + "autocomplete-list" }]
    );
    this.parentNode.appendChild(autocompleteList);

    for (let i = 0; i < arr.length; i++) {
      if (arr[i].toUpperCase().includes(val.toUpperCase())) {
        const nameOption = document.createElement("div");
        nameOption.innerHTML = arr[i];
        nameOption.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";

        nameOption.addEventListener("click", function () {
          inp.value = this.getElementsByTagName("input")[0].value;
          closeAllLists();
          if (document.querySelector(".is-highlighted")) {
            document
              .querySelector(".is-highlighted")
              .classList.remove("is-highlighted");
          }
          document
            .querySelector(`[data-name = "${inp.value}"]`)
            .closest(".content-row")
            .classList.add("is-highlighted");
          document
            .querySelector(".is-highlighted")
            .scrollIntoView({ block: "center" });
          setTimeout(
            () =>
              document
                .querySelector(".is-highlighted")
                .classList.remove("is-highlighted"),
            3000
          );
        });
        autocompleteList.appendChild(nameOption);
      }
    }
  });

  // Управление с клавиатуры
  inp.addEventListener("keydown", function (e) {
    let autocompleteItems = document.getElementById(
      this.id + "autocomplete-list"
    );
    if (autocompleteItems)
      autocompleteItems = autocompleteItems.getElementsByTagName("div");
    if (e.keyCode == 40) {
      //стрелка вниз
      currentFocus++;
      addActive(autocompleteItems);
    } else if (e.keyCode == 38) {
      //стрелка вверх
      currentFocus--;
      addActive(autocompleteItems);
    } else if (e.keyCode == 13) {
      if (currentFocus > -1) {
        /*имитировать щелчок по элементу "active": */
        if (autocompleteItems) autocompleteItems[currentFocus].click();
      }
    }
  });

  /* закройте все списки автозаполнения в документе, кроме того, который был передан в качестве аргумента: */
  function closeAllLists(elmnt) {
    let items = document.querySelectorAll(".autocomplete-items");
    for (let i = 0; i < items.length; i++) {
      if (elmnt != items[i] && elmnt != inp) {
        items[i].parentNode.removeChild(items[i]);
      }
    }
  }

  /* функция для классификации элемента как "active": */
  function addActive(items) {
    if (!items) return false;
    /* начните с удаления "активного" класса для всех элементов: */
    for (let i = 0; i < items.length; i++) {
      items[i].classList.remove("autocomplete-active");
    }
    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = items.length - 1;
    /*добавить класса "autocomplete-active": */
    items[currentFocus].classList.add("autocomplete-active");
  }

  // Закрытие выпадающего списка по клику на оверлей
  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", async () => {
  const preloader = document.querySelector(".table__preloader");

  clearTable();
  await getClientsData();
  createSortedTable();
  preloader.style.display = "none";

  autocomplete(document.getElementById("mainInput"), allNames);

  // ---Сортировка---

  sortIdBtn.addEventListener("click", () => {
    if (sortIdBtn.querySelector(".sorted-upwards")) {
      sortIdBtn
        .querySelector(".table-head__arrow")
        .classList.remove("sorted-upwards");
    } else {
      sortIdBtn
        .querySelector(".table-head__arrow")
        .classList.add("sorted-upwards");
    }
    sortTable(sortIdBtn, "id");
  });

  sortNameBtn.addEventListener("click", () => {
    if (sortNameBtn.querySelector(".sorted-upwards")) {
      sortNameBtn
        .querySelector(".table-head__arrow")
        .classList.remove("sorted-upwards");
    } else {
      sortNameBtn
        .querySelector(".table-head__arrow")
        .classList.add("sorted-upwards");
    }
    sortTable(sortNameBtn);
  });

  sortCreateBtn.addEventListener("click", () => {
    if (sortCreateBtn.querySelector(".sorted-upwards")) {
      sortCreateBtn
        .querySelector(".table-head__arrow")
        .classList.remove("sorted-upwards");
    } else {
      sortCreateBtn
        .querySelector(".table-head__arrow")
        .classList.add("sorted-upwards");
    }
    sortTable(sortCreateBtn, "createdAt");
  });

  sortChangeBtn.addEventListener("click", () => {
    if (sortChangeBtn.querySelector(".sorted-upwards")) {
      sortChangeBtn
        .querySelector(".table-head__arrow")
        .classList.remove("sorted-upwards");
    } else {
      sortChangeBtn
        .querySelector(".table-head__arrow")
        .classList.add("sorted-upwards");
    }
    sortTable(sortChangeBtn, "updatedAt");
  });

  // ---Модальные окна---

  document.querySelectorAll('.name-input-wrapper > input').forEach((input) => {
    input.addEventListener('focus', () => {
      input.nextElementSibling.classList.add('active');
    })
  })

  document.querySelectorAll('.name-input-wrapper > input').forEach((input) => {
    input.addEventListener('blur', () => {
      if (!input.value) input.nextElementSibling.classList.remove('active');
    })
  })

  // Закрытие по клику на кнопку
  modalCloseBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelector("html").classList.remove("no-scroll");
      clearModal();
      removeDeleteFlag();
    });
  });

  // Закрытие по клику на оверлей
  document.querySelectorAll(".modal").forEach((modal) =>
    modal.addEventListener("click", (ev) => {
      document.querySelector("html").classList.remove("no-scroll");
      if (!ev.target.closest(".modal__content")) {
        clearModal();
        removeDeleteFlag();
      }
    })
  );

  // ---"Изменить данные"---
  modalChange
    .querySelector(".modal__form")
    .addEventListener("submit", async (e) => {
      validateForm();
      e.preventDefault();
      if (pristine.validate()) {
        await saveChanges();
        if (responseChange.status.toString().slice(0, 1) !== "2") {
          modalChange.querySelector(".server-error-message").textContent =
            responseChange.statusText;
        } else {
          modalChange.classList.remove("modal--is-active");
          await getClientsData();
          createSortedTable();
          autocomplete(document.getElementById("mainInput"), allNames);
        }
      }
    });

  modalChange
    .querySelector(".form__delete-btn")
    .addEventListener("click", () => {
      modalDelete.classList.add("modal--is-active");
    });

  modalChange
    .querySelector(".add-contact__btn")
    .addEventListener("click", () => {
      createAddContactField(modalChange);
      checkContactsAmount(modalChange);
    });

  // ---"Добавить клиента"---
  document.querySelector(".main__btn").addEventListener("click", () => {
    modalAdd.classList.add("modal--is-active");
    document.querySelector("html").classList.add("no-scroll");
    modalAdd.querySelector(".server-error-message").textContent = null;
  });

  modalAdd
    .querySelector(".modal__form")
    .addEventListener("submit", async (e) => {
      validateForm();
      e.preventDefault();
      if (pristine.validate()) {
        await addClientData();
        if (responseAdd.status.toString().slice(0, 1) !== "2") {
          modalAdd.querySelector(".server-error-message").textContent =
            responseAdd.statusText;
        } else {
          clearModal(modalAdd);
          clearTable();
          await getClientsData();
          createSortedTable();
          autocomplete(document.getElementById("mainInput"), allNames);
        }
      }
    });

  modalAdd
    .querySelector(".form__reset-btn")
    .addEventListener("click", () =>
      modalAdd.classList.remove("modal--is-active"));

  modalAdd.querySelector(".add-contact__btn").addEventListener("click", () => {
    createAddContactField(modalAdd);
    checkContactsAmount(modalAdd);
  });

  // ---"Удалить клиента"---
  modalDelete
    .querySelector(".modal-delete__delete-btn")
    .addEventListener("click", async () => {
      await deleteClientData();
      modalDelete.classList.remove("modal--is-active");
      modalChange.classList.remove("modal--is-active");
      clearTable();
      await getClientsData();
      createSortedTable();
      autocomplete(document.getElementById("mainInput"), allNames);
    });

  document
    .querySelector(".modal-delete__cancel-btn")
    .addEventListener("click", () => {
      modalDelete.classList.remove("modal--is-active");
      removeDeleteFlag();
    });


});
