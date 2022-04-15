window.onload = function () {
    let flowers = [];
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    document.querySelector("#place_point").onclick = function () {
        const grass = document.getElementById('grass');

        canvas.addEventListener('mouseup', function (e) {
            let x = e.pageX - grass.offsetLeft,
                y = e.pageY - grass.offsetTop;
            flowers.push([x, y])
            const flower = document.createElement('img')
            flower.src = 'img/flower.png'
            flower.height = 50
            flower.width = 50
            flower.classList.add("flowers");
            flower.id = String(flowers.length - 1)
            flower.style.position = 'fixed'
            flower.style.marginTop = (y - 25) + 'px'
            flower.style.marginLeft = (x - 25) + 'px'
            grass.appendChild(flower)


        });

    }
    document.querySelector("#create_way").onclick = function () {
        document.getElementById('path_found').style.visibility = 'hidden'
        let distances = []
        for (let i = 0; i < flowers.length; i++) {
            distances[i] = []
            for (let j = 0; j < flowers.length; j++) {
                let first_point = flowers[i]
                let second_point = flowers[j]
                distances[i][j] = Math.sqrt(((first_point[0] - second_point[0]) ** 2) + ((first_point[1] - second_point[1]) ** 2))
            }
        }

        function fitness(arr) {
            let weight = 0
            for (let i = 0; i < arr.length - 1; i++) {
                weight = weight + distances[arr[i]][arr[i + 1]]
            }
            weight = weight + distances[0][arr.length - 1]
            return weight
        }

        function sort_population(population, mn, mx) {
            if (mn < mx) {
                let left, right, middle
                left = mn
                right = mx
                middle = population[Math.floor(Math.random() * (right - left)) + left][0]
                do {
                    while (population[left][0] < middle) {
                        left++;
                    }
                    while (population[right][0] > middle) {
                        right--;
                    }
                    if (left <= right) {
                        let t = population[left]
                        population[left] = population[right]
                        population[right] = t
                        left++
                        right--
                    }
                } while (left < right);
                sort_population(population, mn, right)
                sort_population(population, left, mx)
            }


        }

        function mutation(individual) {
            let mutation_percent = 5
            let random_percent = Math.floor(Math.random() * (101));
            if (random_percent <= mutation_percent) {
                let first_ind = Math.floor(Math.random() * (individual.length - 1)) + 1
                let second_ind = -1
                while (second_ind === -1) {
                    let ind = Math.floor(Math.random() * (individual.length - 1)) + 1
                    if (ind !== first_ind) {
                        second_ind = ind
                    }
                }
                let t = individual[first_ind]
                individual[first_ind] = individual[second_ind]
                individual[second_ind] = t
            }
            individual.shift()
            individual.unshift(fitness(individual))

        }


        function crossing(population) {
            let first_individual = population[0]
            let second_individual = population[1]
            let break_point = Math.round(((first_individual.length) / 2))
            let first_descendant = []
            let second_descendant = []
            let first_visited = []
            let second_visited = []
            for (let i = 1; i < first_individual.length; i++) {
                if (i < break_point) {
                    first_descendant.push(first_individual[i])
                    first_visited.push(first_individual[i])
                    second_descendant.push(second_individual[i])
                    second_visited.push(second_individual[i])
                } else {
                    if (first_visited.includes(second_individual[i]) === false) {
                        first_descendant.push(second_individual[i])
                        first_visited.push(second_individual[i])
                    }
                    if (second_visited.includes(first_individual[i]) === false) {
                        second_descendant.push(first_individual[i])
                        second_visited.push(first_individual[i])
                    }
                }
            }
            for (let j = 1; j < first_individual.length; j++) {
                if (first_descendant.includes(first_individual[j]) === false) {
                    first_descendant.push(first_individual[j])
                }
                if (second_descendant.includes(second_individual[j]) === false) {
                    second_descendant.push(second_individual[j])
                }
            }

            first_descendant.unshift(fitness(first_descendant))
            second_descendant.unshift(fitness(second_descendant))
            population.push(first_descendant)
            population.push(second_descendant)
            sort_population(population, 0, population.length - 1)
            population.splice(-1, 1)
            population.splice(-1, 1)
        }

        function random_way(point_count) {
            let points = []
            while (points.length !== point_count) {
                let point = Math.floor(Math.random() * point_count)
                if (points.includes(point) === false) {
                    points.push(point)
                }
            }
            return points
        }

        function create_population(flowers) {
            let population_size = flowers.length * 2
            let population = []
            while (population.length < population_size) {
                let way = random_way(flowers.length)
                if (population.includes(way) === false) {
                    population.push(way)
                }
            }
            for (let i = 0; i < population_size; i++) {
                population[i].unshift(fitness(population[i]))
            }
            sort_population(population, 0, population.length - 1)
            return population
        }

        if (flowers.length > 1) {
            let population = create_population(flowers)
            let best_way = -1

            async function find_way() {
                for (let i = 0; i < Math.pow(flowers.length, 4); i++) {
                    ctx.beginPath();
                    crossing(population)
                    for (let j = 0; j < population.length; j++) {
                        mutation(population[j])
                    }
                    sort_population(population, 0, population.length - 1)
                    if (population[0][0] !== best_way) {
                        best_way = population[0][0]
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        let start_x = flowers[population[0][1]][0]
                        let start_y = flowers[population[0][1]][1]
                        ctx.moveTo(start_x, start_y)
                        for (let k = 2; k < population[0].length; k++) {
                            let x = flowers[population[0][k]][0]
                            let y = flowers[population[0][k]][1]
                            ctx.lineTo(x, y)
                        }
                        ctx.closePath();
                        ctx.strokeStyle = '#1a2edb'
                        ctx.stroke();
                        await new Promise(r => setTimeout(r, 25));
                    }
                }
                document.getElementById('path_found').style.visibility = 'visible';


            }

            find_way()

        }

    }
    document.querySelector('#clean').onclick = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        document.querySelectorAll('.flowers').forEach(function (a) {
            a.remove()
        })
        flowers = []
        document.getElementById('path_found').style.visibility = 'hidden'
    }


}