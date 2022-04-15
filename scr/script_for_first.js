window.onload = function () {
    document.querySelector("#submit").onclick = function () {
        let defaultNum;
        document.getElementById('ez_text').textContent = ""
        document.getElementById('ez').style.visibility = 'hidden';
        document.getElementById('ez2').style.visibility = 'hidden';
        const n = document.getElementById('map_size').value;
        document.getElementById("container").innerHTML = "";

        if (n > 1 && n < 51) {
            defaultNum = n;
        } else {
            defaultNum = 0;
        }
        const container = document.getElementById('container');
        const width = container.offsetWidth;
        createGrid(defaultNum);

        function createGrid(n) {
            if (isNaN(n) || n <= 0)
                return;
            for (let i = 0; i < n * n; i++) {
                const dimension = width / n;
                const cell = document.createElement('div');
                cell.className = cell.className + 'gridCell';
                cell.style.width = dimension + 'px';
                cell.style.height = dimension + 'px';
                cell.id = String(i);

                container.appendChild(cell);
            }
        }

    }

    document.querySelector("#walls").onclick = function () {
        const n = document.getElementById('map_size').value;
        for (let i = 0; i < n * n; i++) {
            let sqr = document.getElementById(String(i));
            if (sqr.style.background === "lightgoldenrodyellow") {
                sqr.style.background = "white";
            }
        }
        let elms = document.getElementsByClassName('gridCell');

        for (let i in elms) {

            elms[i].onclick = function () {
                if (this.style.background === 'lightslategray') {
                    this.style.background = 'white'

                } else {
                    this.style.background = 'lightslategray'
                }

            }
        }
    }
    let count = 0;
    document.querySelector("#start_finish").onclick = function () {
        count = 0;
        const n = document.getElementById('map_size').value;
        for (let i = 0; i < n * n; i++) {
            const sqr = document.getElementById(String(i));
            if (sqr.style.background === "lightgoldenrodyellow" || sqr.style.background === "lightpink" || sqr.style.background === "lightgreen") {
                sqr.style.background = "white";
            }
        }
        let elms = document.getElementsByClassName('gridCell');
        {

            for (let i in elms) {

                elms[i].onclick = function () {
                    if (count < 2) {
                        if (count === 0) {
                            this.style.background = 'lightpink';
                        }
                        if (count === 1) {
                            this.style.background = 'lightgreen';
                        }
                        count = count + 1;

                    }
                };
            }


        }
    }
    document.querySelector("#create_way").onclick = function () {
        let j;
        let i;
        const n = document.getElementById('map_size').value;
        const walls = [];
        let start = -1;
        let finish = -1;
        for (i = 0; i < document.getElementsByClassName('gridCell').length; i++) {
            const sqr = document.getElementById(i);
            if (sqr.style.background === 'lightslategray') {
                walls.push(i);
            } else if (sqr.style.background === 'lightpink') {
                start = i;
            } else if (sqr.style.background === 'lightgreen') {
                finish = i;
            }
        }

        function idToXY(id, n) {
            const X = Math.floor(id / n);
            const Y = id % n;
            return [X, Y];

        }

        function XYtoId(coordinates, n) {
            return (coordinates[0] * n) + coordinates[1];
        }

        const matrix = [];
        for (i = 0; i < n * n; i++) {
            matrix[i] = [];
            for (j = 0; j < n * n; j++) {
                matrix[i][j] = Number.MAX_VALUE;
            }
        }
        const moves = [
            [0, 1],
            [1, 0],
            [0, -1],
            [-1, 0]
        ];
        for (i = 0; i < n * n; i++) {
            const XY = idToXY(i, n);
            if (walls.includes(i) === false) {
                matrix[i][i] = 0;
            }
            for (j = 0; j < 4; j++) {
                const neigh = [
                    (XY[0]) + (moves[j][0]),
                    (XY[1]) + (moves[j][1])
                ];
                if ((neigh[0]) >= 0 && (neigh[1]) >= 0 && neigh[0] < n && neigh[1] < n) {
                    if (walls.includes((XYtoId(neigh, n))) === false && walls.includes(i) === false) {
                        matrix[i][(XYtoId(neigh, n))] = 1;
                    }
                }
            }
        }
        const heuristic = [];
        for (i = 0; i < n * n; i++) {
            heuristic[i] = [];
            for (j = 0; j < n * n; j++) {
                const first_point = idToXY(i, n);
                const second_point = idToXY(j, n);
                heuristic[i][j] = Math.sqrt(((first_point[0] - second_point[0]) ** 2) + ((first_point[1] - second_point[1]) ** 2));
            }
        }
        const dist = [];
        const priority = [];
        for (i = 0; i < n * n; i++) {
            dist[i] = Number.MAX_VALUE;
            priority[i] = Number.MAX_VALUE;
        }
        dist[start] = 0;
        priority[start] = heuristic[start][finish];
        let visited = [];
        let prev = [];
        prev[start] = -1;
        let best_prior_ind;
        let best_priority;
        while (true) {
            best_priority = Number.MAX_VALUE;
            best_prior_ind = -1;
            for (i = 0; i < priority.length; i++) {
                if (priority[i] < best_priority && !visited[i]) {
                    best_priority = priority[i];
                    best_prior_ind = i;
                }
            }

            if (best_prior_ind === -1) {
                document.getElementById('ez_text').textContent = "Путь не найден :("
                document.getElementById('ez2').style.visibility = 'visible';
                document.getElementById('ez').style.visibility = 'hidden';
                document.getElementById('ez_text').style.color = 'lightpink';
                return
            } else if (best_prior_ind === finish) {
                document.getElementById('ez_text').textContent = "Путь найден!"
                document.getElementById('ez').style.visibility = 'visible';
                document.getElementById('ez2').style.visibility = 'hidden';
                document.getElementById('ez_text').style.color = 'lightgreen';

                let way = [];
                for (let k = prev[finish]; k !== start; k = prev[k]) {
                    way.push(k)
                }

                for (let i = 0; i < way.length; i++) {
                    let vertex = document.getElementById(way[i]);
                    vertex.style.background = "lightgoldenrodyellow";
                }
                return

            }
            for (i = 0; i < matrix[best_prior_ind].length; i++) {
                if (matrix[best_prior_ind][i] !== 0 && !visited[i]) {
                    if (dist[best_prior_ind] + matrix[best_prior_ind][i] < dist[i]) {
                        dist[i] = dist[best_prior_ind] + matrix[best_prior_ind][i];
                        priority[i] = dist[i] + heuristic[i][finish];
                        prev[i] = best_prior_ind;


                    }
                }
            }
            visited[best_prior_ind] = true;
        }


    }
};