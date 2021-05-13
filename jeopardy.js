// categories is the main data structure for the app; it looks like this:
//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]
let url = "http://jservice.io/api/";
let width = 6;
let height =5;
let categories = [];

/** Get NUM_CATEGORIES random category from API.
 * Returns array of category ids
 */
 async function getCategoryIds() {
    let response = await axios.get(`http://jservice.io/api/categories?count=100`);
    let ids = response.data.map(category => category.id);
    return _.sampleSize(ids, width);
}

/** Return object with data about a category:
 *  Returns { title: "Math", clues: clue-array }
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */
 async function getCategory(categoryid) {
    let response = await axios.get(`http://jservice.io/api/category?id=${categoryid}`);
    let categoryClues = response.data.clues;
    let randomClues = _.sampleSize(categoryClues, width);
    let clues = randomClues.map(c => ({
        question: c.question,
        answer: c.answer,
        showing: null
    }));
    return {title: response.data.title, clues};
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */
    // var game = document.getElementById('game');
    // while(game.firstChild) game.removeChild(game.firstChild);
    // var tablehead = document.getElementById('tablehead');
    // while(tablehead.firstChild) tablehead.removeChild(tablehead.firstChild);
    // let table=document.getElementById("game");
    // let top = document.createElement("tr");
    // top.addEventListener("click", handleClick);
    
async function fillTable() {
    $("#game thead").empty();
    let $tr = $("<tr>");
    $("#game thead").append($tr);
    $("#game tbody").empty();

    for (let catIdx = 0; catIdx < width; catIdx++) {
        $tr.append($("<th>").text(categories[catIdx].title));
    }

    for (let clueIdx = 0; clueIdx < height; clueIdx++) {
        let $tr = $("<tr>");
        for (let catIdx = 0; catIdx < width; catIdx++) {
        $tr.append($("<td>").attr("id", `${catIdx}-${clueIdx}`).text("?"));
        }
        $("#game").append($tr);
        $("#tbody").append($tr);

    }
    // $("#game").append($tr);
    // $("#tbody").append($tr);
    // let row = document.createElement("tr");
    // for (let x = 0; x < width; x++) {
    //     const cell = document.createElement("td");
    //     cell.setAttribute("id", `${x}-${y}`);
    //     row.append(cell);
    // }
//}
}

// Handle clicking on a clue: show the question or answer.
 async function handleClick(event) {
     let id = event.target.id;
     let [catId, clueId] = id.split("-");
     let clue = categories[catId].clues[clueId];
     let msg;

// Uses .showing property on clue to determine what to show:
// if currently null, show question & set .showing to "question"
// if currently "question", show answer & set .showing to "answer"
// if currently "answer", ignore click
     if (!clue.showing) {
         msg = clue.question;
         clue.showing = "question";
     } else if(clue.showing === "question") {
         msg = clue.answer;
         clue.showing = "answer";
     } 
    $(`#${catId}-${clueId}`).html(msg);
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */
// function hideLoadingView() {

//}
// function hideLoadingView() {}
// https://stackoverflow.com/questions/656082/dynamically-hide-form-on-submit
// https://www.w3schools.com/jquery/tryit.asp?filename=tryjquery_eff_show_hide_speed
// https://www.qodo.co.uk/blog/javascript-enabling-and-disabling-form-field-elements/

let button = document.querySelector('button');
button.addEventListener('click', function () {
    button.classList.add('spin');
    button.disabled = true;
    $("#game").hide();
    // This disables the whole form via the fieldset
    // $("#game").disabled = true;
    window.setTimeout(function () {
        button.classList.remove('spin');
        button.disabled = false;
        $("#game").show();
    }, 1000);
}, false);

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */
async function setupAndStart() {
    let categoryIds = await getCategoryIds();
    for (let id of categoryIds) {
        categories.push(await getCategory(id));
    }
    fillTable();
}

/** On click of start / restart button, set up game. */
$("#restart").on("click",setupAndStart);

/** On page load, add event handler for clicking clues */
$(async function () {
    setupAndStart();
    $("#game").on("click", "td", handleClick);
}); 