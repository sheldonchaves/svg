function drawPixiRect (item) {
	var obj = "var object = new PIXI.Graphics();" + "\n"
	// +"object.lineStyle(4, 0xFF3300, 1);" + "\n"
	+"object.beginFill(" + hexToPixiColor(item.getAttribute("fill")) + ");" + "\n"
	+"object.drawRect(0, 0, "+ getFloatAttribute(item, "width") +", "+ getFloatAttribute(item, "height") +");" + "\n"
	+"object.endFill();" + "\n"
	+"object.x = "+ getFloatAttribute(item, "x") +";" + "\n"
	+"object.y = "+ getFloatAttribute(item, "y") +";" + "\n"
	+"stage.addChild(object);";
	return obj;
}

function drawPixiCircle	 (item) {
	var obj = "var object = new PIXI.Graphics();" + "\n"
	// +"object.lineStyle(4, 0xFF3300, 1);" + "\n"
	+"object.beginFill(" + hexToPixiColor(item.getAttribute("fill")) + ");" + "\n"
	+"object.drawCircle("+ getFloatAttribute(item, "cx") +", "+ getFloatAttribute(item, "cy") +", "+ getFloatAttribute(item, "r") +");" + "\n"
	+"object.endFill();" + "\n"
	+"object.x = "+ getFloatAttribute(item, "x") +";" + "\n"
	+"object.y = "+ getFloatAttribute(item, "y") +";" + "\n"
	+"stage.addChild(object);";
	return obj;
}

function drawPixiPolylineOrPolygon (item) {

	var path = [];

	for (j = 0; j < item.points.length; j++){
		var point = item.points[j];
		path.push(point.x);
		path.push(point.y);
	}

	var obj = "var object = new PIXI.Graphics();" + "\n"
	// +"object.lineStyle(4, 0xFF3300, 1);" + "\n"
	+"object.beginFill(" + hexToPixiColor(item.getAttribute("fill")) + ");" + "\n"
	+"object.drawPolygon("+ path +");" + "\n"
	+"object.endFill();" + "\n"
	+"stage.addChild(object);";
	return obj;

}

function drawPixiText (item) {

	var matrix = item.getCTM();

	var obj = "var object = new PIXI.Text('"+ item.innerHTML +"', {font: '" + item.getAttribute("font-size") +"px "+ item.getAttribute("font-family").replace("'", "") +", fill: "+ hexToPixiColor(item.getAttribute("fill")) +"} );" + "\n"
	// +"object.position.set("+50+", "+50+");" + "\n";
	+"object.x = "+matrix["e"]+";" + "\n"
	+"object.y = "+(matrix["f"] - item.getAttribute("font-size"))+";" + "\n"
	+"stage.addChild(object);";
	return obj;
}

function drawPixiEllipse	 (item) {
	// var ellipse = new PIXI.Graphics();
	// ellipse.beginFill(0xFFFF00);
	// ellipse.drawEllipse(0, 0, 50, 20);
	// ellipse.endFill();
	// ellipse.x = 180;
	// ellipse.y = 130;
	// stage.addChild(ellipse);
}

function hexToPixiColor(hex){
	return hex.replace("#","0x");
}

var renderer;
var stage;

function renderPixi(object) {
	// console.log("renderPixi(): " + object);
	// console.log(stage);
	if (stage === undefined) {

    	// this.renderer = PIXI.autoDetectRenderer(800, 600, {
    	// 	view:null,
    	// 	transparent:false,
    	// 	antialias:true,
    	// 	preserveDrawingBuffer:true,
    	// 	resolution:1,
    	// 	clearBeforeRender:true
    	// });


		this.renderer = PIXI.autoDetectRenderer(800, 600,{	
				backgroundColor : 0xffffff,
				antialiasing: false,
				transparent: false,
				antialias:true,
				clearBeforeRender:true,
				preserveDrawingBuffer:true,
				resolution: 1
		});

		pixiOutput.appendChild(this.renderer.view);

		this.stage = new PIXI.Container();
	}
	
	
	var line;
	var lines = object.split('\n');
	for(var i = 0;i < lines.length;i++){
		line = lines[i];
	    eval(line + ";\n");

	    pixiCode.value += line + "\n";
	}

	pixiCode.value += "\n";

	renderer.render(this.stage);
}