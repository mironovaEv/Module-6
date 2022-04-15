//ПЕРЕМЕННЫЕ ДЛЯ ХРАНЕНИЯ HTML-элементов
var canvas = document.getElementById("canvas");  //область, на которой отображаются точки
var inputArea = document.getElementById("input-area");  //область, которая считывает нажатия мыши, при рисовании
var eraserButton = document.getElementById("eraser");  //кнопка режима удаления точек
var placePointsButton = document.getElementById("place-points");  //кнопка режима рисования точек
var showCenters = document.getElementById("show-cluster-centers");  //галочка для отображения центров кластеров в методе K-means
var showEps = document.getElementById("show-eps");  //галочка для отображения eps-окрестностей точек в методе DBSCAN
var method = document.getElementById("method");  //выбор метода кластеризации

//ДРУГИЕ ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
var eraseMode = false;  //зажата ли кнопка мыши при удалении точек
var pointIndex = 0;  //счетчик для присвоения индексов точкам
var pointsCount = 0;  //счетчик числа точек

//СОБЫТИЯ
document.getElementById("run-button").onclick = clusterize;
placePointsButton.onclick = drawingModeOn;
eraserButton.onclick = eraserModeOn;
inputArea.onclick = drawPoint;
canvas.onmousedown = eraseModeTrigger;
canvas.onmouseup = eraseModeTrigger;

placePointsButton.style.transform = "scale(1.3)";  //отображать режим рисования точек включенным по умолчанию

//ДОБАВЛЕНИЕ ТОЧКИ
function drawPoint(event) {
    let point = document.createElement("div");
    let epsProx = document.createElement("div");
    let pointX = event.offsetX - 5.5;
    let pointY = event.offsetY - 5;

    point.className = "point";
    epsProx.className = "epsProx";
    point.id = pointIndex;
    point.style.left = pointX + "px";
    point.style.top = pointY + "px";
    canvas.appendChild(point);
    point.appendChild(epsProx);

    point.onclick = function(event) {
        event.currentTarget.remove();
    };
    point.onmousedown = erasePoint;
    point.onmouseup = eraseModeTrigger;
    point.onmousemove = erasePoint;

    pointIndex++;
    pointsCount++;
    if (pointsCount < 300) {
        clusterize();
    }
}

//ВКЛЮЧЕНИЕ РЕЖИМА РИСОВАНИЯ ТОЧЕК
function drawingModeOn() {
    inputArea.style.visibility = "visible";
    placePointsButton.style.transform = "scale(1.3)";
    eraserButton.style.transform = "scale(1)";
    showEps.dispatchEvent(new Event("input"));
}

//ВКЛЮЧЕНИЕ РЕЖИМА УДАЛЕНИЯ ТОЧЕК
function eraserModeOn() {
    inputArea.style.visibility = "hidden";
    placePointsButton.style.transform = "scale(1)";
    eraserButton.style.transform = "scale(1.3)";
    showEps.checked = false;
    showEps.dispatchEvent(new Event("input"));
}

//УДАЛЕНИЕ ТОЧКИ
function erasePoint(event) {
    if (eraseMode) {
        event.currentTarget.remove();
        pointsCount--;
        if (pointsCount)
            clusterize();
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

//АЛГОРИТМ КЛАСТЕРИЗАЦИИ ОБОИМИ МЕТОДАМИ
function clusterize () {
    console.clear();
    let points = inputCoord();  //массив объектов точек
    if (!points.length) {
        alert("Разместите точки!");
        return;
    }
    
    //[АЛГОРИТМ МЕТОДА K-MEANS]

    let KMclusters = [];  //массив кластеров для K-means
    let k = document.getElementById("k-value").value;  //число кластеров в K-means
    let stop = false;  //для остановки K-means
    let centerNewX, centerNewY;  //координаты центра массы кластера
    
    if (points.length < k) {
        alert("Число точек не должно быть меньше числа кластеров k!");
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

    //ГЕНЕРАЦИЯ СЛУЧАЙНЫХ НЕПОВТОРЯЮЩИХСЯ ЦЕНТРОВ КЛАСТЕРОВ / СОЗДАНИЕ ОБЪЕКТОВ ДЛЯ k КЛАСТЕРОВ
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

    console.log("[K-MEANS START]")
    console.log("[PHASE 0][Random cluster centers]");
    for (let i in KMclusters) {
        console.log(i + ":", KMclusters[i].center.index);
    }

    //ПЕРЕРАСПРЕДЕЛЕНИЕ ЦЕНТРОВ КЛАСТЕРОВ, ПОКА ИЗМЕНЕНИЯ НЕ ПРЕКРАТЯТСЯ
    while(!stop) {
        //НАХОЖДЕНИЕ БЛИЖАЙШЕГО ЦЕНТРА КЛАСТЕРА ДЛЯ КАЖДОЙ ТОЧКИ
        for (let i in points) {
            points[i].KMcluster = closestCenter(KMclusters, k, points[i]);
            KMclusters[points[i].KMcluster].numberOfPoints++;
            KMclusters[points[i].KMcluster].xSum += points[i].x;
            KMclusters[points[i].KMcluster].ySum += points[i].y;
        }

        //ОПРЕДЕЛЕНИЕ НОВОГО ЦЕНТРА ДЛЯ КАЖДОГО КЛАСТЕРА
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

    console.log("[K-MEANS END]");

    //[АЛГОРИТМ МЕТОДА DBSCAN]

    let eps = document.getElementById("epsilon").value;
    let minPts = document.getElementById("minPts").value;

    //ПРИСВОЕНИЕ КАЖДОЙ EPS-ОКРЕСНОСТИ ПРАВИЛЬНОГО РАЗМЕРА И РАСПОЛОЖЕНИЯ ОТНОСИТЕЛЬНО ЕЕ ТОЧКИ
    let epsProxs = document.getElementsByClassName("epsProx");
    for (let i = 0; i < epsProxs.length; i++) {
        epsProxs[i].style.width = 2 * eps + "px";
        epsProxs[i].style.height = 2 * eps + "px";
        epsProxs[i].style.left = `${Number(3 - Number(eps))}px`;
        epsProxs[i].style.top = `${Number(3 - Number(eps))}px`;
    }

    let C = 0;  //счетчик кластеров
    let neighbors = [];  //текущие соседи
    let seedSet = [];  //текущие соседи для расширения кластера

    points.forEach(P => {
        //ПРОПУСКАЕМ УЖЕ ПОМЕЧЕННЫЕ ТОЧКИ
        if(P.label) {
            return;
        }

        //ПРИСВАИВАЕМ МЕТКУ NOISE И ПЕРЕХОДИМ К СЛЕДУЮЩЕЙ ТОЧКЕ, ЕСЛИ ЧИСЛА СОСЕДЕЙ НЕДОСТАТОЧНО
        neighbors = rangeQuery(points, P, eps);
        if (neighbors.length < minPts) {
            P.label = "noise";
            return;
        }

        //ЕСЛИ ЧИСЛА СОСЕДЕЙ ХВАТАЕТ, ВЫПОЛНЯЕМ СЛЕДУЮЩИЕ ДЕЙСТВИЯ
        C++;  //переход к новому кластеру
        P.label = "core";  //делаем точку основной
        P.DBSCANcluster = C;  //присваиваем основной точке кластер
        seedSet = neighbors.filter(function(value) {
            return value != P;
        });//создаем очередь точек для расширения кластера

        //ПРОХОДИМСЯ ПО КАЖДОЙ ТОЧКЕ ИЗ ОЧЕРЕДИ
        for (let i = 0, n = seedSet.length; i < n; i++) {
            //ЕСЛИ ТОЧКА ПО СОСЕДСТВУ С ОСНОВНОЙ ИМЕЕТ НЕДОСТАТОЧНО СОСЕДЕЙ ДЕЛАЕМ ЕЕ ПОГРАНИЧНОЙ ТОЧКОЙ КЛАСТЕРА
            let Q = seedSet[i];
            if (Q.label == "noise") {
                Q.label = "edge";
                Q.DBSCANcluster = C;
            }

            //ЕСЛИ ТОЧКА УЖЕ БЫЛА ПРОЙДЕНА, ПЕРЕХОДИМ К СЛЕДУЮЩЕЙ В ОЧЕРЕДИ
            if (Q.label) {
                continue;
            }
            
            //ЕСЛИ ЖЕ ТОЧКА НЕ ПРОВЕРЕНА, ДОБАВЛЯЕМ ЕЕ В КЛАСТЕР,
            //И В ЗАВИСИМОСТИ ОТ ЧИСЛА ЕЕ СОСЕДЕЙ ДЕЛАЕМ ЛИБО ОСНОВНОЙ, ЛИБО ПОГРАНИЧНОЙ
            Q.DBSCANcluster = C;
            let neighbors = rangeQuery(points, Q, eps);
            if (neighbors.length >= minPts) {
                Q.label = "core";
                seedSet = union(seedSet, neighbors);  //добавляем соседей точки в очередь на расширение, если их там не было
                n = seedSet.length;
            } else {
                Q.label = "edge";;
            }
        }
    });

    displayChanges(points, KMclusters, k, C);  //выводим все изменения
    console.log("Points count -", pointsCount);
}

function displayChanges(points, KMclusters, k, C) {
    if (method.value == "k-means") {
        for (let i in points) {
            let P = document.getElementById(points[i].index);
            P.style.backgroundColor = `hsl(${clusterColor(points[i].KMcluster, k)}, 100%, 50%)`;
            P.style.borderColor = "black";
            P.firstChild.style.visibility = "hidden";
        }
    }
    if (method.value == "dbscan") {
        for (let i in points) {
            let P = document.getElementById(points[i].index);
            if (points[i].label == "noise") {
                P.style.backgroundColor = "black";
                P.style.borderColor = "black";
                P.firstChild.style.borderColor = "black";
                P.firstChild.style.visibility = "hidden";
            } else if (points[i].label == "core") {
                P.style.backgroundColor = `hsl(${clusterColor(points[i].DBSCANcluster, C)}, 100%, 50%)`;
                P.style.borderColor = "black";
                P.firstChild.style.backgroundColor = `hsla(${clusterColor(points[i].DBSCANcluster, C)}, 100%, 50%, 10%)`;
                P.firstChild.style.borderStyle = "none";
            } else if (points[i].label == "edge") {
                P.style.backgroundColor = `hsl(${clusterColor(points[i].DBSCANcluster, C)}, 100%, 50%)`;
                P.style.borderColor = `hsl(${clusterColor(points[i].DBSCANcluster, C)}, 100%, 50%)`;
                P.firstChild.style.borderColor = `hsl(${clusterColor(points[i].DBSCANcluster, C)}, 100%, 50%)`;
                P.firstChild.style.visibility = "hidden";
            }
            if (showEps.checked && points[i].label == "core" && inputArea.style.visibility != "hidden") {
                document.getElementById(points[i].index).firstChild.style.visibility = "visible";
            } else {
                document.getElementById(points[i].index).firstChild.style.visibility = "hidden";
            }

        }
    }

    while (document.getElementById("clusterCenter")) {
        document.getElementById("clusterCenter").remove();
    }

    if (showCenters.checked && method.value == "k-means") {
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

    method.oninput = function() {
        displayChanges(points, KMclusters, k, C);
    }
    showEps.oninput = function() {
        displayChanges(points, KMclusters, k, C);
    }
    showCenters.oninput = function() {
        displayChanges(points, KMclusters, k, C);
    }
    document.getElementById("epsilon").oninput = function() {
        if (pointsCount && pointsCount < 300) {
            clusterize();
        }
    }
    document.getElementById("minPts").oninput = function() {
        if (pointsCount) {
            clusterize();
        }
    }
    document.getElementById("k-value").oninput = function() {
        if (pointsCount) {
            clusterize();
        }
    }
}

//СЧИТЫВАНИЕ КООРДИНАТ И ИНДЕКСОВ ТОЧЕК
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

//РАССТОЯНИЕ МЕЖДУ ТОЧКАМИ
function dist(pointA, pointB) {
    return Math.sqrt((pointB.x - pointA.x) ** 2 + (pointB.y - pointA.y) ** 2);
}

//ВЫЧИСЛЕНИЕ СОСЕДЕЙ В EPS-ОКРЕСНОСТИ ТОЧКИ Q
function rangeQuery(points, Q, eps) {
    let neighbors = [];
    points.forEach(P => {
        if (dist(Q, P) <= eps) {neighbors.push(P);}
    });
    return neighbors;
}

//ОБЪЕДИНЕНИЕ МНОЖЕСТВ ТОЧЕК
function union(set1, set2) {
    let U = set1;
    let found;
    set2.forEach(element2 => {
        found = false;
        set1.forEach(element1 => {
            if (element2.index == element1.index) {
                found = true;
                return;
            }
        });
        if (!found) {
            U.push(element2);
        }
    });
    return U;
}

//НАХОЖДЕНИЕ БЛИЖАЙШЕГО ЦЕНТРА КЛАСТЕРА
function closestCenter(KMclusters, k, point) {
    let min = 0;
    for (let i = 1; i < k; i++) {
        if (dist(point, KMclusters[i].center) < dist(point, KMclusters[min].center)) {
            min = i;
        }
    }
    return min;
}

//ВЫЧИСЛЕНИЕ УНИКАЛЬНОГО ЦВЕТА ДЛЯ КЛАСТЕРА (возвращает значение hue в системе hsl)
function clusterColor(cluster, k) {
    return Math.floor((360 / k) * cluster);
}

//КОНСТРУКТОР ОБЪЕКТА ТОЧКИ
function point(index, x, y, KMcluster = 0, label = undefined, DBSCANcluster = undefined) {
    this.index = index;  //индекс точки
    this.x = x;  //координата x
    this.y = y;  //координата y
    this.KMcluster = KMcluster;  //k-means кластер
    this.label;  //DBSCAN метка
    this.DBSCANcluster = DBSCANcluster;  //DBSCAN кластер
}

//КОНСТРУКТОР ОБЪЕКТА K-MEANS КЛАСТЕРА 
function KMcluster(center, numberOfPoints = 0, xSum = 0, ySum = 0) {
    this.center = center;  //центральная точка кластера
    this.numberOfPoints = numberOfPoints;  //число точек в кластере
    this.xSum = xSum;  //сумма x-координат всех точек
    this.ySum = ySum;  //сумма y-координат всех точек
}