"use strict";

(function() {

  window.addEventListener("load", init);

  const COLORS = ["blank", "blue", "red", "black"];
  let given_clues = [];

  function init() {
    createBoard();
    beginTextSetup();
    id("term_input").onkeypress = validate;

    document.addEventListener("keypress", function(event) {
      if (event.key === 'Enter') {
        populateCells();
      }
    });
  }

  function createBoard() {
    let board = id("board");

    for (let row = 0; row < 5; row++) {
      let tableRow = gen("tr");
      board.appendChild(tableRow)
      for (let col = 0; col < 5; col++) {
        let cell = gen("td");
        let text = gen("span");
        cell.appendChild(text);
        tableRow.appendChild(cell)
      }
    }
  }

  function displayInstructions(text) {
    id("instructions").textContent = text;
  }

  function beginTextSetup() {
    displayInstructions("SET WORDS: Click on cards to set their words.");
    qsa("#board > tr > td").forEach(cell => {
      cell.onclick = () => showInputPopup(cell);
    });

    let finish_button = id("finish_words_setup")
    finish_button.disabled = true;
    finish_button.onclick = beginColorSetup;
  }

  function beginColorSetup() {
    displayInstructions("SET COLORS: Click on cards to cycle their colors (blue, red, blank, black).");
    qsa("#board > tr > td").forEach(cell => {
      cell.onclick = () => cycleColors(cell);
      cell.setAttribute("color", COLORS[0]);
      cell.setAttribute("revealed", true);
    });

    id("finish_words_setup").classList.add("hidden");
    let finish_button = id("begin_game");
    finish_button.classList.remove("hidden");
    finish_button.onclick = beginGame;
  }

  function beginGame() {
    displayInstructions("Click on cards to reveal them. Clue buttons generate clues for unrevealed cards.");
    qsa("#board > tr > td").forEach(cell => {
      cell.onclick = () => cell.setAttribute("revealed", true);
      cell.setAttribute("revealed", false);
    });

    id("begin_game").classList.add("hidden");
    id("clue_buttons").classList.remove("hidden");
    id("get_red_clue").onclick = () => getClue(true);
    id("get_blue_clue").onclick = () => getClue(false);
    id("clue_popup").onclick = hideCluePopup;
  }

  function showInputPopup(cell) {
    let inputPopup = id("input_popup");
    inputPopup.classList.remove("hidden");

    let input = id("term_input");
    input.value = "";
    input.onkeyup = (e) => filterDropdown(e.target, cell);
    input.focus();

    let dropdown = input.parentElement.querySelector("#dropdown_container");
    dropdown.classList.add("hidden");
  }

  function hideInputPopup() {
    let inputPopup = id("input_popup");
    inputPopup.classList.add("hidden");
  }

  function validate(e) {
    if (!/[A-Za-z ]/.test(e.key)) {
      e.preventDefault();
    }
  }

  function filterDropdown(input, cell) {
    let inputValue = input.value.toUpperCase();
    let suggestions = [];

    if (inputValue.length > 0) {
      for (let i = 0; i < terms.length; i++) {
        if (terms[i].startsWith(inputValue)) {
          suggestions.push(terms[i]);
          if (suggestions.length == 3) {
            break;
          }
        }
      }
    }

    let dropdown = input.parentElement.querySelector("#dropdown_container");
    dropdown.textContent = '';

    if (suggestions.length == 0) {
      dropdown.classList.add("hidden");
    } else {
      dropdown.classList.remove("hidden");
      suggestions.forEach(term => {
        let dropdownItem = gen("span");
        dropdownItem.textContent = term;
        dropdownItem.onclick = () => {
          hideInputPopup();
          selectSuggestion(term, cell);
        };
        dropdown.appendChild(dropdownItem);
      });
    }
  }

  function selectSuggestion(term, cell) {
    cell.querySelector("span").textContent = term;
    validateBoard();
  }

  function validateBoard() {
    let allTerms = [];
    qsa("#board > tr > td > span").forEach(span => allTerms.push(span.textContent));
    let valid = true;
    for (let i = 0; i < allTerms.length; i++) {
      if (!terms.includes(allTerms[i])) {
        valid = false;
        break;
      }
    }
    id("finish_words_setup").disabled = !valid;
  }

  function cycleColors(cell) {
    let color = cell.getAttribute("color");
    let nextColor = COLORS[(COLORS.indexOf(color) + 1) % COLORS.length];
    cell.setAttribute("color", nextColor);
  }

  function getClue(isRed) {
    let pos_terms = [];
    let neg_terms = [];
    qsa("#board > tr > td").forEach(cell => {
      let color = cell.getAttribute("color");
      let term = cell.querySelector("span").textContent;
      if ((isRed && color == 'red') || (!isRed && color == 'blue')) {
        pos_terms.push(term);
      } else {
        neg_terms.push(term);
      }
    })

    let params = new URLSearchParams({
      pos: pos_terms.join(),
      neg: neg_terms.join(),
      ignore: given_clues.join()
    });
    fetch('http://localhost:5000/clue?' + params)
      .then(response => response.json())
      .then(data => {
        given_clues.push({ ...data, color: isRed });
        showCluePopup(data.clue, data.count, isRed);
      });
  }

  function showCluePopup(clue, count, isRed) {
    let cluePopup = id("clue_popup");
    cluePopup.classList.remove("hidden");
    cluePopup.setAttribute("is_red", isRed);

    let text = cluePopup.querySelector("div > div > span");
    text.textContent = `${clue}  (${count})`;
  }

  function hideCluePopup() {
    id("clue_popup").add("hidden");
  }

  function populateCells() {
    qsa("#board > tr > td > span").forEach(span => {
      span.textContent = "FACE";
    })
    validateBoard();
  }

  function id(idName) {
    return document.getElementById(idName);
  }

  function gen(tagName) {
    return document.createElement(tagName);
  }

  function qs(selector) {
    return document.querySelector(selector);
  }

  function qsa(selector) {
    return document.querySelectorAll(selector);
  }
})();