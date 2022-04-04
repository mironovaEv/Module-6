var inputArea = document.getElementById("input-area"),
    canvas = document.getElementById("canvas");

inputArea.onclick = drawPoint;

function drawPoint(event) {
    console.log(event.offsetX + 1, event.offsetY + 2);
    let point = document.createElement("div");
    let pointX = event.offsetX - 5.5;
    let pointY = event.offsetY - 5;
    point.className = "point";
    point.style.left = pointX + "px";
    point.style.top = pointY + "px";
    canvas.appendChild(point);
}