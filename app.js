const player_one_board_element = document.getElementById('player_one_board');
const player_two_board_element = document.getElementById('player_two_board');
const confirmation_modal = document.getElementById('confirmation_modal');
const is_confirmation_modal_opened_first_time = {
    player_one: true,
    player_two: true
}
const cell_size = 35;
const cell_count_x_y = 10;

let player_one_board_left = player_one_board_element.getBoundingClientRect().left;
let player_one_board_top = player_one_board_element.getBoundingClientRect().top;

let player_two_board_left = player_two_board_element.getBoundingClientRect().left;
let player_two_board_top = player_two_board_element.getBoundingClientRect().top;
let count_of_cells = 100;

const ship_coordinates = {};
const ship_first_put = {};
let old_unavailable_cells = {};

const ship_inside_board_count = {
    player_one: 0,
    player_two: 0
};

let first_player_stat_board = document.getElementById('player_one_ships_stat');
let first_player_stat_board_top_coordinate = first_player_stat_board.getBoundingClientRect().top;

let second_player_stat_board = document.getElementById('player_two_ships_stat');
let second_player_stat_board_top_coordinate = second_player_stat_board.getBoundingClientRect().top;

const started_ship_coordinates = {
    'ship_player_one_1_1': { left: 50, top: first_player_stat_board_top_coordinate + cell_size },
    'ship_player_one_1_2': { left: 100, top: first_player_stat_board_top_coordinate + cell_size },
    'ship_player_one_1_3': { left: 150, top: first_player_stat_board_top_coordinate + cell_size },
    'ship_player_one_1_4': { left: 200, top: first_player_stat_board_top_coordinate + cell_size },

    'ship_player_one_2_1': { left: 50, top: first_player_stat_board_top_coordinate + cell_size * 2.5 },
    'ship_player_one_2_2': { left: 125, top: first_player_stat_board_top_coordinate + cell_size * 2.5 },
    'ship_player_one_2_3': { left: 200, top: first_player_stat_board_top_coordinate + cell_size * 2.5 },

    'ship_player_one_3_1': { left: 50, top: first_player_stat_board_top_coordinate + cell_size * 4 },
    'ship_player_one_3_2': { left: 50, top: first_player_stat_board_top_coordinate + cell_size * 5.5 },

    'ship_player_one_4': { left: 50, top: first_player_stat_board_top_coordinate + cell_size * 7 },

    'ship_player_two_1_1': { right: 50, top: first_player_stat_board_top_coordinate + cell_size },
    'ship_player_two_1_2': { right: 100, top: first_player_stat_board_top_coordinate + cell_size },
    'ship_player_two_1_3': { right: 150, top: first_player_stat_board_top_coordinate + cell_size },
    'ship_player_two_1_4': { right: 200, top: first_player_stat_board_top_coordinate + cell_size },

    'ship_player_two_2_1': { right: 50, top: first_player_stat_board_top_coordinate + cell_size * 2.5 },
    'ship_player_two_2_2': { right: 125, top: first_player_stat_board_top_coordinate + cell_size * 2.5 },
    'ship_player_two_2_3': { right: 200, top: first_player_stat_board_top_coordinate + cell_size * 2.5 },

    'ship_player_two_3_1': { right: 50, top: first_player_stat_board_top_coordinate + cell_size * 4 },
    'ship_player_two_3_2': { right: 50, top: first_player_stat_board_top_coordinate + cell_size * 5.5 },

    'ship_player_two_4': { right: 50, top: first_player_stat_board_top_coordinate + cell_size * 7 },
}


function generateHTMLBoardGridForBothPlayers() {
    while (count_of_cells > 0) {
        player_one_board_element.insertAdjacentHTML("afterbegin", `<div id='player_one_${count_of_cells}' class="droppable_player_one"></div>`);
        player_two_board_element.insertAdjacentHTML("afterbegin", `<div id='player_two_${count_of_cells}' class="droppable_player_two"></div>`);
        count_of_cells--;
    }
}

generateHTMLBoardGridForBothPlayers();

const ships_elements = [...document.querySelectorAll(".ship")];

ships_elements.slice(0, 10).forEach((ship) => {

    ship.style.left = started_ship_coordinates[ship.id].left + 'px';
    ship.style.top = started_ship_coordinates[ship.id].top + 'px';

    let currentDroppable = null;
    let isShipInsideBoard = false;

    ship.onmousedown = function (e) { // добавляем слушатель события на корабль нажатия мышки
        ship.style.zIndex = 101;
        let shiftX = e.clientX - ship.getBoundingClientRect().left; //сдвиг по оси Х
        let shiftY = e.clientY - ship.getBoundingClientRect().top; //сдвиг по оси У
        let isInDropZone = false;

        if (isShipInsideBoard) {
            setDroppableClassToCell(old_unavailable_cells[ship.id], 'one')
            old_unavailable_cells[ship.id] = []
        }

        moveAt(e.pageX, e.pageY);
        let new_left =
            ship_coordinates[ship.id]
                ? document.getElementById(`player_one_${ship_coordinates[ship.id][0]}`).getBoundingClientRect().left - player_one_board_left
                : 0;

        let new_top =
            ship_coordinates[ship.id]
                ? document.getElementById(`player_one_${ship_coordinates[ship.id][0]}`).getBoundingClientRect().top - player_one_board_top
                : 0;

        function moveAt(pageX, pageY) {
            ship.style.left = pageX - shiftX - (isShipInsideBoard ? player_one_board_left : 0) + 'px';
            ship.style.top = pageY - shiftY - (isShipInsideBoard ? player_one_board_top : 0) + 'px';
        }

        function onMouseMove(e) {
            moveAt(e.pageX, e.pageY);
            ship.hidden = true;
            let elemBelow = document.elementFromPoint(e.clientX, e.clientY);
            ship.hidden = false;

            if (!elemBelow) return;

            let droppableBelow = elemBelow.closest('.droppable_player_one');

            if (isShipInsideBoard) {
                currentDroppable = droppableBelow;
                if (currentDroppable) {
                    isInDropZone = true;
                    new_left = Math.floor((e.pageX - player_one_board_left) / cell_size) * cell_size;
                    new_top = Math.floor(Math.abs((e.pageY - player_one_board_top)) / cell_size) * cell_size;
                }
            }

            if (currentDroppable != droppableBelow) {
                if (currentDroppable) {
                    isInDropZone = false;
                }

                currentDroppable = droppableBelow;
                if (currentDroppable) {
                    isInDropZone = true;
                    new_left = Math.floor((e.pageX - player_one_board_left) / cell_size) * cell_size;
                    new_top = Math.floor(Math.abs((e.pageY - player_one_board_top)) / cell_size) * cell_size;
                }
            }
        }

        document.addEventListener("mousemove", onMouseMove);

        ship.onmouseup = function () {
            document.removeEventListener("mousemove", onMouseMove);
            ship.onmouseup = null;
            ship.style.zIndex = 100;

            if (!isInDropZone && !isShipInsideBoard) {
                moveAt(
                    started_ship_coordinates[ship.id].left + shiftX,
                    started_ship_coordinates[ship.id].top + shiftY
                );
            }
            else {
                let max_available_coordinate_to_set_left = (cell_count_x_y - ship.getBoundingClientRect().width / cell_size) * cell_size;

                if (new_left > max_available_coordinate_to_set_left) {
                    new_left = max_available_coordinate_to_set_left
                }

                if (!isShipInsideBoard) {
                    console.log('object');
                    player_one_board_element.append(ship);
                }
                ship.style.left = new_left + 'px';
                ship.style.top = new_top + 'px';
                isShipInsideBoard = true;
                writeShipCoordinates(new_top, new_left, ship);
                setCellsUnavailableToSetShip(
                    getUnavailableCells(ship_coordinates[ship.id], ship, 'one'),
                    'one'
                );
                subscribeOnParentElementUpdate(player_one_board_element, 'one');
                switchPlayerTurnToSetShips()
            }
        }
        ship.ondragstart = function () {
            return false;
        }
    }
})

// ships_elements.slice(10, ships_elements.length).forEach((ship) => {

//     ship.style.right = started_ship_coordinates[ship.id].right + 'px';
//     ship.style.top = started_ship_coordinates[ship.id].top + 'px';

//     let currentDroppable = null;
//     let isShipInsideBoard = false;

//     ship.onmousedown = function (e) { // добавляем слушатель события на корабль нажатия мышки
//         ship.style.zIndex = 101;
//         let shiftX = e.clientX - ship.getBoundingClientRect().left; //сдвиг по оси Х
//         let shiftY = e.clientY - ship.getBoundingClientRect().top; //сдвиг по оси У
//         let isInDropZone = false;

//         if (isShipInsideBoard) {
//             setDroppableClassToCell(old_unavailable_cells[ship.id], 'two')
//             old_unavailable_cells[ship.id] = []
//         }

//         moveAt(e.pageX, e.pageY);
//         let new_left =
//             ship_coordinates[ship.id]
//                 ? document.getElementById(`player_two_${ship_coordinates[ship.id][0]}`).getBoundingClientRect().left - player_two_board_left
//                 : 0;

//         let new_top =
//             ship_coordinates[ship.id]
//                 ? document.getElementById(`player_two_${ship_coordinates[ship.id][0]}`).getBoundingClientRect().top - player_two_board_top
//                 : 0;

//         function moveAt(pageX, pageY) {
//             ship.style.left = pageX - shiftX - (isShipInsideBoard ? player_two_board_left : 0) + 'px';
//             ship.style.top = pageY - shiftY - (isShipInsideBoard ? player_two_board_top : 0) + 'px';
//         }

//         function onMouseMove(e) {
//             moveAt(e.pageX, e.pageY);
//             ship.hidden = true;
//             let elemBelow = document.elementFromPoint(e.clientX, e.clientY);
//             ship.hidden = false;

//             if (!elemBelow) return;

//             let droppableBelow = elemBelow.closest('.droppable_player_two');

//             if (isShipInsideBoard) {
//                 currentDroppable = droppableBelow;
//                 if (currentDroppable) {
//                     isInDropZone = true;
//                     new_left = Math.floor((e.pageX - player_two_board_left) / cell_size) * cell_size;
//                     new_top = Math.floor(Math.abs((e.pageY - player_two_board_top)) / cell_size) * cell_size;
//                 }
//             }

//             if (currentDroppable != droppableBelow) {
//                 if (currentDroppable) {
//                     isInDropZone = false;
//                 }

//                 currentDroppable = droppableBelow;
//                 if (currentDroppable) {
//                     isInDropZone = true;
//                     new_left = Math.floor((e.pageX - player_two_board_left) / cell_size) * cell_size;
//                     new_top = Math.floor(Math.abs((e.pageY - player_two_board_top)) / cell_size) * cell_size;
//                 }
//             }
//         }

//         document.addEventListener("mousemove", onMouseMove);

//         ship.onmouseup = function () {
//             document.removeEventListener("mousemove", onMouseMove);
//             ship.onmouseup = null;
//             ship.style.zIndex = 100;

//             if (!isInDropZone && !isShipInsideBoard) {
//                 moveAt(
//                     started_ship_coordinates[ship.id].left + shiftX,
//                     started_ship_coordinates[ship.id].top + shiftY
//                 );
//             }
//             else {
//                 let max_available_coordinate_to_set_left = (cell_count_x_y - ship.getBoundingClientRect().width / cell_size) * cell_size;

//                 if (new_left > max_available_coordinate_to_set_left) {
//                     new_left = max_available_coordinate_to_set_left
//                 }

// if(!isShipInsideBoard){
//     console.log('object');
//     player_two_board_element.append(ship);
// }
//          
//                 ship.style.left = new_left + 'px';
//                 ship.style.top = new_top + 'px';
//                 isShipInsideBoard = true;
//                 writeShipCoordinates(new_top, new_left, ship);
//                 setCellsUnavailableToSetShip(
//                     getUnavailableCells(ship_coordinates[ship.id], ship, 'two'), 
//                     'two'
//                 );
//subscribeOnParentElementUpdate(player_two_board_element,'two')                  
//             }
//         }
//         ship.ondragstart = function () {
//             return false;
//         }
//     }
// })

function getStartedId(top_coordinate, left_coordinate) {
    let id = '';
    if (top_coordinate / 35 === 0) {
        id = String(left_coordinate / 35 + 1)
    } else if (left_coordinate / 35 + 1 === 10) {
        id = String((top_coordinate / 35) + 1) + '0';
    } else {
        id = String(top_coordinate / 35) + String(left_coordinate / 35 + 1)
    }
    return +id;
}

function writeShipCoordinates(top_coordinate, left_coordinate, ship) {
    let coordinates = [getStartedId(top_coordinate, left_coordinate)];
    if (ship_coordinates[ship.id]) {
        ship_first_put[ship.id] = false;
    }
    for (let i = 1; i < ship.getBoundingClientRect().width / cell_size; i++) {
        coordinates.push(coordinates[0] + i)
    }
    ship_coordinates[ship.id] = coordinates;
}

function collectAllShipCoordinates() {
    let collected_ship_coordinates = [];
    for (const key in ship_coordinates) {
        collected_ship_coordinates = [...collected_ship_coordinates, ...ship_coordinates[key]];
    }
}

function getUnavailableCells(ship_coordinate_arr, ship, player_number) {
    const unavailable_cells = [...ship_coordinate_arr];
    let is_ship_at_the_left_wall = String(ship_coordinate_arr[0]).endsWith('1');
    let is_ship_at_the_right_wall = String(ship_coordinate_arr[ship_coordinate_arr.length - 1]).endsWith('0')

    for (let i = 1; i <= ship_coordinate_arr.length; i++) {
        let is_ship_ends_at_the_right_wall = String(ship_coordinate_arr[0] + i).endsWith('1')
        if (i === 1) {
            unavailable_cells.push(
                ship_coordinate_arr[0] + 10,
                ship_coordinate_arr[0] - 10,
            )

            is_ship_at_the_right_wall && ship_coordinate_arr.length === 1
                ? ''
                : unavailable_cells.push(
                    ship_coordinate_arr[0] - 10 + 1,
                    ship_coordinate_arr[0] + 10 + 1,
                )

            is_ship_at_the_left_wall
                ? ''
                : unavailable_cells.push(
                    ship_coordinate_arr[0] - 1,
                    ship_coordinate_arr[0] + 10 - 1,
                    ship_coordinate_arr[0] - 10 - 1
                )
            is_ship_at_the_right_wall
                ? ''
                :
                unavailable_cells.push(
                    ship_coordinate_arr[0] + ship_coordinate_arr.length
                )

        } else {
            is_ship_ends_at_the_right_wall
                ? ''
                : unavailable_cells.push(
                    ship_coordinate_arr[0] + 10 + i,
                    ship_coordinate_arr[0] - 10 + i,
                )
        }
    }

    if (old_unavailable_cells[ship.id]) {
        setDroppableClassToCell(old_unavailable_cells[ship.id], player_number)
    }

    old_unavailable_cells[ship.id] = unavailable_cells;


    return unavailable_cells;
}

function setCellsUnavailableToSetShip(coordinates, player_number) {
    coordinates.forEach((id) => {
        if (document.getElementById(`player_${player_number}_${id}`)) {
            document.getElementById(`player_${player_number}_${id}`).classList.remove(`droppable_player_${player_number}`);
            document.getElementById(`player_${player_number}_${id}`).classList.add("line");
            // document.getElementById(`player_${player_number}_${id}`).style.background = 'teal';
        }
    })
}

function setDroppableClassToCell(coordinates, player_number) {
    coordinates.forEach((id) => {
        if (document.getElementById(`player_${player_number}_${id}`)) {
            document.getElementById(`player_${player_number}_${id}`).classList.add(`droppable_player_${player_number}`);
            // document.getElementById(`player_${player_number}_${id}`).style.background = 'gray';
            document.getElementById(`player_${player_number}_${id}`).classList.remove("line");
        }
    })
}

function setCoordinatesToShip(ship, top_coordinate, left_coordinate) {
    ship.style.left = top_coordinate + 'px';
    ship.style.top = left_coordinate + 'px';
}

function subscribeOnParentElementUpdate(player_board_element, player_number) {
    ship_inside_board_count[`player_${player_number}`] = player_board_element.childElementCount - 100;
    console.log('ship_inside_board_count', ship_inside_board_count);
}

function switchPlayerTurnToSetShips() {
    if (ship_inside_board_count.player_one === 2) {
        console.log('object');
        is_confirmation_modal_opened_first_time.player_one = false;
        confirmation_modal.classList.remove('hidden');
        document.getElementById('cancel').addEventListener('click', onCancelhipPlacement, { once: true });
        document.getElementById('confirm').addEventListener('click', (e)=>onConfirmShipPlacement(e, 'one'), { once: true });
    }

    if (ship_inside_board_count.player_two === 10) {
        startGame()
    }
}

function startGame() {
    alert('start!')
}

function onCancelhipPlacement() {
    confirmation_modal.style.top = '80px'
}

function onConfirmShipPlacement(_e, player_number) {
    confirmation_modal.classList.add('hidden');
    hidePlayerShips(player_number);
}

function hidePlayerShips(player_number) {
    document.querySelectorAll(`#player_${player_number}_board .ship`).forEach(ship=>ship.classList.add("hidden"));
    document.querySelectorAll(`#player_${player_number}_board .line`).forEach(element_with_line=>element_with_line.classList.remove('line'))
}