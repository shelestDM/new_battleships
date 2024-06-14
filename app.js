const player_one_board_element = document.getElementById('player_one_board');
const player_two_board_element = document.getElementById('player_two_board');
const battleship_element = document.getElementById('battleship');
const cell_size = 35;
const cell_count_x_y = 10;

let count_of_cells = 100;

const ship_coordinates = {}

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
    ship.onmousedown = function (e) { // добавляем слушатель события на корабль нажатия мышки
        let shiftX = e.clientX - ship.getBoundingClientRect().left; //сдвиг по оси Х
        let shiftY = e.clientY - ship.getBoundingClientRect().top; //сдвиг по оси У
        let isInDropZone = false;

        moveAt(e.pageX, e.pageY);
        let new_left = 0;
        let new_top = 0;

        function moveAt(pageX, pageY) {
            ship.style.left = pageX - shiftX + 'px';
            ship.style.top = pageY - shiftY + 'px';
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
                    new_left = Math.floor((e.pageX - player_one_board_element.getBoundingClientRect().left) / cell_size) * cell_size;
                    new_top = Math.floor(Math.abs((e.pageY - player_one_board_element.getBoundingClientRect().top)) / cell_size) * cell_size;
                }
            }
        }

        document.addEventListener("mousemove", onMouseMove);

        ship.onmouseup = function () {
            document.removeEventListener("mousemove", onMouseMove);//отвязываем обработчик события на mousemove
            ship.onmouseup = null; //отвязываем обработчик события на onmouseup

            if (!isInDropZone) {//если мы не внутри поля боя
                moveAt(shiftX, shiftY); //вернуть корабль на исходную позицию
            } else {//если внутри поля боя
                //от кол-ва ячеек по горизонтали одной линии отнимаем ширину корабля деленную на размер ячейки
                //разницу множим на 35  и сравниваем координаты new_left и максимально доступную ячейку для установки
                let max_available_coordinate_to_set_left = (cell_count_x_y - ship.getBoundingClientRect().width / cell_size) * cell_size;

                if (new_left > max_available_coordinate_to_set_left) {
                    new_left = max_available_coordinate_to_set_left
                    //ставим координаты максимально доступные для корабля
                }

                ship.style.display = 'none';
                console.log(ship.className);
                player_one_board_element.insertAdjacentHTML('beforeend',
                    `<img style="left: ${new_left}px; top: ${new_top}px" class="${ship.className}"  src=${ship.src} alt="${ship.id}_ship_image" id="${ship.id}_cell"; >`);
                let new_ship_insight_board = document.getElementById(`${ship.id}_cell`);
                console.log(new_ship_insight_board);

                writeShipCoordinates(new_top, new_left, new_ship_insight_board);
                new_ship_insight_board.onmousedown = function (e) {
                    dragNDropForShipInField(e, new_ship_insight_board)
                };
            }
        }
        ship.ondragstart = function () {
            return false;
        }
    }

    function dragNDropForShipInField(e, ship_element) {
        let shiftX = e.clientX - ship_element.getBoundingClientRect().left; //сдвиг по оси Х
        let shiftY = e.clientY - ship_element.getBoundingClientRect().top; //сдвиг по оси У
        
        let oldShipCoordinate = getAlignedCoordinate(ship_element, player_one_board_element, shiftX, shiftY);

        let aligned_top_coordinate = oldShipCoordinate.top;
        let aligned_left_coordinate = oldShipCoordinate.left;

        let isShipOnShip = false;


        moveAt(e.pageX, e.pageY);
        function moveAt(pageX, pageY) {
            ship_element.style.left = pageX - player_one_board_element.getBoundingClientRect().left - shiftX + 'px';
            ship_element.style.top = pageY - player_one_board_element.getBoundingClientRect().top - shiftY + 'px';
            ship_element.style.zIndex = 110;
        }

        function onMouseMove(e) {// обработчиком события движения мышки
            moveAt(e.pageX, e.pageY);
            ship_element.hidden = true;
            let elemBelow = document.elementFromPoint(e.clientX, e.clientY);
            ship_element.hidden = false;

            if (!elemBelow) return;

            let droppableBelow = elemBelow.closest('.droppable');

            if (currentDroppable != droppableBelow) {

                currentDroppable = droppableBelow;
                if (!currentDroppable && !droppableBelow) {
                    isShipOnShip = true;
                }
            }

            let max_available_coordinate_to_set_left = (cell_count_x_y - ship_element.getBoundingClientRect().width / cell_size) * cell_size;
            let max_available_coordinate_to_set_top = (cell_count_x_y - ship_element.getBoundingClientRect().height / cell_size) * cell_size;
            let new_coordinate_left = ship_element.getBoundingClientRect().left - player_one_board_element.getBoundingClientRect().left + shiftX;
            let new_coordinate_top = ship_element.getBoundingClientRect().top - player_one_board_element.getBoundingClientRect().top + shiftY;

            aligned_left_coordinate = Math.floor(new_coordinate_left / cell_size) * cell_size;
            aligned_top_coordinate = Math.floor(Math.abs(new_coordinate_top / cell_size)) * cell_size;


            if (new_coordinate_top < -35) {
                aligned_top_coordinate = 0;
            }

            if (new_coordinate_left < 0) {
                aligned_left_coordinate = 0;
            }

            if (new_coordinate_left > max_available_coordinate_to_set_left) {
                aligned_left_coordinate = max_available_coordinate_to_set_left;
            }

            if (new_coordinate_top > max_available_coordinate_to_set_top) {
                aligned_top_coordinate = max_available_coordinate_to_set_top;
            }

        }


        //привязка на движение мышкой
        document.addEventListener("mousemove", onMouseMove);
        //отвязываем обработчик события
        ship_element.onmouseup = function () {
            document.removeEventListener("mousemove", onMouseMove);
            ship_element.onmouseup = null;

            if(isShipOnShip){
                ship_element.style.left = oldShipCoordinate.left + 'px';
                ship_element.style.top = oldShipCoordinate.top + 'px';
            }else{
                ship_element.style.left = aligned_left_coordinate + 'px';
                ship_element.style.top = aligned_top_coordinate + 'px';
            }
            ship_element.style.zIndex = 100;
            writeShipCoordinates(aligned_top_coordinate, aligned_left_coordinate, ship_element)
        }

        ship_element.ondragstart = function () {
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
    for (let i = 1; i < ship.getBoundingClientRect().width / cell_size; i++) {
        coordinates.push(coordinates[0] + i)
    }
    ship_coordinates[ship.id] = coordinates;
    console.log(ship_coordinates);

    console.log(getUnavailableCells(coordinates));
    
}

function getAlignedCoordinate(ship_element, player_one_board_element, shiftX, shiftY) {
    let new_coordinate_left = ship_element.getBoundingClientRect().left - player_one_board_element.getBoundingClientRect().left + shiftX;
    let new_coordinate_top = ship_element.getBoundingClientRect().top - player_one_board_element.getBoundingClientRect().top + shiftY;

    return {
        left: Math.floor(new_coordinate_left / cell_size) * cell_size,
        top: Math.floor(Math.abs(new_coordinate_top / cell_size)) * cell_size,
    }
}

function collectAllShipCoordinates (){
    let collected_ship_coordinates = [];
    for (const key in ship_coordinates) {
        collected_ship_coordinates = [...collected_ship_coordinates ,...ship_coordinates[key]];
    }
    console.log(collected_ship_coordinates);
}

function getUnavailableCells(ship_coordinate_arr) {
    const unavailable_cells = [...ship_coordinate_arr];
    let start_coordinate = Math.min(...ship_coordinate_arr);
    let end_coordinate = Math.max(...ship_coordinate_arr);

    ship_coordinate_arr.forEach((id) => {
        if (id === start_coordinate) {
            if(String(id).includes('1')){
                //сделать проверку что если первая клетка и для остальных так же сделать  типа если последняя или крайние туда сюда
            }
            unavailable_cells.push(...[id - 1, id - 11, id - 10, id + 9, id + 10]);
        } else if (id === end_coordinate) {
            unavailable_cells.push(...[id - 10, id - 9, id + 1, id + 10, id + 11]);
        } else {
            unavailable_cells.push(...[id - 10, id + 10])
        }
    })
    console.log(unavailable_cells);
    return unavailable_cells.filter(id=>id>=1);
}

function setCellsUnavailableToSetShip (coordinates) {
    coordinates.forEach((id)=>{
        document.getElementById(`id${id}`).classList.toggle("droppable");
    })
}