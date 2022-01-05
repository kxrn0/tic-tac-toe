const gameBoard = (
    function () {
        let turn, count, players;
        let create_board, check_board, check_for_winner, init, select_random_cell, add_listeners, available_spots, minimax, get_board_state;
        const feedbackButtons = document.querySelectorAll(".player");
        const playAgainButton = document.querySelector(".play-again-button");
        const board = document.querySelector(".board");
        const finalScreen = document.querySelector(".game-over-screen");
        const disableScreen = document.querySelector(".disable-screen");

        select_random_cell = (player1, player2) => {
            let value, count;

            count = 0;
            do {
                value = Math.floor(Math.random() * 9);
                count++;
            } while (player1.includes(value) || player2.includes(value) && count < 1000);
            return value;
        }

        available_spots = board => board.filter(cell => typeof cell == "number");

        get_board_state = () => {
            let board = [];

            for (let i = 0; i < 9; i++)
                if (players[0].state.includes(i))
                    board.push(players[0].symbol);
                else if (players[1].state.includes(i))
                    board.push(players[1].symbol);
                else
                    board.push(i);
            return board;
        }

        //minimax algorithm referenced from here : https://www.youtube.com/watch?v=P2TcQ3h0ipQ&t=1s
        minimax = (board, player) => {
            let availableSpots, humanState, robotState, moves, bestMove;

            availableSpots = available_spots(board);
            humanState = [];
            robotState = [];
            for (let i = 0; i < board.length; i++)
                if (board[i] == '×')
                    humanState.push(i);
                else if (board[i] == 'o')
                    robotState.push(i);

            if (check_for_winner(humanState))
                return { score: -10 };
            else if (check_for_winner(robotState))
                return { score: 10 };
            else if (!availableSpots.length)
                return { score: 0 };

            moves = [];
            for (let i = 0; i < availableSpots.length; i++) {
                let move = {};

                move.index = board[availableSpots[i]];
                board[availableSpots[i]] = player;

                if (player == players[1].symbol) {
                    let result = minimax(board, players[0].symbol);
                    move.score = result.score;
                }
                else {
                    let result = minimax(board, players[1].symbol);
                    move.score = result.score;
                }

                board[availableSpots[i]] = move.index;
                moves.push(move);
            }

            if (player == players[1].symbol) {
                let bestScore = -Infinity;

                for (let i = 0; i < moves.length; i++)
                    if (moves[i].score > bestScore) {
                        bestScore = moves[i].score;
                        bestMove = i;
                    }
            }
            else {
                let bestScore = Infinity;

                for (let i = 0; i < moves.length; i++)
                    if (moves[i].score < bestScore) {
                        bestScore = moves[i].score;
                        bestMove = i;
                    }
            }
            return moves[bestMove];
        }

        add_listeners = () => {
            const pads = document.querySelectorAll(".pad");

            pads.forEach(pad => {
                pad.addEventListener("click", () => {
                    if (!pad.innerText) {
                        pad.innerText = players[turn].symbol;
                        pad.classList.remove("tile-on");
                        players[turn].state.push(parseInt(pad.dataset.value));
                        feedbackButtons[turn].classList.remove("lights-on");
                        feedbackButtons[turn].classList.add("lights-off");

                        check_board();

                        turn = (turn + 1) % 2;
                        feedbackButtons[turn].classList.remove("lights-off");
                        feedbackButtons[turn].classList.add("lights-on");
                        count--;

                        if (turn && players[1].smart) {
                            let timeInTheMarket;

                            timeInTheMarket = Math.floor(Math.random() * 500) + 500;

                            disableScreen.classList.remove("hidden");
                            setTimeout(() => {
                                let machineMove, index, boardState;

                                boardState = get_board_state();

                                if (players[1].level == "Easy")
                                    index = select_random_cell(players[0].state, players[1].state);
                                else if (players[1].level == "Medium") {
                                    let rand;

                                    rand = Math.random();
                                    if (rand < .25)
                                        index = select_random_cell(players[0].state, players[1].state);
                                    else
                                        index = minimax(boardState, players[1].symbol).index;
                                }
                                else if (players[1].level == "Hard")
                                    index = minimax(boardState, players[1].symbol).index;

                                machineMove = document.querySelector(`[data-value='${index}']`);
                                if (machineMove)
                                    machineMove.click();
                                disableScreen.classList.add("hidden");
                            }, timeInTheMarket);
                        }
                    }
                });
            });
        }

        create_board = playerObjects => {
            turn = 0;
            count = 8;
            players = playerObjects;
            for (let i = 0; i < 9; i++) {
                let pad;

                pad = document.createElement("div");
                pad.classList.add("pad");
                pad.classList.add("boxed");
                pad.classList.add("tile-on");
                pad.dataset.value = i;
                board.appendChild(pad);
            }

            add_listeners();

            playAgainButton.addEventListener("click", init);
        }

        check_for_winner = (state) => {
            let winner;

            winner = false;

            for (let x = 0; x < 3; x++) {
                winner = true;
                for (let y = 0; y < 3; y++)
                    if (!state.includes(y + 3 * x)) {
                        winner = false
                        break;
                    }
                if (winner)
                    return winner;
            }

            for (let y = 0; y < 3; y++) {
                winner = true;
                for (let x = 0; x < 3; x++)
                    if (!state.includes(y + 3 * x)) {
                        winner = false;
                        break;
                    }
                if (winner)
                    return winner;
            }

            winner = true;
            for (let i = 0; i < 3; i++)
                if (!state.includes(4 * i)) {
                    winner = false;
                    break;
                }
            if (winner)
                return winner;

            winner = true;
            for (let i = 0; i < 3; i++)
                if (!state.includes(2 * (i + 1))) {
                    winner = false;
                    break;
                }
            if (winner)
                return winner;

            return winner;
        }

        init = () => {
            const initCnt = document.querySelector(".init-container");
            const gameUI = document.querySelector(".game-ui");
            const choices = initCnt.querySelectorAll(".init-choice");
            const lights = document.querySelectorAll(".player");
            const aiButton = document.querySelector(".ai-button");
            const aiLevels = document.querySelectorAll(".ai-level");
            const playerName = document.querySelectorAll(".player-name");

            playerName[0].value = "Player1";
            playerName[1].value = "Player2";
            playerName[2].value = "Player1";

            aiLevels.forEach(level => level.checked = false);

            lights[0].classList.remove("lights-off");
            lights[0].classList.add("lights-on");
            lights[1].classList.add("lights-off");
            lights[1].classList.remove("lights-on");
            aiButton.innerText = "AIの力☞";
            aiButton.style.background = "rgb(238, 187, 145)";

            for (let choice of choices) {
                choice.querySelector(".first-stage").classList.remove("hidden");
                choice.querySelector(".second-stage").classList.add("hidden");
                choice.classList.add("active");
                if (choice.classList.contains("hidden")) {
                    choice.classList.remove("hidden");
                }
            }

            finalScreen.classList.add("hidden");
            initCnt.classList.remove("hidden");
            gameUI.classList.add("hidden");
            board.innerHTML = '';

            game.start_screen();
        }

        check_board = () => {
            let gover;

            gover = false;
            for (let player of players)
                if (check_for_winner(player.state)) {
                    gover = true;
                    finalScreen.classList.remove("hidden");
                    document.querySelector(".winner-name").innerText = player.name;
                    break;
                }

            if (!gover && !count) {
                finalScreen.classList.remove("hidden");
                document.querySelector(".winner-name").innerText = "nobody";
            }
        }

        return { create_board };
    }
)();

const game = (
    function () {
        let start_screen;
        let players;

        function activate_windows(aiLevels, aiButton) {
            const aiChoices = aiLevels.querySelectorAll(".ai-level");

            if (aiLevels.classList.contains("inactive")) {
                aiLevels.classList.remove("inactive");
                aiLevels.classList.add("active");

                aiButton.innerText = aiButton.innerText.slice(0, aiButton.innerText.length - 1) + " ☟";
            }

            aiChoices.forEach(choice => choice.addEventListener("click", () => {
                aiButton.innerText = choice.value + "ー☞";

                if (choice.value == "Easy")
                    aiButton.style.background = "#60d9bd";
                else if (choice.value == "Medium")
                    aiButton.style.background = "#dbcc1e";
                else if (choice.value == "Hard")
                    aiButton.style.background = "#f96565";

                aiLevels.classList.remove("active");
                aiLevels.classList.add("inactive");
            }));
        }

        start_screen = () => {
            const choices = document.querySelectorAll(".init-choice");

            for (let i = 0; i < choices.length; i++)
                choices[i].addEventListener("click", () => {
                    let firstStage, secondStage;
                    let aiButton, startButton, fields;
                    let newNormal, j;

                    j = (i + 1) % choices.length;
                    choices[j].classList.add("hidden");

                    newNormal = choices[i].cloneNode(true);
                    choices[i].parentNode.replaceChild(newNormal, choices[i]);
                    newNormal.classList.remove("active");

                    firstStage = newNormal.querySelector(".first-stage");
                    secondStage = newNormal.querySelector(".second-stage");
                    startButton = secondStage.querySelector(".start-button");

                    firstStage.classList.add("hidden");
                    secondStage.classList.remove("hidden");

                    fields = document.querySelectorAll(".player-name");

                    fields.forEach(field => field.addEventListener("input", () => {
                        if (field.value.length > 10)
                            field.value = field.value.substring(0, 10);
                    }));

                    startButton.addEventListener("click", () => {
                        const aiChoices = document.querySelector(".ai-levels").querySelectorAll(".ai-level");
                        let choiced, aiMenu;

                        aiMenu = newNormal.querySelector(".ai-menu") ? true : false;
                        for (let level of aiChoices)
                            if (level.checked) {
                                choiced = level.value;
                                break;
                            }

                        if (choiced || !aiMenu) {
                            const initCnt = document.querySelector(".init-container");
                            const gameUI = document.querySelector(".game-ui");
                            const nameInputs = document.querySelectorAll(".player-name");
                            const names = document.querySelectorAll(".player");

                            initCnt.classList.add("hidden");
                            gameUI.classList.remove("hidden");

                            if (aiMenu) {
                                players[0].name = nameInputs[2].value;
                                players[1].name = "愛";
                                players[1].smart = true;
                                players[1].level = choiced;
                            }
                            else {
                                players[0].name = nameInputs[0].value;
                                players[1].name = nameInputs[1].value;
                            }

                            if (!players[0].name)
                                players[0].name = "Player1";
                            if (!players[1].name)
                                players[1].name = "Player2";

                            for (let i = 0; i < players.length; i++)
                                names[i].innerText = `It's ${players[i].name}'s turn`;

                            gameBoard.create_board(players);
                        }
                        else {
                            const warningxwarningxwarning = document.querySelector(".warning-wrapper");

                            warningxwarningxwarning.classList.remove("hidden");
                            setTimeout(() => {
                                warningxwarningxwarning.classList.add("hidden");
                            }, 2000);
                        }
                    });

                    if (newNormal.querySelector(".ai-menu")) {
                        const aiLevels = document.querySelector(".ai-levels");

                        aiButton = document.querySelector(".ai-button");
                        aiButton.addEventListener("click", () => activate_windows(aiLevels, aiButton));
                    }

                    players = [{ name: "Player1", smart: false, symbol: '×', state: [] }, { name: "Player2", smart: false, symbol: 'o', state: [] }];
                });
        }
        return { start_screen };
    })();

game.start_screen();