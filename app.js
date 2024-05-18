const player_one_board_element = document.getElementById('player_one_board');
const player_two_board_element = document.getElementById('player_two_board');
const battleship_element = document.getElementById('battleship');
const cell_size = 35;

let count_of_cells = 100;

function generateHTMLBoardGridForBothPlayers() {
    while (count_of_cells > 0) {
        player_one_board_element.insertAdjacentHTML("afterbegin", `<div id=id${count_of_cells} class="droppable"></div>`);
        player_two_board_element.insertAdjacentHTML("afterbegin", `<div id=id${count_of_cells}></div>`);
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
console.log(85/35);
    function onMouseMove(e) {
        moveAt(e.pageX, e.pageY);
        battleship_element.hidden = true;
        let elemBelow = document.elementFromPoint(e.clientX, e.clientY);
        battleship_element.hidden = false;

        if (!elemBelow) return;

        // потенциальные цели переноса помечены классом droppable (может быть и другая логика)
        let droppableBelow = elemBelow.closest('.droppable');
        if (currentDroppable != droppableBelow) {
            // мы либо залетаем на цель, либо улетаем из неё
            // внимание: оба значения могут быть null
            //   currentDroppable=null,
            //     если мы были не над droppable до этого события (например, над пустым пространством)
            //   droppableBelow=null,
            //     если мы не над droppable именно сейчас, во время этого события

            if (currentDroppable) {
                // логика обработки процесса "вылета" из droppable
                isInDropZone = false;
            }
            currentDroppable = droppableBelow;
            if (currentDroppable) {
                // логика обработки процесса "в дроп зоне"
                isInDropZone = true;
                // player_one_board_element.insertAdjacentHTML('beforebegin',`<img class="cell_4 ship" src="/images/4_cell_ship.jpg" alt="4cell_ship">`)
                console.log('battleship_element.getBoundingClientRect(left)', battleship_element.getBoundingClientRect().left, 'left');
                console.log('battleship_element.getBoundingClientRect(left)', battleship_element.getBoundingClientRect().top, 'top');
                console.log(player_one_board_element.getBoundingClientRect().top, 'y');
                console.log(player_one_board_element.getBoundingClientRect().left, 'x');
                //295 - 330 = 0 ( 330 - 295)
                //331 - 366 = 35 (366 - 35)
                //148 - 160 = -12/35 => -0 * 35 => 0
                //206 - 160 = 46 / 35 => 1 * 35 => 35
                // battleship_element.getBoundingClientRect().left
                /* 
                   for test ship = 320  // 380
                   board = 295
                   координат относительно доски 320 - 295 = 25
                   Math.floor(25 / 35) => 0 * 35 => 0
                   if(25<=35) new_left = Math.floor(25 / 35) => 0 * 35 => 0

                       for test ship = 380
                   board = 295
                   координат относительно доски 380 - 295 = 85
                   Math.floor(85 / 35) => 2 * 35 = 70
                   if(85<=140) new_left =  Math.floor(85 / 35) => 2 * 35 = 70

                    for test ship = 400
                   board = 295
                   координат относительно доски 400 - 295 = 105
                   if(105<=105) new_left =   Math.floor(105 / 35) => 3 * 35 = 105
                */
                  new_left =  Math.floor((battleship_element.getBoundingClientRect().left - player_one_board_element.getBoundingClientRect().left)/cell_size) * cell_size;
                  new_top =  Math.floor(Math.abs((battleship_element.getBoundingClientRect().top - player_one_board_element.getBoundingClientRect().top))/cell_size) * cell_size;

                   //old
                // if(battleship_element.getBoundingClientRect().left >= 295 && battleship_element.getBoundingClientRect().left < (295 + 35) ){
                //     new_left = 0
                // }else if(battleship_element.getBoundingClientRect().left >= 330 && battleship_element.getBoundingClientRect().left < (295 + 35 + 35) ){
                //     new_left = 35
                // }else if(battleship_element.getBoundingClientRect().left >= 365 && battleship_element.getBoundingClientRect().left < (295 + 35 + 35 + 35) ){
                //     new_left = 70
                // }else if(battleship_element.getBoundingClientRect().left >= 400 && battleship_element.getBoundingClientRect().left < (295 + 35 + 35 + 35 +35) ){
                //     new_left = 105
                // }
                // логика обработки процесса, когда мы "влетаем" в элемент droppable
                //   enterDroppable(currentDroppable);
            }
        }
        console.log(isInDropZone);
    }

    document.addEventListener("mousemove", onMouseMove);

    battleship_element.onmouseup = function () {
        console.log('onmouseup');
        document.removeEventListener("mousemove", onMouseMove);
        battleship_element.onmouseup = null;

        if (!isInDropZone) {
            moveAt(shiftX,shiftY);
        }
        // else{
        //     console.log('esle');
        //     console.log(e.pageX, e.pageY);
        //     if(battleship_element.getBoundingClientRect().left > 295 && battleship_element.getBoundingClientRect().left < (295 + 35) ){
        //         new_left = 0
        //         moveAt(e.pageX, shiftY);
        //     }else if(battleship_element.getBoundingClientRect().left > 331 && battleship_element.getBoundingClientRect().left < (295 + 35 + 35) ){
        //         // new_left = 35
        //         moveAt(e.pageX + 35,shiftY);
        //     }else if(battleship_element.getBoundingClientRect().left > 366 && battleship_element.getBoundingClientRect().left < (295 + 35 + 35 + 35) ){
        //         // new_left = 70
        //         moveAt(e.pageX + 70,shiftY);
        //     }
            
        // }
        else{
            console.log('in zone');
            battleship_element.style.display = 'none';
            // battleship_element.onmousedown = null;
            player_one_board_element.insertAdjacentHTML('beforeend',
            `<img style="left: ${new_left}px; top: ${new_top}px" class="cell_4 ship" src="/images/4_cell_ship.jpg" alt="4cell_ship" >`);
            } 
        }
}


battleship_element.ondragstart = function () {
    return false;
}
