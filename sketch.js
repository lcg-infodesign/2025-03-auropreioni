let table; //variabile che mi contiene il dataset 
let points = []; //array in cui salvo la posizione x e y di ogni vulcano

let angleStep = 0.58; //mi dice di quanto pian piano si deve aprire la spirale 
let radiusBase = 10; //distanza tra i punti 

function preload() {
  table = loadTable("vulcani.csv", "csv", "header");
  //carico il dataset 

}
//SPIRALE 
function spiralLayout() {

  points = [];
  //voglio salvare tutte queste cordinate dentro un array che poi userò per disgenare 
  
  let xC = width/2; //centro della spirale = centro del canvas
  let yC = height/2; //stessa cosa per la y 

  let rowCount = table.getRowCount(); //numero di rghe del mio dataset
  
  //creo un glifo per ogni riga della tabella, usando un ciclo for 
  for (let i=0; i<rowCount; i++) { 
    
    let row = table.getRow(i); 
    //prende la riga numero i del dataset

    let lastEruption = row.get("Last Known Eruption"); // 
    //salva i codici dell'ultima colonna in una variabile 
    let typeCategoryRaw = row.get("Type Category"); 
    //stessa cosa 

    //per prendere tutti i casi 
    let typeCategory = "";
    if (typeCategoryRaw) {
      typeCategory = typeCategoryRaw.trim().toLowerCase();
    }
    
    //variabili per la SPRIALE 
    let theta = i*angleStep; //angolo rispetto al centro
    //angleStep è la costante per cui ogni volta ruotiamo, i cambia
    let r = radiusBase*Math.sqrt(i); //distanza dal centro
    //radice quadrata di i serve per farla crescere regolare 

    //COORDINATE PUNTI 
    //formula matematica 
    let x = xC + r * Math.cos(theta);
    let y = yC + r * Math.sin(theta);

    //uso queste cordinate poi nel draw per disegnare 
    points.push({
      x: x,
      y: y,
      radius: 4, // raggio del disegno
      last: lastEruption, //salvo per dopo 
      //ora ogni p ha anche una proprietà last 
      typeCategory: typeCategory
    });
  }
}

//FUNZIONE PER DEFINIRE I COLORI 
//la variabile code mi cambia in una di queste possibili variabili 
function colorLastEruption(code) {
  switch (code) {
    
    case "D1": return color(255, 180, 0);    // giallo scuro
    case "D2": return color(255, 140, 0);    // arancione caldo
    case "D3": return color(255, 90, 0);     // arancio-rosso
    case "D4": return color(230, 40, 0);     // rosso vivo
    case "D5": return color(190, 30, 20);    // rosso profondo
    case "D6": return color(130, 25, 20);    // rosso-mattone
    case "D7": return color(90, 25, 20);     // marrone-rosso scuro
    case "D":  return color(60, 20, 15);     // marrone bruciato

    
    case "P":  return color(80, 80, 80);     // grigio medio-scuro (freddo)
    case "Q":  return color(50, 45, 45);     // grigio-nero caldo (antracite)

  
    case "U":  return color(40, 40, 40);     // nero chiaro
    case "U1": return color(25, 25, 25);     // nero medio
    case "U7": return color(10, 10, 10);     // nero profondo

    
    case "?":       return color(255, 250, 180);  // giallo chiarissimo
    case "Unknown": return color(230, 230, 230);  // grigio chiarissimo

    // fallback neutro
    default:
      return color(240, 240, 240);
  }
}

//FUNZIONE PER DEFINIRE LA FORMA

function drawShapeForType(p) {
  let s = 8; // scala unica per tutte le forme
  let t = p.typeCategory || "";

  switch (t) {

    // 1. Stratovolcano → rettangolo verticale (cono alto classico)
    case "Stratovolcano":
      rectMode(CENTER);
      rect(p.x, p.y, s * 0.8, s * 1.6);
      break;

    // 2. Shield Volcano → quadrato (vulcano largo e piatto)
    case "Shield Volcano":
      rectMode(CENTER);
      square(p.x, p.y, s * 1.2);
      break;

    // 3. Caldera → cerchio (collasso circolare)
    case "Caldera":
      circle(p.x, p.y, s * 1.4);
      break;

    // 4. Cone → cono piroclastico = triangolo con base tonda
    case "Cone":
      // cono
      beginShape();
      vertex(p.x,         p.y - s * 1.0);     
      vertex(p.x - s*0.8, p.y + s * 0.4);
      vertex(p.x + s*0.8, p.y + s * 0.4);
      endShape(CLOSE);

      // base arrotondata
      arc(
        p.x,
        p.y + s * 0.4,
        s * 1.6,
        s * 0.5,
        0,
        PI
      );
      break;

    // 5. Crater System → esagono (sistema complesso di bocche)
    case "Crater System":
      beginShape();
      vertex(p.x,          p.y - s * 0.8);            // alto
      vertex(p.x + s*0.7,  p.y - s * 0.4);            // alto dx
      vertex(p.x + s*0.7,  p.y + s * 0.4);            // basso dx
      vertex(p.x,          p.y + s * 0.8);            // basso
      vertex(p.x - s*0.7,  p.y + s * 0.4);            // basso sx
      vertex(p.x - s*0.7,  p.y - s * 0.4);            // alto sx
      endShape(CLOSE);
      break;

    // 6. Maars / Tuff ring → ellisse larga e bassa (anello esplosivo basso)
    case "Maars / Tuff ring":
      ellipse(p.x, p.y, s * 1.8, s * 0.9);
      break;

    // 7. Submarine Volcano → rombo (diamante)
    case "Submarine Volcano":
      beginShape();
      vertex(p.x,         p.y - s * 0.8);
      vertex(p.x + s*0.8, p.y);
      vertex(p.x,         p.y + s * 0.8);
      vertex(p.x - s*0.8, p.y);
      endShape(CLOSE);
      break;

    // 8. Subglacial → barra orizzontale schiacciata
    case "Subglacial":
      rectMode(CENTER);
      rect(p.x, p.y, s * 1.8, s * 0.6);
      break;

    // 9. Other / Unknown → croce spessa
    case "Other / Unknown":
      strokeWeight(2);
      stroke(255);
      line(p.x - s*0.8, p.y - s*0.8, p.x + s*0.8, p.y + s*0.8);
      line(p.x + s*0.8, p.y - s*0.8, p.x - s*0.8, p.y + s*0.8);
      noStroke();
      break;

    // fallback se mai capita qualcosa di non in elenco
    default:
      circle(p.x, p.y, s * 1.2);
      break;
  }
}



function setup() {
  createCanvas(windowWidth, 1000);
  
  spiralLayout();

}

function draw() {
  background (54,54,54); //sfondo

//TITOLO "DATASET VULCANI"
  fill(248, 250, 252); // colore testo
  noStroke();
  textAlign(LEFT, TOP);
  textSize(20);
  text("DATASET VULCANI", 20, 20);

//disegno un cerchio per ogni punto 



  for (let i = 0; i < points.length; i++) {
    let p = points[i];

    let c = colorLastEruption(p.last);
    fill(c);         // applico quel colore
    noStroke();
    drawShapeForType(p);
  }

}
