let table; //variabile che mi contiene il dataset 
let points = []; //array in cui salvo la posizione x e y di ogni vulcano

let angleStep = 0.88; //mi dice di quanto pian piano si deve aprire la spirale 
let radiusBase = 14; //distanza tra i punti 

//nuova variabile per definire un hover 
let hoveredIndex = -1; 
//metto -1 perchè se con il mouse non sono sopra nulla, mi mette la riga -1
//che non esiste, ma se mettessi 0, mi darebbe la prima 
//CONVENZIONE 

function preload() {
  table = loadTable("vulcani.csv", "csv", "header");
  //carico il dataset 

}
//SPIRALE 
function spiralLayout() {

  //vedo in console i nomi CORRETTI di come sono salvate le mie colonne
  console.log("Nomicolonne:", table.columns);

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
    let typeCategoryRaw = row.get("TypeCategory"); 
    //stessa cosa 
    let volcanoNameRaw  = row.get("Volcano Name"); 
    let countryRaw      = row.get("Country");      

    //RIGHE SALVAGENTE (per evitare errori)
    //per prendere tutti i casi 
    let typeCategory = "";
    if (typeCategoryRaw) {
      typeCategory = typeCategoryRaw.trim().toLowerCase();
    }
    let volcanoName = volcanoNameRaw ? volcanoNameRaw.trim() : "Unknown volcano";
    let country     = countryRaw ? countryRaw.trim() : "Unknown country";
    //“Se volcanoNameRaw esiste e ha un valore (vero),
    //allora prendi quel valore e fai .trim() per togliere eventuali spazi.
    //Altrimenti, se non esiste (cioè è undefined o vuoto),
    //metti al suo posto la scritta "Unknown volcano".”

    //potevo usare un if, ma questo me lo rende più compatto 
    //mi evita degli errori 


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
      typeCategory: typeCategory,
      name: volcanoName,
      country: country //aggiungo nuove info legate al punto 
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

//metto due variabili 
function drawShapeForTypeSized(p, s)  {
  let t = (p.typeCategory || "").trim().toLowerCase();

  switch (t) {

    //rettangolo 
    case "stratovolcano":
      rectMode(CENTER); //punto di applicazione non angolo, ma centro 
      rect(p.x, p.y, s * 0.8, s * 1.6);
      break;

    //quadrato
    case "shield volcano":
      rectMode(CENTER); //same di sopra 
      square(p.x, p.y, s * 1.2);
      break;

    //cerchio
    case "caldera":
      circle(p.x, p.y, s * 1.4);
      break;

    //triangolo con base tonda
    case "cone":
      // cono
      beginShape(); //apro la forma con i punti 
      vertex(p.x,         p.y - s * 1.0);
      vertex(p.x - s*0.8, p.y + s * 0.4);
      vertex(p.x + s*0.8, p.y + s * 0.4);
      endShape(CLOSE); //chiudo la forma 

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

    //esagono
    case "crater system":
      beginShape();
      vertex(p.x,          p.y - s * 0.8);           
      vertex(p.x + s*0.7,  p.y - s * 0.4);            
      vertex(p.x + s*0.7,  p.y + s * 0.4);            
      vertex(p.x,          p.y + s * 0.8);           
      vertex(p.x - s*0.7,  p.y + s * 0.4);            
      vertex(p.x - s*0.7,  p.y - s * 0.4);           
      endShape(CLOSE);
      break;

    //ellisse larga e bassa
    case "maars / tuff ring":
      ellipse(p.x, p.y, s * 1.8, s * 0.9);
      break;

    //rombo
    case "submarine volcano":
      beginShape();
      vertex(p.x,         p.y - s * 0.8);
      vertex(p.x + s*0.8, p.y);
      vertex(p.x,         p.y + s * 0.8);
      vertex(p.x - s*0.8, p.y);
      endShape(CLOSE);
      break;

    //rettangolo orizzontale
    case "subglacial":
      rectMode(CENTER);
      rect(p.x, p.y, s * 1.8, s * 0.6);
      break;

    //croce spessa
    case "other / unknown":
      strokeWeight(2);
      stroke(255);
      line(p.x - s*0.8, p.y - s*0.8, p.x + s*0.8, p.y + s*0.8);
      line(p.x + s*0.8, p.y - s*0.8, p.x - s*0.8, p.y + s*0.8);
      noStroke();
      break;

    // fallback se mai capita qualcos'altro
    default:
      circle(p.x, p.y, s * 1.2);
      break;
  }
}

//FUNZIONE BOX INFORMATIVO (contiene nome e paese)
function drawTooltip(volcanoName, country) { 
  let line1 = volcanoName || "Unknown volcano"; 
  let line2 = country || "Unknown country"; 
  //inserisco le due variabili

  textSize(14); //grandezza font
  textAlign(LEFT, TOP); 

  let padding = 10; 
  let lineHeight = textAscent() + textDescent(); // altezza reale della riga
  let w1 = textWidth(line1); //larghezza prima riga
  let w2 = textWidth(line2); //larghezza seconda riga 
  let w = max(w1, w2) + padding * 2; //prendo la massima tra le due e aggiungo un padding 
  let h = lineHeight * 2 + padding * 2 + 4; // altezza del box 
  //altezza linee per due + padding + spazio tra le due righe (4)

  //spostare il la box leggermente dal mouse, come un'etichetta appesa
  let boxX = mouseX + 20; 
  let boxY = mouseY + 5; 

  fill(0, 0, 0, 200); //sfondo scuro 
  noStroke(); 
  rectMode(CORNER);
  rect(boxX, boxY, w, h); //disegno il rettangolo 
  
  //testo dentro bianco 
  fill(255);
 text(line1, boxX + padding, boxY + padding);
 text(line2, boxX + padding, boxY + padding + lineHeight + 4);
  }



function setup() {
  createCanvas(windowWidth, 1500);
  
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

//HOVER PER LEGGERE NOME E PAESE 
  hoveredIndex = -1; // reset della variabile 
  let hoverDistThreshold = 10; // distanza massima in px per considerare "hover"

   for (let i = 0; i < points.length; i++) { //apro un ciclo for 
    let p = points[i];

    // calcolo la distanza tra il mouse e il mio punto relativo al vulcano p 
    let d = dist(mouseX, mouseY, p.x, p.y);

    //se la mia distanza è minore della soglia che ho scritto prima 
    //allora accade qualcosa 
    if (d < hoverDistThreshold) {
      hoveredIndex = i; //salva l'inidice i (numero della riga) e non più -1
      break; // prendo il primo che trovo e basta, poi esco subito dal ciclo 
    }
  }

//DISEGNO DEI VARI VULCANI 

  for (let i = 0; i < points.length; i++) {

    if (i === hoveredIndex) continue; 
    //mi dice che se il mio punto è sotto il mouse di saltarlo, per ora

    let p = points[i];

    let c = colorLastEruption(p.last);
    fill(c);         // applico quel colore
    noStroke();
    drawShapeForTypeSized(p, 8);
  }

  if (hoveredIndex !== -1) { //controllo se è su un vulcano
    //se hoveredIndex non è uguale a -1, allora sto sopra a un punto 
    let p = points[hoveredIndex]; //vulcano su cui sono, non tutte le righe (i) come sopra 

    let c = colorLastEruption(p.last);
    fill(c);
    stroke(255);
    strokeWeight(1.2);
    // versione ingrandita
    drawShapeForTypeSized(p, 30);
    noStroke();

    //etichetta 
    drawTooltip(p.name, p.country);
  }
}
