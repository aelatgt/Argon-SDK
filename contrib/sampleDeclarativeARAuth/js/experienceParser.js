//TODO msati3: All resources are not delay loaded. For example, currently, I am showing an image via CSS. That is blocking loaded. Should be the first issue to be 
//fixed to provide seamless experiences.

//TODO msati3:
//Feature List:
//a) Add support for basic objects of THREE.js
//b) Settle on declarative schema
//c) Scrub file for TODO comments


//***************************Warning: FRAGILE - Lack of sanity checks. Also, a very restricted set of tags are handled presently.********************************

var ExperienceLoader = function(file, clientInterface)  {
    //TODO msati3: support for only 1 trackedImageObject. Extend??
    var trackedImageObject = null; //The delay loaded image target populates this.
    var trackedFrameMarkersObject = {}; //Used as a <frameMarkerId, hideCallBack> <frameMarkerId,showCallBack> map, for trigerring these from the experience parser automatically.

    //Infra to support delay loading ColladaModels and TrackedImageTarget
    var augmentationsForImageObject = [];
    var augmentationIdsForImageObject = [];
    var augmentationMap = {}; //augmentationMap<augmentation.id, trackedObject>...the trackedObject has been
                                        //loaded and can be a FrameMarker so we can't use the above array logic.
    
    //Client and framework communication takes place through a clientInterface and a queryObject. The queryObject exposes the trackedObjects, 
    //while the clientInterface implements the callbacks. TODO msati3: I have thought about this for quite some time. Perhaps it is not the best design
    //and JavaScript offers something better?
    var queryObject = {}; //This stores a map of ID and references for the elements in the declerative augmentation file. Thus, the client can get anything possibly desired.

    function onAugmentationLoaded(augmentation) {
        //First go through the list in the imageObject
        for (var i = 0; i < augmentationIdsForImageObject.length; i++){
            //The undefined check is unnecessary here, but for readability after delete.
            //If the trackedImageObject has been loaded by then, then add to it, else push the object to the augmentationArray,
            //removing it from the augmentationIdsForImage array.
            if (augmentationIdsForImageObject[i] !== undefined && augmentationIdsForImageObject[i] == augmentation.id) {
                if (trackedImageObject!= null) {
                    trackedImageObject.add(augmentation.object);
                }
                else {
                    delete augmentationIdsForImageObject[i];
                    augmentationsForImageObject.push(augmentation);
                }
            }
        }
        //Now see the augmentationMap
        if (augmentation.id in augmentationMap) {
            var trackedObjectToBeAugmented = augmentationMap[augmentation.id];
            trackedObjectToBeAugmented.add(augmentation.object);
        }
	 queryObject[augmentation.id] = augmentation.object;
    }

    function onTrackedImageObjectPopulated(trackedImage) {
        trackedImageObject = trackedImage.trackedObject;
        for (var i = 0; i < augmentationsForImageObject.length; i++){
            //Loop loop through the augmentations loaded thus far and add them to trackedObject
            trackedImageObject.add(augmentationsForImageObject[i].object);
        }
	 queryObject[trackedImage.id] = trackedImageObject;
	 clientInterface[trackedImage.onLoadedClientCallback](trackedImageObject);
    }

     function fetchExperienceFile() {
        var xmlhttp=new XMLHttpRequest();
        xmlhttp.open("GET", file, false);
        xmlhttp.send();
        return xmlhttp.responseXML;
    }

    function parseTarget(targetNode) {
        var targetType = targetNode.getAttribute("type");
        var trackedObject = null;

        switch (targetType)
        {
            case "Image": trackedObject = loadImageTarget(targetNode);
                break;
            case "FrameMarker": trackedObject = loadFrameMarkerTarget(targetNode);
                break;
        }
	 queryObject[trackedObject.id] = trackedObject.trackedObject;

        var augmentations = targetNode.childNodes;
        for (var i = 0; i < augmentations.length; i++)
        {
	     if (isValidNode(augmentations[i])) {
	         var augmentation = parseAugmentation(augmentations[i]);
       	  //Due to delay loading of both ColladaModels and ImageTrackingObjects, there can be four cases.
            	  //a) The augmentation type is a simple type, and the trackingObject is a FrameMarker/ an ImageTrackingObject
	         //that has been fetched <quickly>
       	  //b) The augmentation type is a simple type, and the trackingObject is a non-fetched ImageTrackingObject
                //c) The augmentation type is a model and the trackingObject is a FrameMarker/ an ImageTrackingObject
            	  //that has been fetched <quickly>
                //d) The augmentation type is a model and the trackingObject is a non-fetched ImageTrackingObject.
                //For the delay loaded cases, we write relations to a map for later association.
                if (augmentation.object != null)
                {
                    if (trackedObject.trackedObject != null) {
                        trackedObject.trackedObject.add(augmentation.object);
                    }
                    else {
                        augmentationsForImageObject.push(augmentation);
                    }
                }
                else
                {
                    //This is the tricky case. The tracked object may be frame-markers as well. We need a map <augmentation.id, trackedObject>
                    //for this case.
                    //TODO msati3 (feature): We don't handle setting the same augmentation to multiple objects. Hmmm...
                    //TODO msati3 (cleanup): I am pretty sure the Array and Map logic can be combined into one coherent setup.
                    if (trackedObject.trackedObject != null) {
                        augmentationMap[augmentation.id] = trackedObject.trackedObject;
                    }
                    else {
                        augmentationIdsForImageObject.push(augmentation.id);
                    }
                }
		  queryObject[augmentation.id] = augmentation.object;
            }
        }
    }

    //Loads the ImageTarget Asynchronously
    function loadImageTarget(targetNode) {
        var uri = targetNode.getAttribute("dataSetUri");
        var name = targetNode.getAttribute("name");
	 var id = targetNode.getAttribute("id");
	 var imageTargetLoadedFunction = targetNode.getAttribute("onLoaded");
        ARGON.loadDataset(uri);

        function onDataSetLoaded(event) {
            var dataset;

            dataset = event.dataset;
            var target = dataset.targets[name];

            if (target != null)
            {
                var trackedImageObj    = new ARGON.TrackedObject();
                trackedImageObj.name   = "imageTarget";
                trackedImageObj.setTarget( target );
            }
	     trackedImageObj.autoHideAfterFrames = 20;
	     var trackedImageRet = {trackedObject: trackedImageObj, id: id, onLoadedClientCallback: imageTargetLoadedFunction};
            onTrackedImageObjectPopulated(trackedImageRet);
        }
        document.addEventListener("AR.DataSetLoadedEvent", onDataSetLoaded);
	 return {trackedObject: null,id: id};
    }

    function loadFrameMarkerTarget(targetNode) {
        var markerId = targetNode.getAttribute("markerId");
	 var id = targetNode.getAttribute("id");

	 var hideCallBack = targetNode.getAttribute("onHide");
	 var showCallBack = targetNode.getAttribute("onShow");

	 var hideCallBack = clientInterface[hideCallBack];
	 var showCallBack  = clientInterface[showCallBack];
	 
        var frameMarker   = new ARGON.FrameMarkerTarget (parseInt(markerId), "FrameMarker"+markerId, 50);
        var trackedObject = new ARGON.TrackedObject();
        trackedObject.setTarget(frameMarker);

	 trackedFrameMarkersObject[id] = {object: trackedObject, hideCallBack: hideCallBack, showCallBack: showCallBack};

	 return {trackedObject: trackedObject,id: id};
    }

    function parseAugmentation(augmentationNode) {
        var augmentationType = augmentationNode.getAttribute("type");
        var augmented3DObject = null;
        switch (augmentationType)
        {
            case "ColladaModel": augmented3DObject = loadColladaModel(augmentationNode);
                break;
            case "CssObject": augmented3DObject = loadCssObject(augmentationNode);
                break;
        }
	 return augmented3DObject;
    }

    //Handling different augmentation nodes. Code can be appended here to cater to more
    function loadColladaModel(augmentationNode){
        var augmented3DObject = {};
        
	 var object3DProps = readObject3DProps(augmentationNode);
        var loader = new THREE.ColladaLoader();
        var fileUri = augmentationNode.getAttribute("uri");
        loader.load(fileUri, function onLoadComplete(result) {
            var dae = result.scene;
            dae.scale.set(object3DProps.scale.x, object3DProps.scale.y, object3DProps.scale.z);
            dae.position.set(object3DProps.position.x, object3DProps.position.y, object3DProps.position.z);
            dae.rotation.set(object3DProps.rotation.x, object3DProps.rotation.y, object3DProps.rotation.z);
            augmented3DObject.object = dae;

            onAugmentationLoaded(augmented3DObject);
        });

        augmented3DObject.object = null;
        augmented3DObject.id = object3DProps.id;
        return augmented3DObject;
    }

     function loadCssObject(augmentationNode){
        var augmented3DObject = {};
        var object3DProps = readObject3DProps(augmentationNode);
        var cssProps = readCssProps(augmentationNode);

        var div = document.createElement('div');
        div.id = object3DProps.id;
        div.style.width = cssProps.width;
        div.style.height = cssProps.height;
        div.style.backgroundColor = cssProps.backgroundColor;
        div.style.position = cssProps.positionType;
        div.style.fontSize = cssProps.fontSize;
        div.style.WebkitTransform = cssProps.webkitTransform;
        div.innerHTML = cssProps.HTML;

        var cssObject = new THREE.CSSObject(div);
        cssObject.width = object3DProps.scale.x;
        cssObject.height = object3DProps.scale.y;
        cssObject.position.set(object3DProps.position.x, object3DProps.position.y, object3DProps.position.z);

        augmented3DObject.object = cssObject;
        augmented3DObject.id = object3DProps.id;
        return augmented3DObject;
    }

    function readObject3DProps(augmentationNode){
        var object3DProps = {};

        object3DProps.id = augmentationNode.getAttribute("id");
        object3DProps.scale = readVector3(augmentationNode.getAttribute("scale"));
        object3DProps.position = readVector3(augmentationNode.getAttribute("position"));
        object3DProps.rotation = readVector3(augmentationNode.getAttribute("rotation"));

        //Convert rotations to radians from degrees
        object3DProps.rotation.x = object3DProps.rotation.x * Math.PI / 180;
        object3DProps.rotation.y = object3DProps.rotation.y * Math.PI / 180;
        object3DProps.rotation.z = object3DProps.rotation.z * Math.PI / 180;

        return object3DProps;
    }

    function readCssProps(augmentationNode){
        //TODO msati3: the cssProps parser is arbitrarily implemented right now. Look at leveraging JS CSS parsing libs?
        var cssProps = {};
        cssProps.width = parseFloat(augmentationNode.getAttribute("styleWidth"));
        cssProps.height = parseFloat(augmentationNode.getAttribute("styleHeight"));
        cssProps.backgroundColor = augmentationNode.getAttribute("bgColor");
        cssProps.positionType = augmentationNode.getAttribute("positionType");
        cssProps.fontSize = augmentationNode.getAttribute("fontSize");
        cssProps.webKitTransform = augmentationNode.getAttribute("webKitTransform");
        cssProps.HTML = augmentationNode.getAttribute("HTML");
        return cssProps;
    }

    function readVector3(vectorString){
        var vector3 = {};
        var spliced = vectorString.split(",");
        if (spliced.length > 1){
            vector3.x = parseFloat(spliced[0]);
            vector3.y = parseFloat(spliced[1]);
            vector3.z = parseFloat(spliced[2]);
        }
        else{
            vector3.x = parseFloat(spliced[0]);
            vector3.y = vector3.x;
            vector3.z = vector3.x;
        }
        return vector3;
    }

    function isValidNode(node) {
    	return (node.nodeType == 1);
    }

    //This function ties down to ARGON.OnRender to allow pre-backed checking of triggers, which are then appropriately invoked in client code
    //I notice that the markers are no longer in view when the translations, rotations, etc remain the same. Keeping a 10 frame buffer for checking this
    //TODO msati3: This is a back hack/workaround. Perf issues as well.
    var hackyTimeStampTranslateLast = {};

    function internalOnRender(time){
	//First iterate over all the markers and see if they are visible or not to send a onHide/onShow event to the appropriate markers
	for(var prop in trackedFrameMarkersObject) {
	       if(trackedFrameMarkersObject.hasOwnProperty(prop)) { //id is the only own property the framemarkers have
			var newTranslationMatrix = queryObject[prop].threeObject3D.matrix.decompose()[0];
			if (!hackyTimeStampTranslateLast.hasOwnProperty(prop)) {
				if (newTranslationMatrix!==null){ //this is the first time this is called
					hackyTimeStampTranslateLast[prop] = newTranslationMatrix;
					trackedFrameMarkersObject[prop].hideCallBack(queryObject);
				}
			}
			else {
				if (newTranslationMatrix !==null){		
					if (newTranslationMatrix.x == hackyTimeStampTranslateLast[prop].x && 
			    		newTranslationMatrix.y == hackyTimeStampTranslateLast[prop].y &&
			    		newTranslationMatrix.z == hackyTimeStampTranslateLast[prop].z){
						trackedFrameMarkersObject[prop].hideCallBack(queryObject);
					}
					else {
						//JSLOG.log("Detected");
						hackyTimeStampTranslateLast[prop] = newTranslationMatrix;
						trackedFrameMarkersObject[prop].showCallBack(queryObject);
					}
				}
		  	}
           	}
	}

	renderFunction(time, queryObject);
    }
   
    //Populate the Experience DataStructures from the XML DOM
    var xmlDoc = fetchExperienceFile();

    //Set the name of the application as mentioned in XML
    document.title = xmlDoc.getElementsByTagName("Experience")[0].getAttribute("name");
    renderFunctionName = xmlDoc.getElementsByTagName("Experience")[0].getAttribute("onRender");
    var renderFunction = clientInterface[renderFunctionName];

    ARGON.onRender = internalOnRender;

    //Load the Experience Targets and associated augmentations
    var targets = xmlDoc.getElementsByTagName("Targets")[0].childNodes;

    for (var i = 0; i < targets.length; i++)
    {
	if (isValidNode(targets[i])) {
       	parseTarget(targets[i]);
	}
    }
}