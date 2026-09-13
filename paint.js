const board = document.getElementById("board");
const context = board.getContext("2d");

let isDrawing = false;
let color = "#00f0ff";
let frameSending = 1;

const frame1 = document.getElementById("f1");
const frame2 = document.getElementById("f2");
const frame3 = document.getElementById("f3");
const frame4 = document.getElementById("f4");
const frame5 = document.getElementById("f5");
const brushSize = document.getElementById("brush-size");
const fillButton = document.getElementById("fill-button");
const sendButton = document.getElementById("send-button");
const penButton = document.getElementById("pen");
const erraserButton = document.getElementById("erraser");
const IP="192.168.4.1";

board.addEventListener("mousedown", () => {isDrawing = true}); 
board.addEventListener("mouseup", () => { 
    isDrawing = false;
    context.beginPath();
});
board.addEventListener("mouseout", () => {isDrawing = false});
board.addEventListener("mousemove", draw);

sendButton.addEventListener("click",send);
fillButton.addEventListener("click", fillCanvas);
penButton.addEventListener("click", () => {color="#00f0ff"});
erraserButton.addEventListener("click", () => {color="#000000"});

frame1.addEventListener("click", () => {frameSending=1});
frame2.addEventListener("click", () => {frameSending=2});
frame3.addEventListener("click", () => {frameSending=3});
frame4.addEventListener("click", () => {frameSending=4});
frame5.addEventListener("click", () => {frameSending=5});


context.fillStyle = "black";
context.fillRect(0, 0, board.width, board.height);

function draw(e) {
    if (!isDrawing) return;

    context.lineWidth = brushSize.value;
    context.lineCap = "round";
    context.strokeStyle = color;

    context.lineTo(e.offsetX*0.25, e.offsetY*0.25);
    context.stroke();
    context.beginPath();
    context.moveTo(e.offsetX*0.25, e.offsetY*0.25);
}

function fillCanvas() {
    context.fillStyle = color;
    context.fillRect(0, 0, board.width, board.height);
}

function Bitmap() {
    const image = context.getImageData(0,0,128,64);
    const pixels = image.data;
    const bitmap = new Uint8Array(1024);
    for (let i = 0; i <64 ; i++) {
        for (let j =0; j < 128; j++) {
            const index = (i*128+j) *4
            const b = pixels[index+1];
            if (b>128) {
                const indexB = i * 16 + Math.floor(j/8);
                const indexb = 7 - (j %8);
                bitmap[indexB] |= (1 <<indexb);
            }
        }
    }
    return bitmap;
}

async function send() {
    const packet = new Uint8Array(1025);
    packet[0]=frameSending;
    const bitmap = Bitmap();
    packet.set(bitmap,1);
    try {
        const response = await fetch(`http://${IP}/frame`,{method: "POST", headers:{"Content-Type":"application/octet-stream"},body:packet});
        if(!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
    }catch (error) {
        alert(error);
    }
}