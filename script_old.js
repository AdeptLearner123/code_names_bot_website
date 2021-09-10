 "use strict";

 (function() {

    window.addEventListener("load", init);

    const COLORS = ["blank", "blue", "red", "black"];

    function init() {
      createBoard()

      let startGameButton = id("startGame");
      startGameButton.disabled = true;
      startGameButton.addEventListener("click", startGame);

      id("clueButtonList").classList.add("hidden");
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
                cell.setAttribute("color", COLORS[0]);
                cell.setAttribute("revealed", true);
                cell.addEventListener("mousedown", cycleColors);

                let inputContainer = gen("div")
                inputContainer.classList.add("inputContainer")
                cell.appendChild(inputContainer);

                let inputField = gen("input");
                inputField.setAttribute("type", "text");
                inputContainer.appendChild(inputField);
                inputField.addEventListener("keyup", filterDropdown);
                inputField.addEventListener("input", e => checkValidity(e.target));
                inputField.addEventListener("input", e => checkBoardValidity());
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

    function validate(e) {
      if (!/[A-Za-z ]/.test(e.key)) {
        e.preventDefault();
      }
    }

    function cycleColors(e) {
      let color = e.target.getAttribute("color");
      let nextColor = COLORS[(COLORS.indexOf(color) + 1) % COLORS.length];
      e.target.setAttribute("color", nextColor);
    }

    function selectSuggestion(e) {
      let input = e.target.parentElement.parentElement.getElementsByTagName("input")[0];
      input.value = e.target.textContent;
      checkValidity(input);
      checkBoardValidity();
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
    }

    function checkValidity(input) {
      let inputValue = input.value.toUpperCase();
      let valid = terms.includes(inputValue);
      input.setCustomValidity(valid ? "" : "Invalid input");
    }

    function checkBoardValidity() {
      let valid = true;
      let termLists = getBoardTerms();
      let allTerms = termLists.blue.concat(termLists.red).concat(termLists.blank).concat(termLists.black);
      for (let i = 0; i < allTerms.length; i++) {
        if (!terms.includes(allTerms[i])) {
          valid = false;
          break;
        }
      }
      id("startGame").disabled = !valid;
    }

    function getBoardTerms() {
      let blue = [];
      let black = [];
      let red = [];
      let blank = [];

      qsa("#board > tr > td").forEach(cell => {
        let input = cell.querySelector(".inputContainer > input");
        let color = cell.getAttribute("color");
        let term = input.value.toUpperCase();
        switch(color) {
          case "blue":
            blue.push(term);
          case "red":
            red.push(term);
          case "blank":
            blank.push(term)
          case "black":
            black.push(term)
        }
      });

      return {
        blue,
        red,
        blank,
        black
      };
    }

    function startGame() {
      qsa("#board > tr > td").forEach(cell => {
        cell.setAttribute("revealed", false);
        cell.removeEventListener("mousedown", cycleColors);
        cell.addEventListener("mousedown", revealColor);
        let input = cell.querySelector(".inputContainer > input");
        input.disabled = true;
      });

      id("startGame").classList.add("hidden");
      id("clueButtonList").classList.remove("hidden");
    }

    function revealColor(e) {
      e.target.setAttribute("revealed", true);
    }

    function id(idName) {
      return document.getElementById(idName);
    }

    function gen(tagName) {
      return document.createElement(tagName);
    }

    function qsa(selector) {
      return document.querySelectorAll(selector);
    }
 })();