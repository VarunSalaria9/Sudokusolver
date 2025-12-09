
let cursorFollower; 

window.onload = () => {
    const grid = document.getElementById('sudoku-grid');
    
    for (let row = 0; row < 9; row++) {
        const tr = document.createElement('tr');
        for (let col = 0; col < 9; col++) {
            const td = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.pattern = '[1-9]'; 
            input.setAttribute('data-row', row);
            input.setAttribute('data-col', col);

            td.appendChild(input);
            tr.appendChild(td);
        }
        grid.appendChild(tr);
    }
    
    cursorFollower = document.querySelector('.cursor-follower');

    const inputs = document.querySelectorAll('#sudoku-grid input');
    inputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const oldValue = e.target.value;
     
            const value = oldValue.replace(/[^1-9]/g, ''); 
            
            if (oldValue !== value) {
                input.classList.add('shake');
                setTimeout(() => {
                    input.classList.remove('shake');
                }, 300);
            }

            e.target.value = value;
            if (value !== '') {
                
                input.classList.add('user-entered'); 
                
                input.style.backgroundColor = '#ffd966'; 
                input.style.transition = 'background-color 0.3s ease';
            } else {
                input.classList.remove('user-entered');
                input.style.backgroundColor = '#f9f9f9'; 
            }
        });
        input.addEventListener('keydown', (e) => {
            const row = parseInt(input.getAttribute('data-row'));
            const col = parseInt(input.getAttribute('data-col'));
            let nextRow = row;
            let nextCol = col;
            let targetInput = null;

            switch (e.key) {
                case 'ArrowUp':
                    nextRow = Math.max(0, row - 1);
                    break;
                case 'ArrowDown':
                    nextRow = Math.min(8, row + 1);
                    break;
                case 'ArrowLeft':
                    nextCol = Math.max(0, col - 1);
                    break;
                case 'ArrowRight':
                    nextCol = Math.min(8, col + 1);
                    break;
                default:
                    return; 
            }
            
            e.preventDefault();
            
            targetInput = document.querySelector(`input[data-row='${nextRow}'][data-col='${nextCol}']`);
            
            if (targetInput) {
                targetInput.focus();
               
                targetInput.select(); 
            }
        });
    });
    
 
    setupCursorTracking();
};

function setupCursorTracking() {
    if (!cursorFollower) {
        cursorFollower = document.querySelector('.cursor-follower');
        if (!cursorFollower) {
            console.error("Cursor follower element not found! Check your HTML (class='cursor-follower').");
            return; 
        }
    }
    
    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;
    const speed = 0.15; 

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animate() {
        const dx = mouseX - followerX;
        const dy = mouseY - followerY;

        followerX += dx * speed;
        followerY += dy * speed;

        cursorFollower.style.transform = `translate(${followerX}px, ${followerY}px) scale(1) translate(-50%, -50%)`;

        requestAnimationFrame(animate);
    }
    
    animate();
}

document.getElementById('solve-btn').addEventListener('click', () => {
    let board = getBoard();
    if (!isValidBoard(board)) {
        alert('Your initial setup is invalid! Check for duplicate numbers in rows, columns, or 3x3 blocks.');
        return; 
    } 
    
    const initialBoard = getBoard();
    
    if (solveSudoku(board)) {
        fillBoard(board, initialBoard);
        celebrateSolve(); 
    } else {
        alert('No solution exists for the puzzle you entered. Double-check your numbers!');
    }
});

document.getElementById('clear-btn').addEventListener('click', () => {
    clearBoard();
});

function getBoard() {
    let board = [];
    const inputs = document.querySelectorAll('#sudoku-grid input');
    for (let i = 0; i < 9; i++) {
        let row = [];
        for (let j = 0; j < 9; j++) {
            const value = inputs[i * 9 + j].value;
            row.push(value === '' || isNaN(parseInt(value)) ? 0 : parseInt(value));
        }
        board.push(row);
    }
    return board;
}
function fillBoard(solvedBoard, initialBoard) {
    const inputs = document.querySelectorAll('#sudoku-grid input');
    const lightColors = ['#e91e63', '#ff9800', '#4caf50', '#2196f3', '#9c27b0', '#ffeb3b', '#00bcd4'];

    let delay = 0;
    inputs.forEach((input, index) => {
        const row = Math.floor(index / 9);
        const col = index % 9;
        
        if (initialBoard[row][col] === 0) { 
            setTimeout(() => {
                const solvedValue = solvedBoard[row][col];
                input.value = solvedValue === 0 ? '' : solvedValue;
                
                input.classList.remove('user-entered');
                input.classList.add('solved-number');

                input.style.backgroundColor = lightColors[index % lightColors.length];
                input.style.transition = 'background-color 0.6s ease, transform 0.6s ease';
                input.style.transform = 'scale(1.2)';

                setTimeout(() => {
                    input.style.transform = 'scale(1)';
                    input.style.backgroundColor = '#f9f9f9'; 
                }, 600);
            }, delay);

            delay += 60; 
        }
    });
}
function isValidBoard(board) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const num = board[i][j];
            if (num !== 0 && (num < 1 || num > 9)) return false;
        }
    }
    return isValidRows(board) && isValidCols(board) && isValidSubgrids(board);
}

function isValidRows(board) {
    for (let i = 0; i < 9; i++) {
        let seen = new Set();
        for (let j = 0; j < 9; j++) {
            if (board[i][j] !== 0) {
                if (seen.has(board[i][j])) return false;
                seen.add(board[i][j]);
            }
        }
    }
    return true;
}

function isValidCols(board) {
    for (let j = 0; j < 9; j++) {
        let seen = new Set();
        for (let i = 0; i < 9; i++) {
            if (board[i][j] !== 0) {
                if (seen.has(board[i][j])) return false;
                seen.add(board[i][j]);
            }
        }
    }
    return true;
}

function isValidSubgrids(board) {
    for (let row = 0; row < 9; row += 3) {
        for (let col = 0; col < 9; col += 3) {
            let seen = new Set();
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const num = board[row + i][col + j];
                    if (num !== 0) {
                        if (seen.has(num)) return false;
                        seen.add(num);
                    }
                }
            }
        }
    }
    return true;
}

function solveSudoku(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isSafe(board, row, col, num)) {
                        board[row][col] = num;
                        if (solveSudoku(board)) return true;
                        board[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}
function isSafe(board, row, col, num) {
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num || board[x][col] === num) {
            return false;
        }
    }
    const startRow = row - row % 3;
    const startCol = col - col % 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[startRow + i][startCol + j] === num) {
                return false;
            }
        }
    }
    return true;
}

function celebrateSolve() {
    const inputs = document.querySelectorAll('#sudoku-grid input');
    const lightColors = ['#ff4081', '#ffc107', '#00e676', '#448aff', '#7c4dff', '#ff80ab', '#84ffff'];

    inputs.forEach((input, index) => {
        setTimeout(() => {
            const isSolved = input.classList.contains('solved-number');
            const scaleAmount = isSolved ? 1.3 : 1.05; 
            
            input.style.backgroundColor = lightColors[index % lightColors.length];
            input.style.transition = 'background-color 0.5s ease, transform 0.5s ease';
            input.style.transform = `scale(${scaleAmount})`;

            setTimeout(() => {
                input.style.transform = 'scale(1)';
            }, 500);
        }, index * 80); 
    });

    const totalDelay = inputs.length * 80 + 600;
    setTimeout(() => {
        inputs.forEach(input => {
            input.style.backgroundColor = '#f9f9f9';
            input.style.transform = 'scale(1)';
        });
    }, totalDelay);

    if (typeof confetti === 'function') {
        confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 },
            colors: lightColors 
        });
    }
}

function clearBoard() {
    const inputs = document.querySelectorAll('#sudoku-grid input');
    const lightColors = ['#ff8a80', '#ffd180', '#ccff90', '#82b1ff', '#b388ff', '#f8bbd0', '#80cbc4'];

    for (let i = inputs.length - 1; i >= 0; i--) {
        setTimeout(() => {
            const input = inputs[i];

            input.style.backgroundColor = lightColors[i % lightColors.length];
            input.style.transition = 'background-color 0.5s ease, transform 0.5s ease';
            input.style.transform = 'scale(1.3)';

            setTimeout(() => {
                input.value = '';
                input.style.transform = 'scale(1)';
                input.style.backgroundColor = '#f9f9f9';
                input.classList.remove('user-entered', 'solved-number'); 
            }, 500);

            if (i === 0 && typeof confetti === 'function') {
                confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.6 },
                    colors: lightColors
                });
            }
        }, (inputs.length - 1 - i) * 60); 
    }
}