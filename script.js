window.onload = function() {
    document.querySelector("#submit").onclick = function() {
        document.getElementById('ez_text').textContent = ""
        document.getElementById('ez').style.visibility = 'hidden';
        document.getElementById('ez2').style.visibility = 'hidden';
        var n = document.getElementById('map_size').value;
        document.getElementById("container").innerHTML = "";
        var QueryString = function() {
            var query_string = {};
            var query = window.location.search.substring(1);
            var vars = query.split("&");
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                if (typeof query_string[pair[0]] === "undefined") {
                    query_string[pair[0]] = pair[1];
                } else if (typeof query_string[pair[0]] === "string") {
                    var arr = [query_string[pair[0]], pair[1]];
                    query_string[pair[0]] = arr;
                } else {
                    query_string[pair[0]].push(pair[1]);
                }
            }
            return query_string;
        }();
        if (n > 1 && n < 51) {
            var defaultNum = n;
        } else {
            var defaultNum = 0;
        }
        var num = parseInt(QueryString.num) || defaultNum;
        var container = document.getElementById('container');
        var width = container.offsetWidth;
        createGrid(num);

        function changeColor(id) {
            var sqr = getElementById(id);
            sqr.style.backgroundColor = 'black';
        }

        function createGrid(n) {
            if (isNaN(n) || n <= 0)
                return;
            for (var i = 0; i < n * n; i++) {
                var dimension = width / n;
                var cell = document.createElement('div');
                cell.className = cell.className + 'gridCell';
                cell.style.width = dimension + 'px';
                cell.style.height = dimension + 'px';
                var id = String(i);
                cell.id = id;

                container.appendChild(cell);
            }
        }

    }
    document.querySelector("#walls").onclick = function() {
        let elms = document.getElementsByClassName('gridCell');

        for (let i in elms) {
            elms[i].onclick = function() { this.style.background = 'black' };
        }
    }
    var count = 0;
    var st_fn = [];
    document.querySelector("#start_finish").onclick = function() {
        count = 0;
        var n = document.getElementById('map_size').value;
        for (var i = 0; i < n*n; i++){
            var sqr = document.getElementById(i);
            if (sqr.style.background == "yellow"){
                sqr.style.background = "white";
            }
        }
        for (let i = 0; i < st_fn.length; i++) {
            let sqr = document.getElementById(st_fn[i]);
            sqr.style.background = 'white';
        }
        st_fn = [];
        let elms = document.getElementsByClassName('gridCell'); {

            for (let i in elms) {

                elms[i].onclick = function() {
                    if (count < 2) {
                        if (count == 0) { this.style.background = 'red'; }
                        if (count == 1) { this.style.background = 'green'; }
                        count = count + 1;
                        st_fn.push(i);

                    }
                };
            }


        }
    }
    document.querySelector("#create_way").onclick = function() {
        var n = document.getElementById('map_size').value;
        var walls = [];
        var start = -1;
        var finish = -1;
        for (var i = 0; i < document.getElementsByClassName('gridCell').length; i++) {
            var sqr = document.getElementById(i);
            if (sqr.style.background == 'black') {
                walls.push(i);
            } else if (sqr.style.background == 'red') {
                start = i;
            } else if (sqr.style.background == 'green') {
                finish = i;
            }
        }

        function idToXY(id, n) {
            var X = Math.floor(id / n);
            var Y = id % n;
            var coordinates = [X, Y];
            return coordinates;

        }

        function XYtoId(coordinates, n) {
            var id = (coordinates[0] * n) + coordinates[1];
            return id;
        }
        var matrix = [];
        for (var i = 0; i < n * n; i++) {
            matrix[i] = [];
            for (var j = 0; j < n * n; j++) {
                matrix[i][j] = Number.MAX_VALUE;
            }
        }
        var moves = [
            [0, 1],
            [1, 0],
            [0, -1],
            [-1, 0]
        ];
        for (var i = 0; i < n * n; i++) {
            var XY = idToXY(i, n);
            if (walls.includes(i) == false) {
                matrix[i][i] = 0;
            }
            for (var j = 0; j < 4; j++) {
                var neigh = [
                    (XY[0]) + (moves[j][0]),
                    (XY[1]) + (moves[j][1])
                ];
                if ((neigh[0]) >= 0 && (neigh[1]) >= 0 && neigh[0] < n && neigh[1] < n) {
                    if (walls.includes((XYtoId(neigh, n))) == false && walls.includes(i) == false) {
                        matrix[i][(XYtoId(neigh, n))] = 1;
                    }
                }
            }
        }
        var heruistic = [];
        for (var i = 0; i < n * n; i++) {
            heruistic[i] = [];
            for (var j = 0; j < n * n; j++) {
                var first_point = idToXY(i, n);
                var second_point = idToXY(j, n);
                heruistic[i][j] = Math.sqrt(((first_point[0] - second_point[0]) ** 2) + ((first_point[1] - second_point[1]) ** 2));
            }
        }
        var dist = [];
        var priority = [];
        for (var i = 0; i < n * n; i++) {
            dist[i] = Number.MAX_VALUE;
            priority[i] = Number.MAX_VALUE;
        }
        dist[start] = 0;
        priority[start] = heruistic[start][finish];
        visited = [];
        prev = [];
        prev[start] = -1;
        while (true) {
            best_priority = Number.MAX_VALUE;
            best_prior_ind = -1;
            for (var i = 0; i < priority.length; i++) {
                if (priority[i] < best_priority && !visited[i]) {
                    best_priority = priority[i];
                    best_prior_ind = i;
                }
            }

            if (best_prior_ind == -1) {
                document.getElementById('ez_text').textContent = "Путь не найден :("
                document.getElementById('ez2').style.visibility = 'visible';
                document.getElementById('ez_text').style.color = 'red';
                return
            } else if (best_prior_ind == finish) {
                document.getElementById('ez_text').textContent = "Путь найден!"
                document.getElementById('ez').style.visibility = 'visible';
                document.getElementById('ez_text').style.color = 'green';

                let way = [];
                for (var k = prev[finish]; k != start; k = prev[k]) {
                    way.push(k)
                };
                for (let i = 0; i < way.length; i++){
                    let vertex = document.getElementById(way[i]);
                    vertex.style.background = "yellow";
                }
                return

            }
            for (var i = 0; i < matrix[best_prior_ind].length; i++) {
                if (matrix[best_prior_ind][i] != 0 && !visited[i]) {
                    if (dist[best_prior_ind] + matrix[best_prior_ind][i] < dist[i]) {
                        dist[i] = dist[best_prior_ind] + matrix[best_prior_ind][i];
                        priority[i] = dist[i] + heruistic[i][finish];
                        prev[i] = best_prior_ind;


                    }
                }
            }
            visited[best_prior_ind] = true;
        }


    }
};