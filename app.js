const player_one_board_element = document.getElementById('player_one_board');
const player_two_board_element = document.getElementById('player_two_board');
const battleship_element = document.getElementById('battleship');
const cell_size = 35;
const cell_count_x_y = 10;

let count_of_cells = 100;

function generateHTMLBoardGridForBothPlayers() {
    while (count_of_cells > 0) {
        player_one_board_element.insertAdjacentHTML("afterbegin", `<div id=id${count_of_cells} class="droppable"></div>`);
        player_two_board_element.insertAdjacentHTML("afterbegin", `<div id=id${count_of_cells} class="droppable"></div>`);
        count_of_cells--;
    }
}

generateHTMLBoardGridForBothPlayers();


let currentDroppable = null;

battleship_element.onmousedown = function (e) { // добавляем слушатель события на корабль нажатия мышки
    let shiftX = e.clientX - battleship_element.getBoundingClientRect().left; //сдвиг по оси Х
    let shiftY = e.clientY - battleship_element.getBoundingClientRect().top; //сдвиг по оси У
    let isInDropZone = false;

    moveAt(e.pageX, e.pageY);
    let new_left = 0;
    let new_top = 0;

    function moveAt(pageX, pageY) {
        battleship_element.style.left = pageX - shiftX + 'px';
        battleship_element.style.top = pageY - shiftY + 'px';
    }

    function onMouseMove(e) {
        moveAt(e.pageX, e.pageY);
        battleship_element.hidden = true;
        let elemBelow = document.elementFromPoint(e.clientX, e.clientY);
        battleship_element.hidden = false;

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

    battleship_element.onmouseup = function () {
        document.removeEventListener("mousemove", onMouseMove);//отвязываем обработчик события на mousemove
        battleship_element.onmouseup = null; //отвязываем обработчик события на onmouseup

        if (!isInDropZone) {//если мы не внутри поля боя
            moveAt(shiftX, shiftY); //вернуть корабль на исходную позицию
        } else {//если внутри поля боя
            //от кол-ва ячеек по горизонтали одной линии отнимаем ширину корабля деленную на размер ячейки
            //разницу множим на 35  и сравниваем координаты new_left и максимально доступную ячейку для установки
            let max_available_coordinate_to_set_left = (cell_count_x_y - battleship_element.getBoundingClientRect().width / cell_size) * cell_size;

            if (new_left > max_available_coordinate_to_set_left) {
                new_left = max_available_coordinate_to_set_left
                //ставим координаты максимально доступные для корабля
            }

            battleship_element.style.display = 'none';
            player_one_board_element.insertAdjacentHTML('beforeend',
                `<img style="left: ${new_left}px; top: ${new_top}px" class="cell_4 ship"  src="/images/4_cell_ship.jpg" alt="4cell_ship" id="new_ship_4_cell"; >`);
            let new_ship_insight_board = document.getElementById("new_ship_4_cell");
            console.log(new_ship_insight_board);

            new_ship_insight_board.onmousedown = function (e) {
                dragNDropForShipInField(e, new_ship_insight_board)
            };
        }
    }
    battleship_element.ondragstart = function () {
        return false;
    }
}


function dragNDropForShipInField(e, ship_element) {
    let shiftX = e.clientX - ship_element.getBoundingClientRect().left; //сдвиг по оси Х
    let shiftY = e.clientY - ship_element.getBoundingClientRect().top; //сдвиг по оси У

    let aligned_top_coordinate = 0;
    let aligned_left_coordinate = 0;

    moveAt(e.pageX, e.pageY);
    function moveAt(pageX, pageY) {
        ship_element.style.left = pageX - player_one_board_element.getBoundingClientRect().left - shiftX + 'px';
        ship_element.style.top = pageY -  player_one_board_element.getBoundingClientRect().top - shiftY + 'px';
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
            console.log('droppableBelow',droppableBelow);
           
        }
        let max_available_coordinate_to_set_left = (cell_count_x_y - ship_element.getBoundingClientRect().width / cell_size) * cell_size;
        let max_available_coordinate_to_set_top = (cell_count_x_y - ship_element.getBoundingClientRect().height / cell_size) * cell_size;
        let new_coordinate_left = ship_element.getBoundingClientRect().left - player_one_board_element.getBoundingClientRect().left + shiftX;
        let new_coordinate_top = ship_element.getBoundingClientRect().top - player_one_board_element.getBoundingClientRect().top + shiftY;
        

        aligned_left_coordinate = Math.floor(new_coordinate_left/cell_size) * cell_size;
        aligned_top_coordinate =  Math.floor(Math.abs(new_coordinate_top/cell_size)) * cell_size;

        
        if(new_coordinate_top<-35){
            aligned_top_coordinate = 0;
        }

        if(new_coordinate_left<0){
            aligned_left_coordinate = 0;
        }

        if(new_coordinate_left>max_available_coordinate_to_set_left){
            aligned_left_coordinate = max_available_coordinate_to_set_left;
        }

        if(new_coordinate_top>max_available_coordinate_to_set_top){
            aligned_top_coordinate = max_available_coordinate_to_set_top;
        }

    }


    //привязка на движение мышкой
    document.addEventListener("mousemove", onMouseMove);
    //отвязываем обработчик события
    ship_element.onmouseup = function () {
        document.removeEventListener("mousemove", onMouseMove);
        ship_element.onmouseup = null;
        ship_element.style.left = aligned_left_coordinate + 'px';
        ship_element.style.top = aligned_top_coordinate + 'px';
    }

    ship_element.ondragstart = function () {
        return false;
    }
}

