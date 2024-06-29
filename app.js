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
    let currentDroppable = null;
    let isShipInsideBoard = false;

    ship.onmousedown = function (e) { // добавляем слушатель события на корабль нажатия мышки
        ship.style.zIndex = 101;
        let shiftX = e.clientX - ship.getBoundingClientRect().left; //сдвиг по оси Х
        let shiftY = e.clientY - ship.getBoundingClientRect().top; //сдвиг по оси У
        let isInDropZone = false;

        moveAt(e.pageX, e.pageY);
        let new_left = 0;
        let new_top = 0;

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

            let droppableBelow = elemBelow.closest('.droppable');

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
            
            if (!isInDropZone) {
                moveAt(shiftX, shiftY);
            } else {
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
    } else {
        id = String(top_coordinate / 35) + String(left_coordinate / 35 + 1)
    }
    return +id;
}

function writeShipCoordinates(top_coordinate, left_coordinate, ship) {
    let coordinates = [getStartedId(top_coordinate, left_coordinate)]
    if(ship_coordinates[ship.id]){
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

    for (let i = 1; i <= ship_coordinate_arr.length; i++) {
        if (i === 1) {
            unavailable_cells.push(
                ship_coordinate_arr[0] - 1,
                ship_coordinate_arr[0] + ship_coordinate_arr.length,
                ship_coordinate_arr[0] + 10,
                ship_coordinate_arr[0] - 10,
                ship_coordinate_arr[0] - 10 - 1,
                ship_coordinate_arr[0] - 10 + 1,
                ship_coordinate_arr[0] + 10 + 1,
                ship_coordinate_arr[0] + 10 - 1,
            )
        } else {
            unavailable_cells.push(
                ship_coordinate_arr[0] + 10 + i,
                ship_coordinate_arr[0] - 10 + i,
            )
        }
    }

    if(old_unavailable_cells[ship.id]){
        setDroppableClassToCell(old_unavailable_cells[ship.id])
    }

    old_unavailable_cells[ship.id] = unavailable_cells;


    return unavailable_cells;
}

function setCellsUnavailableToSetShip(coordinates) {
    coordinates.forEach((id) => {
        document.getElementById(`id${id}`).classList.toggle("droppable");
        document.getElementById(`id${id}`).style.background = 'teal';
    })
}

function setDroppableClassToCell(coordinates){
    coordinates.forEach((id)=>{
        document.getElementById(`id${id}`).classList.add("droppable");
        document.getElementById(`id${id}`).style.background = 'white';
    })
}