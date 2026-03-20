document.addEventListener('DOMContentLoaded', () => {
    const gridSizeInput = document.getElementById('grid-size');
    const generateBtn = document.getElementById('generate-btn');
    const statusMsg = document.getElementById('status-message');
    const gridBoard = document.getElementById('grid');
    const gridWrapper = document.getElementById('grid-wrapper');
    const actionButtons = document.getElementById('action-buttons');
    const randomPolicyBtn = document.getElementById('random-policy-btn');
    const valueIterationBtn = document.getElementById('value-iteration-btn');
    const resetBtn = document.getElementById('reset-btn');
    const legend = document.getElementById('legend');
    const obsCountLegend = document.getElementById('obs-count-legend');

    let n = 5;
    let setupPhase = 'START'; // START, END, OBSTACLE, DONE
    let startCell = null;
    let endCell = null;
    let obstacles = [];
    let obsCountToSet = 0;

    const arrowMap = {
        'UP': '<i class="fas fa-arrow-up"></i>',
        'DOWN': '<i class="fas fa-arrow-down"></i>',
        'LEFT': '<i class="fas fa-arrow-left"></i>',
        'RIGHT': '<i class="fas fa-arrow-right"></i>'
    };

    generateBtn.addEventListener('click', () => {
        n = parseInt(gridSizeInput.value);
        if (isNaN(n) || n < 5 || n > 9) {
            alert('請輸入 5 到 9 之間的有效數字。');
            return;
        }
        initGrid(n);
    });

    resetBtn.addEventListener('click', () => {
        initGrid(n);
    });

    randomPolicyBtn.addEventListener('click', () => {
        fetchData('/api/evaluate_random', false);
    });

    valueIterationBtn.addEventListener('click', () => {
        // HW1-3: Display optimal policy, values, and maybe highlight best path
        fetchData('/api/value_iteration', true);
    });

    function initGrid(size) {
        n = size;
        gridBoard.style.gridTemplateColumns = `repeat(${n}, 75px)`;
        gridBoard.style.gridTemplateRows = `repeat(${n}, 75px)`;
        gridBoard.innerHTML = '';
        
        setupPhase = 'START';
        startCell = null;
        endCell = null;
        obstacles = [];
        obsCountToSet = n - 2;

        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.r = r;
                cell.dataset.c = c;
                cell.addEventListener('click', handleCellClick);
                gridBoard.appendChild(cell);
            }
        }

        gridWrapper.classList.remove('hidden');
        legend.classList.remove('hidden');
        actionButtons.classList.add('hidden');
        obsCountLegend.textContent = obsCountToSet;
        updateStatus();
    }

    function handleCellClick(e) {
        const cell = e.currentTarget;
        const r = parseInt(cell.dataset.r);
        const c = parseInt(cell.dataset.c);

        if (setupPhase === 'START') {
            startCell = [r, c];
            cell.classList.add('start');
            cell.innerHTML = '<span class="cell-label">St</span><span class="cell-value"></span><span class="cell-action"></span>';
            setupPhase = 'END';
            updateStatus();
        } 
        else if (setupPhase === 'END') {
            if (r === startCell[0] && c === startCell[1]) return;
            endCell = [r, c];
            cell.classList.add('end');
            cell.innerHTML = '<span class="cell-label">G</span><span class="cell-value">0.00</span><span class="cell-action"></span>';
            setupPhase = 'OBSTACLE';
            updateStatus();
            
            if (obsCountToSet === 0) finishSetup();
        }
        else if (setupPhase === 'OBSTACLE') {
            if ((r === startCell[0] && c === startCell[1]) || (r === endCell[0] && c === endCell[1])) return;
            if (cell.classList.contains('obstacle')) return;

            obstacles.push([r, c]);
            cell.classList.add('obstacle');
            
            if (obstacles.length >= obsCountToSet) {
                finishSetup();
            } else {
                updateStatus();
            }
        }
    }

    function updateStatus() {
        if (setupPhase === 'START') {
            statusMsg.textContent = '請點擊設定「起點 (Start)」(綠色)';
            statusMsg.style.color = 'var(--cell-start)';
        } else if (setupPhase === 'END') {
            statusMsg.textContent = '請點擊設定「終點 (End)」(紅色)';
            statusMsg.style.color = 'var(--cell-end)';
        } else if (setupPhase === 'OBSTACLE') {
            const remain = obsCountToSet - obstacles.length;
            statusMsg.textContent = `請點擊設定「障礙物」(灰色)。 還剩下 ${remain} 個`;
            statusMsg.style.color = 'var(--text-muted)';
        } else if (setupPhase === 'DONE') {
            statusMsg.textContent = '設定完成！請選擇下方的策略計算操作。';
            statusMsg.style.color = 'var(--success)';
        }
    }

    function finishSetup() {
        setupPhase = 'DONE';
        updateStatus();
        actionButtons.classList.remove('hidden');
    }

    async function fetchData(endpoint, drawPath = false) {
        statusMsg.textContent = '計算中...';
        statusMsg.style.color = 'var(--text-main)';

        clearGridPaths();

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    n: n,
                    start: startCell,
                    end: endCell,
                    obstacles: obstacles
                })
            });

            if (!response.ok) throw new Error('API request failed');

            const data = await response.json();
            renderResults(data.values, data.policy, drawPath);
            
            if (endpoint.includes('evaluate_random')) {
                statusMsg.textContent = '完成: 已顯示隨機策略及策略評估之價值 V(s)';
                statusMsg.style.color = 'var(--secondary)';
            } else {
                statusMsg.textContent = '完成: 價值迭代完成，已顯示最佳策略與 V(s)';
                statusMsg.style.color = 'var(--success)';
            }
        } catch (error) {
            console.error('Error:', error);
            statusMsg.textContent = '計算發生錯誤！請查看 Console。';
            statusMsg.style.color = 'var(--danger)';
        }
    }

    function clearGridPaths() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('path');
            const actionSpan = cell.querySelector('.cell-action');
            if (actionSpan) actionSpan.innerHTML = '';
            
            if (!cell.classList.contains('start') && !cell.classList.contains('end') && !cell.classList.contains('obstacle')) {
                const valSpan = cell.querySelector('.cell-value');
                if (valSpan) valSpan.textContent = '';
                // Restore generic layout
                cell.innerHTML = '<span class="cell-value"></span><span class="cell-action"></span>';
            }
        });
    }

    function renderResults(values, policy, drawPath) {
        const gridData = {};
        for (let i = 0; i < values.length; i++) {
            const {r, c, v} = values[i];
            const a = policy.find(p => p.r === r && p.c === c)?.a;
            gridData[`${r},${c}`] = { v, a };
        }

        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            const r = parseInt(cell.dataset.r);
            const c = parseInt(cell.dataset.c);
            const data = gridData[`${r},${c}`];

            if (data && !cell.classList.contains('obstacle') && !cell.classList.contains('end')) {
                let vSpan = cell.querySelector('.cell-value');
                let aSpan = cell.querySelector('.cell-action');
                
                if (!vSpan) {
                    vSpan = document.createElement('span');
                    vSpan.className = 'cell-value';
                    cell.appendChild(vSpan);
                }
                if (!aSpan) {
                    aSpan = document.createElement('span');
                    aSpan.className = 'cell-action';
                    cell.appendChild(aSpan);
                }

                // Values very low can be styled differently to stand out visually
                if (data.v < -50) {
                     vSpan.style.color = 'var(--danger)';
                } else if (!cell.classList.contains('start')) {
                     vSpan.style.color = 'var(--text-muted)';
                }

                vSpan.textContent = data.v.toFixed(2);
                
                if (data.a) {
                    aSpan.innerHTML = arrowMap[data.a];
                }
            } else if (cell.classList.contains('end')) {
                let vSpan = cell.querySelector('.cell-value');
                if (vSpan) vSpan.textContent = '0.00';
            }
        });

        // Track shortest path visually from the Start node if drawPath=true
        if (drawPath) {
            let currR = startCell[0];
            let currC = startCell[1];
            let steps = 0; 
            
            while ((currR !== endCell[0] || currC !== endCell[1]) && steps < n * n * 2) {
                const data = gridData[`${currR},${currC}`];
                if (!data || !data.a) break; 

                const a = data.a;
                let nextR = currR;
                let nextC = currC;

                if (a === 'UP') nextR--;
                else if (a === 'DOWN') nextR++;
                else if (a === 'LEFT') nextC--;
                else if (a === 'RIGHT') nextC++;

                // Stop path if hitting boundary or obstacle
                if (nextR < 0 || nextR >= n || nextC < 0 || nextC >= n) break;
                if (obstacles.some(o => o[0] === nextR && o[1] === nextC)) break;

                // Color current cell unless it's the start
                if (!(currR === startCell[0] && currC === startCell[1])) {
                    const cell = document.querySelector(`.cell[data-r="${currR}"][data-c="${currC}"]`);
                    if (cell) {
                        cell.classList.add('path');
                        const actionSpan = cell.querySelector('.cell-action');
                        if (actionSpan) actionSpan.classList.add('path-arrow');
                    }
                }

                if (nextR === currR && nextC === currC) break; 

                currR = nextR;
                currC = nextC;
                steps++;
            }
        }
    }
    
    // Auto click to init grid
    generateBtn.click();
});
