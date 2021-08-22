 "use strict";

 (function() {

    window.addEventListener("load", init);

    function init() {
      createBoard()
    }

    function createBoard() {
        let board = id("board");

        for (let row = 0; row < 5; row++) {
            let tableRow = gen("tr");
            board.appendChild(tableRow)
            for (let col = 0; col < 5; col++) {
                let cell = gen("td");
                cell.setAttribute("row", row);
                cell.setAttribute("col", col);

                let inputContainer = gen("div")
                inputContainer.classList.add("inputContainer")
                cell.appendChild(inputContainer);

                let inputField = gen("input");
                inputField.setAttribute("type", "text");
                inputContainer.appendChild(inputField);
                inputField.addEventListener("keyup", filterDropdown);
                inputField.addEventListener("keypress", validate);
                inputField.addEventListener("blur", hideDropdown);
                inputField.addEventListener("focus", filterDropdown);

                let dropdownContainer = gen("div");
                dropdownContainer.classList.add("dropdownContainer");
                dropdownContainer.classList.add("hidden");
                inputContainer.appendChild(dropdownContainer);

                tableRow.appendChild(cell)
            }
        }
    }

    function id(idName) {
      return document.getElementById(idName);
    }

    function gen(tagName) {
      return document.createElement(tagName);
    }

    function validate(e) {
      if (!/[A-Za-z ]/.test(e.key)) {
        e.preventDefault();
      }
    }

    function selectSuggestion(e) {
      console.log("Select suggestoin");
      let input = e.target.parentElement.parentElement.getElementsByTagName("input")[0];
      input.value = e.target.textContent;
    }

    function hideDropdown(e) {
      let dropdown = e.target.parentElement.getElementsByClassName("dropdownContainer")[0];
      dropdown.classList.add("hidden");
    }

    function filterDropdown(e) {
      let inputValue = e.target.value.toUpperCase();
      let suggestions = [];

      if (inputValue.length > 0) {
        for (let i = 0; i < terms.length; i++) {
          if (terms[i].startsWith(inputValue) && terms[i].length > inputValue.length) {
            suggestions.push(terms[i]);
            if (suggestions.length == 3) {
              break;
            }
          }
        }
      }

      let dropdown = e.target.parentElement.getElementsByClassName("dropdownContainer")[0];
      dropdown.textContent = '';

      if (suggestions.length == 0) {
        dropdown.classList.add("hidden");
      } else {
        dropdown.classList.remove("hidden");
        suggestions.forEach(term => {
          let dropdownItem = gen("span");
          dropdownItem.textContent = term;
          dropdownItem.addEventListener("mousedown", selectSuggestion);
          dropdown.appendChild(dropdownItem);
        });
      }
      console.log(suggestions);
    }
 })();