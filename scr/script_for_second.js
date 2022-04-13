var canvas = document.getElementById("canvas");
var inputArea = document.getElementById("input-area");
var showCenters = document.getElementById("show-cluster-centers");
var placePointsButton = document.getElementById("place-points");
var eraserButton = document.getElementById("eraser");
var method = document.getElementById("method");
var eraseMode = false;
var pointIndex = 0;

placePointsButton.style.transform = "scale(1.3)";

document.getElementById("run-button").onclick = clusterize;
placePointsButton.onclick = drawingModeOn;
eraserButton.onclick = eraserModeOn;
inputArea.onclick = drawPoint;
canvas.onmousedown = eraseModeTrigger;
canvas.onmouseup = eraseModeTrigger;

function drawPoint(event) {
    let point = document.createElement("div");
    let pointX = event.offsetX - 5.5;
    let pointY = event.offsetY - 5;

    point.className = "point";
    point.id = pointIndex;
    pointIndex++;
    point.style.left = pointX + "px";
    point.style.top = pointY + "px";
    canvas.appendChild(point);
    point.onclick = function(event) {
        event.currentTarget.remove();
    };
    point.onmousedown = erasePoint;
    point.onmouseup = eraseModeTrigger;
    point.onmousemove = erasePoint;
}

function drawingModeOn() {
    inputArea.style.visibility = "visible";
    placePointsButton.style.transform = "scale(1.3)";
    eraserButton.style.transform = "scale(1)";
}

function eraserModeOn() {
    inputArea.style.visibility = "hidden";
    placePointsButton.style.transform = "scale(1)";
    eraserButton.style.transform = "scale(1.3)";
}

function erasePoint(event) {
    if (eraseMode) {
        event.currentTarget.remove();
    }
}

function eraseModeTrigger(event) {
    if (event.type == "mousedown") {
        eraseMode = true;
    }
    if (event.type == "mouseup") {
        eraseMode = false;
    }
}

//алгоритм кластеризации методом К-средних
function clusterize () {
    console.clear();

    let points = inputCoord();  //массив объектов точек
    let KMclusters = [];  //массив кластеров
    let k = document.getElementById("k-value").value;  //число кластеров
    let stop = false;
    let centerNewX, centerNewY;  //координаты центра массы кластера
    
    if (!points.length) {
        alert("Разместите точки!");
        return;
    }

    if (points.length < k) {
        alert("Число точек не должно быть меньше числа кластеров!");
        return;
    }

    if (k <= 0) {
        alert("Число кластеров не может быть равным нулю!");
        return;
    }

    for (let i in points) {
        console.log(points[i]);
    }
    console.log("k =", k)

    for (let i = 0; i < k; i++)
    {
        let randomPoint = points[Math.floor(Math.random() * points.length)];
        if (k / points.length <= 0.25) {
            for (let j = i - 1; j >= 0; j--) {
                if (randomPoint == KMclusters[j].center) {
                    randomPoint = points[Math.floor(Math.random() * points.length)];
                    j = i;
                }
            }
        }
        KMclusters.push(new KMcluster(Object.assign({}, randomPoint)));
    }

    console.log("[PHASE 0][Random cluster centers]");
    for (let i in KMclusters) {
        console.log(i + ":", KMclusters[i].center.index);
    }

    while(!stop) {
        for (let i in points) {
            points[i].KMcluster = closestCenter(KMclusters, k, points[i]);
            KMclusters[points[i].KMcluster].numberOfPoints++;
            KMclusters[points[i].KMcluster].xSum += points[i].x;
            KMclusters[points[i].KMcluster].ySum += points[i].y;
        }
        stop = true;
        for (let i in KMclusters) {
            if (KMclusters[i].numberOfPoints) {
                centerNewX = KMclusters[i].xSum / KMclusters[i].numberOfPoints;
                centerNewY = KMclusters[i].ySum / KMclusters[i].numberOfPoints;
                if (centerNewX == KMclusters[i].center.x && centerNewY == KMclusters[i].center.y) {
                    stop = stop && true;
                } else {
                    stop = false;
                }
                KMclusters[i].center.x = centerNewX;
                KMclusters[i].center.y = centerNewY;
                KMclusters[i].numberOfPoints = 0;
                KMclusters[i].xSum = 0;
                KMclusters[i].ySum = 0;
            }
        }

        console.log("[NEXT PHASE][Closest cluster center]");
        for (let i in points) {
            console.log(points[i].x, points[i].y, "->", points[i].KMcluster);
        }

        console.log("[Clusters new center of mass]");
        for (let i in KMclusters) {
            console.log(i + ":", KMclusters[i].center.x, KMclusters[i].center.y);
        }
    }

    displayChanges(points, KMclusters, k);
}

function displayChanges(points, KMclusters, k) {
    for (let i in points) {
        document.getElementById(points[i].index).style.backgroundColor = `hsl(${clusterColor(points[i].KMcluster, k)}, 100%, 50%)`;
    }

    while (document.getElementById("clusterCenter")) {
        document.getElementById("clusterCenter").remove();
    }

    if (showCenters.checked) {
        for (let i in KMclusters) {
            let clusterCenter = document.createElement("div");
            clusterCenter.className = "clusterCenter";
            clusterCenter.id = "clusterCenter";
            clusterCenter.style.borderColor = `hsl(${clusterColor(i, k)}, 100%, 50%)`;
            clusterCenter.style.left = `${KMclusters[i].center.x - 8}px`;
            clusterCenter.style.top = `${KMclusters[i].center.y - 7}px`;
            canvas.appendChild(clusterCenter);
        }
    }
}

//считывание координат и id точек
function inputCoord() {
    let pointsList = canvas.getElementsByClassName("point");
    let points = [];
    for (let i = 0; i < pointsList.length; i++) {
        points.push(new point(
            Number(pointsList[i].id),
            Number(pointsList[i].style.left.slice(0, -2)) + 6.5,
            Number(pointsList[i].style.top.slice(0, -2)) + 6));
    }
    return points;
}

//расстояние между точками
function dist(pointA, pointB) {
    return Math.sqrt((pointB.x - pointA.x) ** 2 + (pointB.y - pointA.y) ** 2);
}

//ближайший центр кластера к точке
function closestCenter(KMclusters, k, point) {
    let min = 0;
    for (let i = 1; i < k; i++) {
        if (dist(point, KMclusters[i].center) < dist(point, KMclusters[min].center)) {
            min = i;
        }
    }
    return min;
}

//вычисление уникального цвета для кластера (возвращает значение hue в системе hsl)
function clusterColor(cluster, k) {
    return Math.floor((360 / k) * cluster);
}

//конструктор объекта точки
function point(index, x, y, KMcluster = 0, label = undefined) {
    this.index = index;
    this.x = x;
    this.y = y;
    this.KMcluster = KMcluster;
    this.label;
}

//конструктор объекта кластера
function KMcluster(center, numberOfPoints = 0, xSum = 0, ySum = 0) {
    this.center = center;
    this.numberOfPoints = numberOfPoints;
    this.xSum = xSum;
    this.ySum = ySum;
}