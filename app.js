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
    console.log(shiftX);

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
                new_left = Math.floor((e.pageX- player_one_board_element.getBoundingClientRect().left) / cell_size) * cell_size;
                new_top = Math.floor(Math.abs((e.pageY - player_one_board_element.getBoundingClientRect().top )) / cell_size) * cell_size;
            }
        }
    }

    document.addEventListener("mousemove", onMouseMove);

    battleship_element.onmouseup = function () {
        document.removeEventListener("mousemove", onMouseMove);
        battleship_element.onmouseup = null;

        if (!isInDropZone) {
            moveAt(shiftX, shiftY);
        }else {
            if(new_left > (cell_count_x_y - battleship_element.getBoundingClientRect().width/cell_size) * 35){
                new_left = (cell_count_x_y - battleship_element.getBoundingClientRect().width/cell_size) * 35
                console.log('прям очень хорошо расчитано',new_left)
            }
            battleship_element.style.display = 'none';

            player_one_board_element.insertAdjacentHTML(
                'beforeend',
                `<img   
                    style="
                        left: ${new_left}px;
                        top: ${new_top}px
                    " 
                    class="cell_4 ship" 
                    src="/images/4_cell_ship.jpg"
                    alt="4cell_ship"
                    id="new_ship_4_cell"; 
                >`);
            let new_ship_insight_board = document.getElementById("new_ship_4_cell");

            new_ship_insight_board.onmousedown = function(e){
                dragNDropForShipInField(e,new_ship_insight_board)
            };    
        }
    }
    battleship_element.ondragstart = function () {
        return false;
    }
}


function dragNDropForShipInField (e, ship_element){
    let shiftX = e.clientX - ship_element.getBoundingClientRect().left; //сдвиг по оси Х
    let shiftY = e.clientY - ship_element.getBoundingClientRect().top; //сдвиг по оси У

    moveAt(e.pageX, e.pageY);
    function moveAt(pageX, pageY) {
        let top_coordinate_condition = (Math.floor((pageX - player_one_board_element.getBoundingClientRect().left - shiftX) / cell_size) * cell_size) > ship_element.getBoundingClientRect().left - player_one_board_element.getBoundingClientRect().left 
        if(top_coordinate_condition){
            ship_element.style.left = (Math.floor((pageX - player_one_board_element.getBoundingClientRect().left - shiftX) / cell_size) * cell_size) + 'px'
        }
        
    }

    function onMouseMove(e) {
        moveAt(e.pageX, e.pageY);
    }

    document.addEventListener("mousemove", onMouseMove);

    ship_element.onmouseup = function () {
        document.removeEventListener("mousemove", onMouseMove);
        ship_element.onmouseup = null;
    }

    ship_element.ondragstart = function () {
        return false;
    }
}



/* 
координаты поля боя - х - 200 у - 200
координат корабля х -225 у - 210

225 - 200 -> 25x
210 - 200 -> 10y

200 < x < 235  -> new_left = 0
235 < x < 270  -> new_left = 35
305 < x < 340  -> new_left = 70

215 - 200               result = 0
Math.floor((ShipX - BoardX)/35 ) 
-> 0.4 -> 0 * 35 -> 0
270 - 200 -> 70/35 -> 2 *35  -> 70
289 - 200 -> 89/35 -> 2.5 -> 2 * 35 -> 70

332-295 - >37/35 -> 1 * 35 ->35
*/