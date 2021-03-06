var minX,
	minY,
	maxW,
	maxH;

function configureListeners () {
	originalSvgCode.addEventListener('input', onChangeSvgCode);

	originalSvgContainer.addEventListener("scroll", onScrollOriginal);

	selectionSvgContainer.addEventListener("scroll", onScrollSelection);

	clearSelection.addEventListener("click", onClearSelection);

	selectAll.addEventListener("click", onSelectionAll);

	checkboxPosition.addEventListener("change", onChangePositionCheckbox);

	checkboxBorder.addEventListener("change", onChangeBorderCheckbox);

	checkboxParseInt.addEventListener("change", onChangeParseIntCheckbox);
}

configureListeners ();

function onSelectionAll (ev){
	clearAll();
	addInSelection(originalSvgOutput);
}

function onChangeParseIntCheckbox (ev){
	otimizeSelection();
}

function onChangeBorderCheckbox (ev){
	otimizeSelection();
}

function onChangePositionCheckbox (ev){
	otimizeSelection();
}

function onClearSelection (ev){
	clearAll();
}

function onScrollSelection (ev){
	originalSvgContainer.scrollTop = selectionSvgContainer.scrollTop;
	originalSvgContainer.scrollLeft = selectionSvgContainer.scrollLeft;	
}

function onScrollOriginal (ev){
	selectionSvgContainer.scrollTop = originalSvgContainer.scrollTop;
	selectionSvgContainer.scrollLeft = originalSvgContainer.scrollLeft;	
}

function onChangeSvgCode (ev) {
	originalSvgOutput.innerHTML = originalSvgCode.value;

	// var bBox = originalSvgOutput.getBBox();

	// originalSvgOutput.setAttribute("width",bBox.width);
	// originalSvgOutput.setAttribute("height",bBox.height);

	// selectionSvgOutput.setAttribute("width",bBox.width);
	// selectionSvgOutput.setAttribute("height",bBox.height);


	originalSvgOutput.addEventListener("click", clickOriginalSvgHandler);
	originalSvgOutput.addEventListener("mouseover", overOriginalSvgHandler);
	originalSvgOutput.addEventListener("mouseout", outOriginalSvgHandler);
}

function  clearAll() {
	selectionSvgContainer.innerHTML = '<svg id="selectionSvgOutput" width="1600" height="1000"></svg>'; 
	optimizationSvgContainer.innerHTML = '<svg id="optimizationSvgOutput" width="1600" height="1000"></svg>'; 
}

function overOriginalSvgHandler(e){
	var target = getSelectionTarget(e);
	target.setAttribute('opacity', '0.5');
}

function outOriginalSvgHandler(e){
	var target = getSelectionTarget(e);
	target.removeAttribute('opacity');
}

function clickOriginalSvgHandler(e){
	var target = getSelectionTarget(e);
	addInSelection(target);
}

function addInSelection(target) {
	minX = 100000;
	minY = 100000;

	target.removeAttribute('opacity');
	var newElement = target.cloneNode(true);
	selectionSvgOutput.appendChild(newElement);

	var selectionSVG = selectionSvgOutput.cloneNode(true);

	if (optimizationSvgOutput.firstChild != null){
		optimizationSvgOutput.removeChild(optimizationSvgOutput.firstChild);
	}
	
	otimizeSelection();
}


function otimizeSelection(){
	var otimizedSVG = optimizeSVG(selectionSvgOutput.cloneNode(true));
	optimizationSvgOutput.innerHTML = otimizedSVG;
	optimizationSvgCode.value = otimizedSVG;

	inlineOptimizationSvgCode.value = otimizedSVG.replace(/(\r\n|\n|\r|\t)/gm,"");

	if (checkboxBorder.checked){
		optimizationSvgOutput.children[0].setAttribute("class","shape");
	} else {
		optimizationSvgOutput.children[0].setAttribute("class","");
	}

	var bBox = optimizationSvgOutput.getBBox();

	optimizationSvgOutput.setAttribute("width",bBox.width);
	optimizationSvgOutput.setAttribute("height",bBox.height);

	// console.log("bBox.width: " + bBox.width);
	// console.log("bBox.height: " + bBox.height);

	renderCanvg(otimizedSVG, bBox.width, bBox.height);


	// var teste = "var rectangle = new PIXI.Graphics();" + "\n"
	// // +"rectangle.lineStyle(4, 0xFF3300, 1);" + "\n"
	// +"rectangle.beginFill(0x66CCFF);" + "\n"
	// +"rectangle.drawRect(0, 0, 64, 64);" + "\n"
	// +"rectangle.endFill();" + "\n"
	// +"rectangle.x = 170;" + "\n"
	// +"rectangle.y = 170;" + "\n"
	// +"stage.addChild(rectangle);";

	// renderPixi(teste, bBox.width, bBox.height);
}


function optimizeSVG(selection){

	if (checkboxPosition.checked){
		var pointMin = parseAllElements(selection, null, null, false);
		var finalSelection = parseAllElements(selection, pointMin.x, pointMin.y, true);
	}

	return selection.innerHTML;
}

function renderCanvg(svg, width, height) {

	var canvasContainer = document.getElementById("canvasContainer");

	var canvas = document.createElement('canvas');

	canvas.setAttribute("width", width);
	canvas.setAttribute("height", height);

	canvasContainer.innerHTML = '';
	canvasContainer.appendChild(canvas);
	
	canvg(canvas, svg);
}

function parseAllElements(selection, mX, mY, change){
	minX = optimizeNumber(minX);
	minY = optimizeNumber(minY);

	if (minX < mX ){
		minX = mX;
	}

	if (minY < mY ){
		minY = mY;
	}


	console.log(">> " + JSON.stringify(selection.getBBox()));




	var xItem;
	var yItem; 


	if (selection.childElementCount == 1) {
		console.log("opa " + selection.nodeName);
	}

	var i;
	var item;
	var totalItems = selection.childElementCount;

	for (i = 0; i < totalItems; i++) {
		item = selection.children[i];

		if (item.nodeName === "polyline" || item.nodeName === "polygon") {
			parsePolylineOrPolygon (item, mX, mY, change);
		} else if (item.nodeName === "text") {
			parseText (item, mX, mY, change);
		} else if (item.nodeName === "circle") {
			parseCircle (item, mX, mY, change);
		} else if (item.nodeName === "ellipse") {
			parseEllipse (item, mX, mY, change);
		} else if (item.nodeName === "path") {
			parsePath (item, mX, mY, change);
		} else if (item.nodeName === "rect") {
			parseRect (item, mX, mY, change);
		} else if (item.nodeName === "g" || item.nodeName === "svg") {
			parseAllElements(item, minX, minY, change);
		} else {
			console.log("NO NODE NAME (item.nodeName): " + item.nodeName);
		}
	};

	return {x:minX, y:minY, selection:selection};
}

function parsePolylineOrPolygon (item, mX, mY, change){
	var i;

	for (i = 0; i < item.points.length; i++){

		var point = item.points[i];

		xItem = optimizeNumber(point.x);
		yItem = optimizeNumber(point.y);

		if (xItem < minX) {
			minX = xItem;
		}

		if (yItem < minY) {
			minY = yItem;
		}

		if (change){
			var newX = optimizeNumber(point.x - mX);
			var newY = optimizeNumber(point.y - mY);
			point.x = newX;
			point.y = newY;
		}
	}

	if (change){
		renderPixi(drawPixiPolylineOrPolygon(item));
	}
}



function parseText (item, mX, mY, change){
	var texto = item;

	var matrix = item.getCTM();

	xItem = optimizeNumber(matrix["e"]);
	yItem = optimizeNumber(matrix["f"]);

	if (xItem < minX) {
		minX = xItem;
	}

	if (yItem < minY) {
		minY = yItem;
	}

	if (change){
		item.setAttribute("transform", "matrix("+matrix["a"] + " " +matrix["b"] + " " + matrix["c"] + " " + matrix["d"] + " " + (xItem - mX) + " " + (yItem - mY) + ")");
	}

	if (change){
		renderPixi(drawPixiText(item));
	}
} 

function parseCircle (item, mX, mY, change){
	var cxItem = getFloatAttribute(item, "cx");
	var cyItem = getFloatAttribute(item, "cy");
	var rItem = getFloatAttribute(item, "r");

	cxItem = optimizeNumber(cxItem - (rItem/2));
	cyItem = optimizeNumber(cyItem - (rItem/2));

	if (cxItem < minX) {
		minX = cxItem;
	}

	if (cyItem < minY) {
		minY = cyItem;
	}

	if (change){
		item.setAttribute("cx", getFloatAttribute(item, "cx") - mX);
		item.setAttribute("cy", getFloatAttribute(item, "cy") - mY);
		item.setAttribute("r", optimizeNumber(rItem));
	}

	if (change){
		renderPixi(drawPixiCircle(item));
	}
}

function parseEllipse (item, mX, mY, change){
	var cxItem = getFloatAttribute(item, "cx");
	var cyItem = getFloatAttribute(item, "cy");	
	var rxItem = getFloatAttribute(item, "rx");
	var ryItem = getFloatAttribute(item, "ry");

	cxItem = optimizeNumber(cxItem - (rxItem/2));
	cyItem = optimizeNumber(cyItem - (ryItem/2));

	if (cxItem < minX) {
		minX = cxItem;
	}

	if (cyItem < minY) {
		minY = cyItem;
	}

	if (change){
		item.setAttribute("cx", getFloatAttribute(item, "cx") - mX);
		item.setAttribute("cy", getFloatAttribute(item, "cy") - mY);
		item.setAttribute("rx", optimizeNumber(rxItem));
		item.setAttribute("ry", optimizeNumber(ryItem));
	}
}

function parsePath (item, mX, mY, change){
	console.log("item.pathSegList: " + item.pathSegList);
	if (!item.pathSegList) {
		return;
	}


	for (j = 0; j < item.pathSegList.length; j++){

		var point = item.pathSegList[j];
		var letter = point.pathSegTypeAsLetter

		// if (letter === "M") {
		if (letter === "M" || letter === "L") {

			if (point.x < minX) {
				minX = point.x;
			}

			if (point.y < minY) {
				minY = point.y;
			}

			if (change){
				point.x = optimizeNumber(point.x - mX);
				point.y = optimizeNumber(point.y - mY);
			}
		}	
	}
}

function parseRect (item, mX, mY, change){
	if (item.hasAttribute("x")){
		xItem = getFloatAttribute(item, "x");

		if (xItem < minX) {
			minX = xItem;
		}

		if (change){
			item.setAttribute("x", optimizeNumber(xItem - mX));
		}
	}
	
	if (item.hasAttribute("y")){
		yItem = getFloatAttribute(item, "y");	

		if (yItem < minY) {
			minY = yItem;
		}

		if (change){
			item.setAttribute("y", optimizeNumber(yItem - mY));
		}
	}

	if (item.hasAttribute("width")){

		console.log("### " + getFloatAttribute(item, "width"));

		item.setAttribute("width", optimizeNumber(getFloatAttribute(item, "width")));
	}

	if (item.hasAttribute("height")){
		item.setAttribute("height", optimizeNumber(getFloatAttribute(item, "height")));
	}

	if (change){
		renderPixi(drawPixiRect(item));
	}
}

function getFloatAttribute(item, attr){
	if (item.hasAttribute(attr)){
		var value = parseFloat(item.getAttribute(attr));
		return optimizeNumber(value);
	}
	return 0;
}

function optimizeNumber(n){

	n = parseInt(n*10)/10;

	if (checkboxParseInt.checked){
		n = parseInt(n);
	}
	
	return n;
}

function getSelectionTarget (e) {
	var target = e.target;

	if (checkboxGroup.checked){
		target = target.parentNode;
	}

	return target;
}
