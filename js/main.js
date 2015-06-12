var minX;
var minY;

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

	render(otimizedSVG, bBox.width, bBox.height);


}


function optimizeSVG(selection){

	if (checkboxPosition.checked){
		var pointMin = parseAllElements(selection, null, null, false);
		var finalSelection = parseAllElements(selection, pointMin.x, pointMin.y, true);
	}

	return selection.innerHTML;
}

function render(svg, width, height) {

	var canvasContainer = document.getElementById("canvasContainer");

	var canvas = document.createElement('canvas');

	canvas.setAttribute("width", width);
	canvas.setAttribute("height", height);

	canvasContainer.innerHTML = '';
	canvasContainer.appendChild(canvas);
	
	canvg(canvas, svg);
}

function parseAllElements(selection, mX, mY, change){
	if (minX < mX ){
		minX = mX;
	}

	if (minY < mY ){
		minY = mY;
	}

	minX = optimizeNumber(minX);
	minY = optimizeNumber(minY);

	var xItem;
	var yItem; 

	var i;
	var item;

	for (i = 0; i < selection.childElementCount; i++) {
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
	var j;

	for (j = 0; j < item.points.length; j++){

		var point = item.points[j];

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
}

function parseText (item, mX, mY, change){
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
