var minX;
var minY;

function configureListeners () {
	originalSvgCode.addEventListener('input', onChangeSvgCode);

	originalSvgContainer.addEventListener("scroll", onScrollOriginal);
	selectionSvgContainer.addEventListener("scroll", onScrollSelection);

	clearSelection.addEventListener("click", onClearSelection);

	checkboxPosition.addEventListener("change", onChangePositionCheckbox);

	checkboxBorder.addEventListener("change", onChangeBorderCheckbox);
}

configureListeners ();

function onChangeBorderCheckbox (ev){
	otimizeSelection();
}

function onChangePositionCheckbox (ev){
	otimizeSelection();
}

function onClearSelection (ev){
	selectionSvgContainer.innerHTML = '<svg id="selectionSvgOutput" width="1600" height="1000"></svg>'; 
	optimizationSvgContainer.innerHTML = '<svg id="optimizationSvgOutput" width="1600" height="1000"></svg>'; 
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

	originalSvgOutput.addEventListener("click", clickOriginalSvgHandler);
	originalSvgOutput.addEventListener("mouseover", overOriginalSvgHandler);
	originalSvgOutput.addEventListener("mouseout", outOriginalSvgHandler);
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
	minX = 100000;
	minY = 100000;

	var target = getSelectionTarget(e);

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
	var otimizedSVG = otimizeSVG(selectionSvgOutput.cloneNode(true));
	optimizationSvgOutput.innerHTML = otimizedSVG;
	optimizationSvgCode.value = otimizedSVG;

	if (checkboxBorder.checked){
		optimizationSvgOutput.children[0].setAttribute("class","shape");
	} else {
		optimizationSvgOutput.children[0].setAttribute("class","");
	}
}

function render(svg, width, height) {

	document.createElement('canvas')
	var c = document.createElement('canvas');		
	c.width = width || 1000;
	c.height = height || 500;
	document.getElementById('canvas').innerHTML = '';
	document.getElementById('canvas').appendChild(c);
	
	canvg(c, svg);
}

function parseAllElements(selection, mX, mY, change){
	if (minX < mX ){
		minX = mX;
	}

	if (minY < mY ){
		minY = mY;
	}

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
		} else if (item.nodeName === "g") {
			parseAllElements(item, minX, minY, change);
		} else {
			console.log("NO NODE NAME (item.nodeName): " + item.nodeName);
		}
	};

	return {x:minX, y:minY, selection:selection};
}

function parsePolylineOrPolygon (item, mX, mY, change){
	for (j = 0; j < item.points.length; j++){

		var point = item.points[j];

		xItem = parseFloat(point.x);
		yItem = parseFloat(point.y);

		if (xItem < minX) {
			minX = xItem;
		}

		if (yItem < minY) {
			minY = yItem;
		}

		if (change){
			point.x = point.x - mX;
			point.y = point.y - mY;
		}
	}
}

function parseText (item, mX, mY, change){
	var matrix = item.getCTM();

	xItem = matrix["e"];
	yItem = matrix["f"];

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

	cxItem = cxItem - (rItem/2);
	cyItem = cyItem - (rItem/2);

	if (cxItem < minX) {
		minX = cxItem;
	}

	if (cyItem < minY) {
		minY = cyItem;
	}

	if (change){
		item.setAttribute("cx", parseFloat(item.getAttribute("cx")) - mX);
		item.setAttribute("cy", parseFloat(item.getAttribute("cy")) - mY);
	}
}

function parseEllipse (item, mX, mY, change){
	var cxItem = parseFloat(item.getAttribute("cx"));
	var cyItem = parseFloat(item.getAttribute("cy"));	
	var rxItem = parseFloat(item.getAttribute("rx"));
	var ryItem = parseFloat(item.getAttribute("ry"));

	cxItem = cxItem - (rxItem/2);
	cyItem = cyItem - (ryItem/2);

	if (cxItem < minX) {
		minX = cxItem;
	}

	if (cyItem < minY) {
		minY = cyItem;
	}

	if (change){
		item.setAttribute("cx", parseFloat(item.getAttribute("cx")) - mX);
		item.setAttribute("cy", parseFloat(item.getAttribute("cy")) - mY);
	}
}

function parsePath (item, mX, mY, change){
	for (j = 0; j < item.pathSegList.length; j++){

		var point = item.pathSegList[j];
		var letter = point.pathSegTypeAsLetter

		if (letter === "M" || letter === "L") {
			if (change){
				point.x = point.x - mX;
				point.y = point.y - mY;
			}
		}
	}
}

function parseRect (item, mX, mY, change){
	xItem = parseFloat(item.getAttribute("x"));
	yItem = parseFloat(item.getAttribute("y"));

	if (xItem < minX) {
		minX = xItem;
	}

	if (yItem < minY) {
		minY = yItem;
	}

	if (change){
		item.setAttribute("x", parseFloat(item.getAttribute("x")) - mX);
		item.setAttribute("y", parseFloat(item.getAttribute("y")) - mY);
	}
}

function getFloatAttribute(item, attr){
	return parseFloat(item.getAttribute(attr));
}

function setFloatAttribute(item, attr, value){
	item.setAttribute(attr, value);
}

function getSelectionTarget (e) {
	var target = e.target;

	if (checkboxGroup.checked){
		target = target.parentNode;
	}

	return target;
}

function otimizeSVG(selection){
	var pointMin = parseAllElements(selection, null, null, false);

	if (checkboxPosition.checked){
		var finalSelection = parseAllElements(selection, pointMin.x, pointMin.y, true);
	}

	return selection.innerHTML;
}
