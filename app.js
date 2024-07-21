const player_one_board_element = document.getElementById('player_one_board');
const player_two_board_element = document.getElementById('player_two_board');
const cell_size = 35;
const cell_count_x_y = 10;

let player_one_board_left = player_one_board_element.getBoundingClientRect().left;
let player_one_board_top = player_one_board_element.getBoundingClientRect().top;
let count_of_cells = 100;

const ship_coordinates = {};
const ship_first_put = {};
let old_unavailable_cells = {};

let first_player_stat_board = document.getElementById('player_one_ships_stat');
let first_player_stat_board_top_coordinate = first_player_stat_board.getBoundingClientRect().top;


const started_ship_coordinates = {
    'ship_1_1': {left:50, top: first_player_stat_board_top_coordinate + cell_size},
    'ship_1_2': {left:100, top: first_player_stat_board_top_coordinate + cell_size},
    'ship_1_3': {left:150, top: first_player_stat_board_top_coordinate + cell_size},
    'ship_1_4': {left:200, top: first_player_stat_board_top_coordinate + cell_size},

    'ship_2_1': {left:50, top: first_player_stat_board_top_coordinate + cell_size * 2.5},
    'ship_2_2': {left:125, top: first_player_stat_board_top_coordinate + cell_size * 2.5},
    'ship_2_3': {left:200, top: first_player_stat_board_top_coordinate + cell_size * 2.5},

    'ship_3_1': {left:50, top: first_player_stat_board_top_coordinate + cell_size * 4},
    'ship_3_2': {left:50, top: first_player_stat_board_top_coordinate + cell_size * 5.5},
    'ship_3_3': {left:50, top: first_player_stat_board_top_coordinate + cell_size * 7},

    'ship_4': {left:50, top: first_player_stat_board_top_coordinate + cell_size * 8.5},

}

function generateHTMLBoardGridForBothPlayers() {
    while (count_of_cells > 0) {
        player_one_board_element.insertAdjacentHTML("afterbegin", `<div id=id${count_of_cells} class="droppable"></div>`);
        player_two_board_element.insertAdjacentHTML("afterbegin", `<div id=id${count_of_cells} class="droppable"></div>`);
        count_of_cells--;
    }
}

generateHTMLBoardGridForBothPlayers();

const ships_elements = document.querySelectorAll(".ship");

ships_elements.forEach((ship) => {

    ship.style.left = started_ship_coordinates[ship.id].left + 'px';
    ship.style.top = started_ship_coordinates[ship.id].top + 'px';

    let currentDroppable = null;
    let isShipInsideBoard = false;

    ship.onmousedown = function (e) { // добавляем слушатель события на корабль нажатия мышки
        ship.style.zIndex = 101;
        let shiftX = e.clientX - ship.getBoundingClientRect().left; //сдвиг по оси Х
        let shiftY = e.clientY - ship.getBoundingClientRect().top; //сдвиг по оси У
        let isInDropZone = false;

        if(isShipInsideBoard){
            setDroppableClassToCell(old_unavailable_cells[ship.id])
            old_unavailable_cells[ship.id] = []
        }
        
        moveAt(e.pageX, e.pageY);
        let new_left = 
            ship_coordinates[ship.id] 
                ? document.getElementById(`id${ship_coordinates[ship.id][0]}`).getBoundingClientRect().left - player_one_board_left
                : 0;

        let new_top = 
            ship_coordinates[ship.id] 
                ? document.getElementById(`id${ship_coordinates[ship.id][0]}`).getBoundingClientRect().top - player_one_board_top 
                : 0;

        function moveAt(pageX, pageY) {
            ship.style.left =  pageX - shiftX - (isShipInsideBoard ? player_one_board_left : 0) + 'px';
            ship.style.top = pageY - shiftY - (isShipInsideBoard ? player_one_board_top : 0) + 'px';
        }

        function onMouseMove(e) {
            moveAt(e.pageX, e.pageY);
            ship.hidden = true;
            let elemBelow = document.elementFromPoint(e.clientX, e.clientY);
            ship.hidden = false;

            if (!elemBelow) return;

            let droppableBelow = elemBelow.closest('.droppable');

            if(isShipInsideBoard){
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

                player_one_board_element.append(ship);
                ship.style.left = new_left + 'px';
                ship.style.top = new_top + 'px';
                isShipInsideBoard = true;
                writeShipCoordinates(new_top, new_left, ship);
                setCellsUnavailableToSetShip(getUnavailableCells(ship_coordinates[ship.id], ship));
            }
        }
        ship.ondragstart = function () {
            return false;
        }
    }
})

function getStartedId(top_coordinate, left_coordinate) {
    let id = '';
    if (top_coordinate / 35 === 0) {
        id = String(left_coordinate / 35 + 1)
    } else if(left_coordinate/35 + 1 === 10){
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

function getUnavailableCells(ship_coordinate_arr, ship) {
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
        setDroppableClassToCell(old_unavailable_cells[ship.id])
    }

    old_unavailable_cells[ship.id] = unavailable_cells;


    return unavailable_cells;
}

function setCellsUnavailableToSetShip(coordinates) {
    coordinates.forEach((id) => {
        if (document.getElementById(`id${id}`)) {
            document.getElementById(`id${id}`).classList.toggle("droppable");
            document.getElementById(`id${id}`).style.background = 'teal';
        }
    })
}

function setDroppableClassToCell(coordinates) {
    coordinates.forEach((id) => {
        if (document.getElementById(`id${id}`)) {
            document.getElementById(`id${id}`).classList.add("droppable");
            document.getElementById(`id${id}`).style.background = 'gray';
        }
    })
}

function setCoordinatesToShip(ship, top_coordinate, left_coordinate){
    ship.style.left = top_coordinate + 'px';
    ship.style.top = left_coordinate + 'px';
}
