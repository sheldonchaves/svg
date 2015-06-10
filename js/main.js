originalSvgCode.addEventListener('input', onChangeSvgCode);

originalSvgContainer.addEventListener("scroll", onScrollOriginal);
selectionSvgContainer.addEventListener("scroll", onScrollSelection);


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
	// console.log("originalSvgCode: " + originalSvgCode.value);
	// console.log("originalSvgOutput: " + originalSvgOutput.innerHTML);

	var groups = originalSvgOutput.querySelectorAll('g');

	originalSvgOutput.addEventListener("click", clickHandler);
	originalSvgOutput.addEventListener("mouseover", overHandler);
	originalSvgOutput.addEventListener("mouseout", outHandler);

	
}

function clickHandler(e){
	var target = e.target.parentNode;
	target.removeAttribute('opacity');
	var newElement = target.cloneNode(true);
	selectionSvgOutput.appendChild(newElement);

	// console.log("clickHandler:" + target);
	// console.log("clickHandler.parentNode:" + target.parentNode);
	// console.log("clickHandler:" + target);

	var selectionSVG = selectionSvgOutput.cloneNode(true);

	// console.log(">> " + optimizationSvgOutput.firstChild);
	// console.log(">>> " + optimizationSvgOutput.firstElementChild);

	optimizationSvgOutput.removeChild(optimizationSvgOutput.firstChild);

	//otimizeSVG
	optimizationSvgOutput.innerHTML = otimizeSVG(selectionSvgOutput.cloneNode(true));
}

function overHandler(e){
	var target = e.target.parentNode;
	target.setAttribute('opacity', '0.5');
	// console.log("overHandler:" + target);
}

function outHandler(e){
	var target = e.target.parentNode;
	target.removeAttribute('opacity');
	// console.log("outHandler:" + target);
}

var minX = 100000;
var minY = 100000;

function parseAllElements(selection, mX, mY, change){
	if (this.minX < mX ){
		this.minX = mX;
	}

	if (this.minY < mY ){
		this.minY = mY;
	}

	var xItem;
	var yItem; 

	var i;
	var j;
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

		if (xItem < this.minX) {
			this.minX = xItem;
		}

		if (yItem < this.minY) {
			this.minY = yItem;
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

	if (xItem < this.minX) {
		this.minX = xItem;
	}

	if (yItem < this.minY) {
		this.minY = yItem;
	}

	if (change){
		item.setAttribute("transform", "matrix("+matrix["a"] + " " +matrix["b"] + " " + matrix["c"] + " " + matrix["d"] + " " + (xItem - mX) + " " + (yItem - mY) + ")");
	}
} 

function parseCircle (item, mX, mY, change){
	var cxItem = parseFloat(item.getAttribute("cx"));
	var cyItem = parseFloat(item.getAttribute("cy"));	
	var rItem = parseFloat(item.getAttribute("r"));

	cxItem = cxItem - (rItem/2);
	cyItem = cyItem - (rItem/2);

	if (cxItem < this.minX) {
		this.minX = cxItem;
	}

	if (cyItem < this.minY) {
		this.minY = cyItem;
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

	if (cxItem < this.minX) {
		this.minX = cxItem;
	}

	if (cyItem < this.minY) {
		this.minY = cyItem;
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

	if (xItem < this.minX) {
		this.minX = xItem;
	}

	if (yItem < this.minY) {
		this.minY = yItem;
	}

	if (change){
		item.setAttribute("x", parseFloat(item.getAttribute("x")) - mX);
		item.setAttribute("y", parseFloat(item.getAttribute("y")) - mY);
	}
}

function otimizeSVG(selection){

	var pointMin = parseAllElements(selection, null, null, false);
	var finalSelection = parseAllElements(selection, pointMin.x, pointMin.y, true);

	return selection.innerHTML;
}
