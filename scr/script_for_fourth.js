window.onload = function () {
    let points = [];
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    document.querySelector("#place_point").onclick = function () {
        const grass = document.getElementById('grass');

        canvas.addEventListener('mouseup', function (e) {
            let x = e.pageX - grass.offsetLeft,
                y = e.pageY - grass.offsetTop;
            points.push([x, y])
            const point = document.createElement('img')
            point.src = 'img/malina.png'
            point.height = 50
            point.width = 50
            point.classList.add("points");
            point.id = String(points.length - 1)
            point.style.position = 'fixed'
            point.style.marginTop = (y - 25) + 'px'
            point.style.marginLeft = (x - 25) + 'px'
            grass.appendChild(point)


        });

    }
    document.querySelector("#create_way").onclick = function () {
        let distances = []
        let pheromones = []
        let beta = 3
        let alpha = 1
        for (let i = 0; i < points.length; i++) {
            distances[i] = []
            pheromones[i] = []
            for (let j = 0; j < points.length; j++) {
                let first_point = points[i]
                let second_point = points[j]
                distances[i][j] = Math.sqrt(((first_point[0] - second_point[0]) ** 2) + ((first_point[1] - second_point[1]) ** 2))
                pheromones[i][j] = 0.1
            }
        }
        for (let i = 0; i < points.length; i++) {
            distances[i][i] = 0
        }

        function transition_probability(distances, pheromones, point_number, visited) {
            let count_points = points.length
            let transition_chances = []
            let transition_wishes = []
            let sum = 0
            for (let i = 0; i < count_points; i++) {
                transition_wishes[i] = Math.pow(pheromones[point_number][i], alpha) * Math.pow(200 / distances[point_number][i], beta)
                if (visited.includes(i) === false) {
                    sum = sum + transition_wishes[i]
                }
            }
            for (let i = 0; i < count_points; i++) {
                if (visited.includes(i) === false) {
                    transition_chances[i] = transition_wishes[i] / sum
                } else {
                    transition_chances[i] = 0
                }
            }
            return transition_chances

        }

        function point_selection(transition_chances, count_points, visited) {
            let probabilities_roulette = []
            let previous_border = 0
            for (let i = 0; i < count_points; i++) {
                probabilities_roulette[i] = []
                probabilities_roulette[i][0] = previous_border
                probabilities_roulette[i][1] = previous_border + transition_chances[i]
                previous_border = probabilities_roulette[i][1]
            }
            let random_probability = Math.random()
            let next_point = -1
            let point_ind = 0
            while (next_point === -1) {
                if (visited.includes(point_ind) === false && random_probability >= probabilities_roulette[point_ind][0] && random_probability < probabilities_roulette[point_ind][1]) {
                    next_point = point_ind

                } else {
                    point_ind++
                }

            }
            return next_point

        }

        function path_length(arr) {
            let weight = 0
            for (let i = 0; i < arr.length - 1; i++) {
                weight = weight + distances[arr[i]][arr[i + 1]]
            }

            return weight
        }

        function sort_ways(ways, mn, mx) {
            if (mn < mx) {
                let left, right, middle
                left = mn
                right = mx
                middle = ways[Math.floor(Math.random() * (right - left)) + left][0]
                do {
                    while (ways[left][0] < middle) {
                        left++;
                    }
                    while (ways[right][0] > middle) {
                        right--;
                    }
                    if (left <= right) {
                        let t = ways[left]
                        ways[left] = ways[right]
                        ways[right] = t
                        left++
                        right--
                    }
                } while (left < right);
                sort_ways(ways, mn, right)
                sort_ways(ways, left, mx)
            }


        }

        function new_pheromones(ways, pheromones) {
            for (let i = 0; i < pheromones.length; i++) {
                for (let j = 0; j < pheromones[i].length; j++) {
                    pheromones[i][j] = pheromones[i][j] * 0.64
                }
            }
            for (let k = 0; k < ways.length; k++) {
                for (let m = 1; m < ways[k].length - 1; m++) {
                    pheromones[ways[k][m]][ways[k][m + 1]] = pheromones[ways[k][m]][ways[k][m + 1]] + (200 / ways[k][0])
                    pheromones[ways[k][m + 1]][ways[k][m]] = pheromones[ways[k][m + 1]][ways[k][m]] + (200 / ways[k][0])
                }
            }
        }

        ctx.beginPath();
        let best_way = [Number.MAX_VALUE]
        if (points.length > 1) {
            for (let i = 0; i < 600; i++) {
                let ways = []
                for (let k = 0; k < points.length; k++) {
                    ways[k] = []
                    ways[k].push(k)
                    let current_point = k
                    let visited = []
                    for (let j = 0; j < points.length - 1; j++) {
                        visited.push(current_point)
                        let transition_chances = transition_probability(distances, pheromones, current_point, visited)
                        let next_point = point_selection(transition_chances, points.length, visited)
                        current_point = next_point
                        ways[k].push(next_point)


                    }
                    ways[k].push(k)
                    ways[k].unshift(path_length(ways[k]))

                }

                new_pheromones(ways, pheromones)
                sort_ways(ways, 0, ways.length - 1)
                if (ways[0][0] < best_way[0]) {
                    best_way = ways[0]
                }


            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let start_x = points[best_way[1]][0]
            let start_y = points[best_way[1]][1]
            ctx.moveTo(start_x, start_y)
            for (let k = 2; k < best_way.length; k++) {
                let x = points[best_way[k]][0]
                let y = points[best_way[k]][1]
                ctx.lineTo(x, y)
            }
            ctx.closePath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#961eff'
            ctx.stroke();
        }
    }


    document.querySelector('#clean2').onclick = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        document.querySelectorAll('.points').forEach(function (a) {
            a.remove()
        })
        points = []


    }
}
