//----------------------------------------------------------------------//
// GLOBAL VARIABLES
//----------------------------------------------------------------------//

// GENERAL CONSTANTS
var XAXIS = new THREE.Vector3(1,0,0);
var YAXIS = new THREE.Vector3(0,1,0);
var ZAXIS = new THREE.Vector3(0,0,1);

var DEBUG = true; 		// Whether to run in debug mode
var startTime = 0; 		// When the scene was loaded (in seconds)
var frameStartTime = 0;
var frameDuration = 0;
var frameNum = 0;

var sceneURL = "";           // URL of the scene to be loaded
var sceneFolder;        // Subfolder containing scene files.

var rendererContainer;	// A div element that will hold the renderer
var loadingManager;		// loading manager

// MOUSE DATA
var mouseX = 0;			// Current position of mouse
var mouseY = 0;
var mousePrevX = 0;		// Previous position of mouse
var mousePrevY = 0;
var mouseDown = 0;  	// Which mouse button currently down
var mouseScroll = 0;	// How much the mouse wheel has scrolled
var mousePrevScroll = 0;

// KEYBOARD DATA
var pressedKeys = {};	// Which keys are currently depressed on the keyboard

// WINDOW SIZE
var windowWidth = 100;	// Current width and height of the window
var windowHeight = 100;

// SCENE SPECIFIC DATA
var currentScene;		// The current scene graph
var currentCamera;		// The current camera used to render the scene
var currentRenderer;	// The current renderer used to render the scene

//set as true after first scene rendered. Allows the definition of an afterLoad method.
var sceneLoaded = false;

var isMouseDown = false;

// INITIALIZATION AND STARTUP (EXECUTES WHEN PAGE LOADS)
processArgs();
init();
loadScene(sceneURL);
animate();

/**
 * Processes the URL arguments, which should contain the scene URL. Otherwise, it automatically loads the scene at {String} sceneURL.
 */
function processArgs()
{
    var href = window.location.href;
    var args = href.slice(href.indexOf('?') + 1).split('&');

    for(var i = 0; i < args.length; i++) {
        var arg = args[i].split('=');
        if (arg[0] == 'url') {
            sceneURL = arg[1];
        }
        else if (arg[0] == 'debug') {
            DEBUG = (arg[1] === 'true');
            // if (arg[1] == 'true') DEBUG = true;
            // else DEBUG = false;
        }
    }
    if(sceneURL.indexOf("/") > -1){
        sceneFolder = sceneURL.substring(0, sceneURL.lastIndexOf("/")+1);
    }
    if (sceneURL === "") {
        sceneURL = "sprint0a.json";
        DEBUG = true;
        debug("No scene specified\n");
        debug("Use: .../engine.html?url=sceneURL\n");
    }
}

/**
 * Performs general initialization. Creates the renderer and loading manager, and starts listening to the GUI events.
 */
function init()
{
    debug("init\n");

    // Create a container to hold the renderer and add it to the page
    rendererContainer = document.createElement( 'div' );
    document.body.appendChild( rendererContainer );

    // Make the loading manager for Three.js.
    loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = function ( item, loaded, total ) {
        // do nothing
    };

    // Create renderer and add it to the container (div element)
    var renderer = new THREE.WebGLRenderer( {antialias:true} );
    renderer.setPixelRatio( window.devicePixelRatio );
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    renderer.setSize( windowWidth, windowHeight );
    rendererContainer.appendChild( renderer.domElement );
    currentRenderer = renderer;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Add event listeners so we can respond to events
    window.addEventListener( 'resize', onWindowResize, false );
    //
    document.addEventListener( 'mouseup', onMouseUp, false );
    document.addEventListener( 'mousedown', onMouseDown, false );
    document.addEventListener( 'mousemove', onMouseMove, false );
    document.addEventListener( 'mousewheel', onMouseWheel, false);
    document.addEventListener( 'DOMMouseScroll', onMouseWheel, false); // firefox
    document.addEventListener('touchmove', onTouchMove, false);
    //
    window.onkeydown = onKeyDown;
    window.onkeyup = onKeyUp;
}

//------------------------------------------------------------------//
// EVENT LISTENERS
//------------------------------------------------------------------//

function onWindowResize(event)
{
    //debug("onWindowResize\n");

    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    currentCamera.aspect = windowWidth / windowHeight;
    currentCamera.updateProjectionMatrix();

    currentRenderer.setSize( windowWidth, windowHeight );
}

//------------------------------------------------------------------//

function onMouseUp(event)
{
    //debug("onMouseUp\n");
    mouseDown = 0;
    isMouseDown = false;
    //allows you to define a mouseUpEvent method to be called in scene files instead of having to be defined in engine.
    if(typeof(mouseUpEvent) == "function"){
        mouseUpEvent(event);
    }
}

function onMouseDown(event)
{
    //debug("onMouseDown " + event.which + "\n");
    mouseDown = event.which;
    isMouseDown = true;
    //allows you to define a mouseDownEvent method to be called in scene files instead of having to be defined in engine.
    if(typeof(mouseDownEvent) == "function"){
        mouseDownEvent(event);
    }
}

function onMouseMove(event)
{
    //debug("onMouseMove " + event.clientX + "," + event.clientY + "\n");
    //mousePrevX = mouseX;  // don't do this yet because asynchronous
    //mousePrevY = mouseY;
    mouseX = event.clientX;
    mouseY = event.clientY;
    if(typeof(mouseMoveEvent) == "function"){
        mouseMoveEvent(mouseX, mouseY);
    }
}
/**
 * Handles touch move events if the touchMoveEvent(xPos, yPos) exists in scene file.
 * @param event touch event.
 */
function onTouchMove(event){
    var xPos = event.touches[0].pageX;
    var yPos = event.touches[0].pageY;
    if(typeof(touchMoveEvent) == "function"){
        touchMoveEvent(xPos, yPos);
    }
}

function onMouseWheel(event)
{
    if (event.detail > 0 || event.detail < 0) {
        mouseScroll += event.detail/120.0;
    }
    if (event.wheelDelta > 0 || event.wheelDelta < 0) {
        mouseScroll += event.wheelDelta/120.0;
    }

    //debug("onMouseWheel " + mouseScroll + "\n");
}

//------------------------------------------------------------------//

function onKeyDown(event)
{
    var key = event.keyCode ? event.keyCode : event.which;
    pressedKeys[key] = true;
    debug("onKeyDown " + key + "\n");
}

function onKeyUp(event)
{
    var key = event.keyCode ? event.keyCode : event.which;

    if(typeof(keyUpEvent) == "function"){
        keyUpEvent(key);
    }

    delete pressedKeys[key];
    //debug("onKeyDown " + key + "\n");
}

/**
 * Prints debug messages in upper-left corner of scene.
 * @param message
 */
function debug(message)
{
    if (DEBUG)
    {
        var element = document.getElementById("debug");
        element.innerHTML += message;
    }
    console.log(message);
}

/**
 * Gets elapsed time since scene started.
 * @returns {Date}
 */

function getElapsedTime()
{
    var d = new Date();
    d = d.getTime() * 0.001 - startTime;
    return d;
}

//----------------------------------------------------------------------//
// LOAD A SCENE (ASYNCHRONOUSLY)
// THE SCENE IS LOADED FROM THE SPECIFIED URL AS A STRING, AND THEN
// PARSED AS A JSON OBJECT.  AT THAT POINT parseScene IS CALLED ON
// IT, WHICH RECURSIVELY WALKS THE parseTree CREATING A Three.js scene.
//----------------------------------------------------------------------//

function loadScene(sceneURL)
{
    var httpRequest = new XMLHttpRequest();
    httpRequest.open("GET", sceneURL, true);
    httpRequest.send(null);
    httpRequest.onload =
        function() {
            debug("loading " + sceneURL + " ...\n");
            var jsonParseTree = JSON.parse(httpRequest.responseText);
            debug("parsing\n");
            parseScene(jsonParseTree);
            debug("done.\n");
        }
}

//----------------------------------------------------------------------//
// ENTRY POINT TO RECURSIVE FUNCTION THAT TRAVERSES THE JSON PARSE
// TREE AND MAKES A SCENE.
//----------------------------------------------------------------------//

function parseScene(jsonParseTree)
{
    debug("parseScene\n");

    var scene = new THREE.Scene();
    currentScene = scene;
    parseSceneNode(jsonParseTree, scene);
    startTime = (new Date()).getTime() * 0.001; // reset start time
}

//----------------------------------------------------------------------//
// THE MAIN RECURSIVE FUNCTION OF THE PARSER.
// THE JOB OF parseSceneNode IS TO TRAVERSE THE JSON OBJECT jsonNode
// AND POPULATE A CORRESPONDING Three.js SceneNode
//----------------------------------------------------------------------//

function parseSceneNode(jsonNode, sceneNode)
{
    debug("parseSceneNode " + jsonNode["name"] + ":" + jsonNode["type"] + "\n");
    if (jsonNode === undefined || sceneNode === undefined) return;

    // Handle the transform of the node (translation, rotation, etc.)
    parseTransform(jsonNode, sceneNode);

    // Load any script files (note that these are not scripts attached
    // to the current node, just files that contain code.)
    if ("scriptFiles" in jsonNode) {
        var scriptList = jsonNode["scriptFiles"];
        scriptList = scriptList.map(function (e) {
            e = sceneFolder + e;
            return e;
        });
        for (var i=0; i<scriptList.length; i++) {
            var scriptURL = scriptList[i];
            loadScript(scriptURL);
        }
    }

    // User data that will be placed in the node. Can be arbitrary.
    // Includes the names of any scripts attached to the node.
    if ("userData" in jsonNode) {
        sceneNode["userData"] = jsonNode["userData"];
    } else {
        sceneNode["userData"] = {};
    }

    // Load and play background music
    if ("backgroundMusic" in jsonNode) {
        var audio = new Audio(jsonNode["backgroundMusic"]);
        debug("playing " + jsonNode["backgroundMusic"] + "\n");
        audio.play();
    }

    // The name of the node (useful to look up later in a script)
    if ("name" in jsonNode) {
        sceneNode["name"] = jsonNode["name"];
    }

    // Whether the node starts out as visible.
    if ("visible" in jsonNode) {
        sceneNode.visible = jsonNode["visible"];
    }

    // Traverse all the child nodes. The typical code pattern here is:
    //   1. call a special routine that creates the child based on its type.
    //      This routine also deals with attributes specific to that node type.
    //   2. Make a recursive call to parseSceneNode, which handles general
    //      properties that any node can include.

    if ("children" in jsonNode)
    {
        var light;
        var children = jsonNode["children"];
        for (var i=0; i<children.length; i++)
        {
            var childJsonNode = children[i];
            var childType = childJsonNode["type"];

            if (childType == "node") { // empty object to hold a transform
                var childSceneNode = new THREE.Object3D();
                sceneNode.add(childSceneNode);
                parseSceneNode(childJsonNode, childSceneNode);
            }
            if (childType == "perspectiveCamera") {
                var camera = parsePerspectiveCamera(childJsonNode);
                sceneNode.add(camera);
                if (currentCamera === undefined) currentCamera = camera;
                parseSceneNode(childJsonNode, camera);
            }
            else if (childType == "directionalLight") {
                light = parseDirectionalLight(childJsonNode);
                sceneNode.add(light);
                parseSceneNode(childJsonNode, light);
            }
            else if(childType == "ambientLight"){
                light = parseAmbientLight(childJsonNode);
                sceneNode.add(light);
                parseSceneNode(childJsonNode, light);
            }
            else if(childType == "pointLight"){
                light = parsePointLight(childJsonNode);
                sceneNode.add(light);
                parseSceneNode(childJsonNode, light);
            }
            else if(childType == "hemisphereLight"){
                light = parseHemisphereLight(childJsonNode);
                sceneNode.add(light);
                parseSceneNode(childJsonNode, light);
            }
            else if(childType == "spotLight"){
                light = parseSpotLight(childJsonNode);
                sceneNode.add(light);
                parseSceneNode(childJsonNode, light);
            }
            else if (childType == "mesh") {
                var mesh = parseMesh(childJsonNode);
                sceneNode.add(mesh);
                parseSceneNode(childJsonNode, mesh);
            }
        }
    }
}

//----------------------------------------------------------------------//
// PARSE A TRANSFORM
//----------------------------------------------------------------------//

function parseTransform(jsonNode, sceneNode)
{
    //debug("parseTransform\n");

    if ("translate" in jsonNode) {
        var translate = jsonNode["translate"];
        sceneNode.position.x += translate[0];
        sceneNode.position.y += translate[1];
        sceneNode.position.z += translate[2];
    }
    if ("scale" in jsonNode) {
        var scale = jsonNode["scale"];
        sceneNode.scale.x *= scale[0];
        sceneNode.scale.y *= scale[1];
        sceneNode.scale.z *= scale[2];
    }
    if ("rotate" in jsonNode) {
        var rotate = jsonNode["rotate"];
        var axis = new THREE.Vector3(rotate[0], rotate[1], rotate[2]);
        var radians = rotate[3];
        sceneNode.rotateOnAxis(axis, radians);
    }
}

//----------------------------------------------------------------------//
// PARSE A PERSPECTIVE CAMERA
//----------------------------------------------------------------------//

function parsePerspectiveCamera(jsonNode)
{
    //debug("parsePerspectiveCamera\n");

    // Start with default values
    var near = 0.2;
    var far = 10000.0;
    var aspect = windowWidth / windowHeight;
    var fovy = 60.0;
    var eye = [0.0, 0.0, 100.0];
    var vup = [0.0, 1.0, 0.0];
    var center = [0.0, 0.0, 0.0];

    // Replace with data from jsonNode
    if ("near"   in jsonNode) near   = jsonNode["near"];
    if ("far"    in jsonNode) far    = jsonNode["far"];
    if ("fov"    in jsonNode) fovy   = jsonNode["fov"];
    if ("eye"    in jsonNode) eye    = jsonNode["eye"];
    if ("vup"    in jsonNode) vup    = jsonNode["vup"];
    if ("center" in jsonNode) center = jsonNode["center"];

    // Create and return the camera
    var camera = new THREE.PerspectiveCamera( fovy, aspect, near, far );
    camera.position.set( eye[0], eye[1], eye[2] );
    camera.up.set( vup[0], vup[1], vup[2] );
    camera.lookAt( new THREE.Vector3(center[0], center[1], center[2]) );
    return camera;
}

//----------------------------------------------------------------------//
// PARSE A DIRECTIONAL LIGHT
//----------------------------------------------------------------------//

function parseDirectionalLight(jsonNode)
{
    //debug("parseDirectionalLight\n");

    // Start with default values
    var color = [1.0, 1.0, 1.0];
    var position = [1.0, 1.0, 1.0];

    // Replace with data from jsonNode
    if ("color"    in jsonNode) color    = jsonNode["color"];
    if ("position" in jsonNode) position = jsonNode["position"];

    // Create the light and return it
    var c = new THREE.Color(color[0], color[1], color[2]);
    var light = new THREE.DirectionalLight( c );
    light.position.set( position[0], position[1], position[2] );
    return light;
}

/**
 * Parses an ambient light node from JSON.
 * @param jsonNode Node to parse.
 * @returns {THREE.AmbientLight} Initialized ambientLight object.
 */
function parseAmbientLight(jsonNode){
    //Default color in RGB
    var color = [1.0, 1.0, 1.0];
    var intensity = 1.0;

    //Replaces default values with jsonNode values if defined.
    if("color" in jsonNode) color = jsonNode["color"];
    if("intensity" in jsonNode) intensity = jsonNode["intensity"];

    var c = new THREE.Color(color[0], color[1], color[2]);
    return new THREE.AmbientLight(c, intensity);

}

/**
 * Parses a point light node from JSON.
 * @param jsonNode Node to parse.
 * @returns {THREE.PointLight} Initialized pointLight object.
 */
function parsePointLight(jsonNode){
    //Default color in RGB
    var color = [1.0, 1.0, 1.0];
    var intensity = 1.0;
    var distance = 0;
    var position = [0, 1.0, 0];

    //Replaces default values with jsonNode values if defined.
    if("color" in jsonNode) color = jsonNode["color"];
    if("intensity" in jsonNode) intensity = jsonNode["intensity"];
    if("distance" in jsonNode) distance = jsonNode["distance"];
    if("position" in jsonNode) position = jsonNode["position"];


    var c = new THREE.Color(color[0], color[1], color[2]);
    var light = new THREE.PointLight(c, intensity, distance);
    light.position.set(position[0], position[1], position[2]);

    return light;
}

/**
 * Parses a hemisphere light node from JSON.
 * @param jsonNode Node to parse.
 * @returns {THREE.HemisphereLight} Initialized hemisphereLight object.
 */
function parseHemisphereLight(jsonNode){
    //Default color in RGB
    var skyColor = [1.0, 1.0, 1.0];
    var intensity = 1.0;
    var groundColor = 0;
    var position = [0, 1.0, 0];

    //Replaces default values with jsonNode values if defined.
    if("skyColor" in jsonNode) skyColor = jsonNode["skyColor"];
    if("intensity" in jsonNode) intensity = jsonNode["intensity"];
    if("groundColor" in jsonNode) groundColor = jsonNode["groundColor"];
    if("position" in jsonNode) position = jsonNode["position"];

    var sky = new THREE.Color(skyColor[0], skyColor[1], skyColor[2]);
    var ground = new THREE.Color(groundColor[0], groundColor[1], groundColor[2]);
    var light = new THREE.HemisphereLight(sky, ground, intensity);
    light.position.set(position[0], position[1], position[2]);

    return light;
}

/**
 * Parses a spot light node from JSON.
 * @param jsonNode Nde to parse
 * @returns {THREE.SpotLight} Initialized spotLight object.
 */
function parseSpotLight(jsonNode){
    //Default color in RGB
    var color = [1.0, 1.0, 1.0];
    var intensity = 1.0;
    var distance = 0;
    var position = [0, 1.0, 0];
    var angle = Math.PI/2;
    var penumbra = 0;
    var decay = 1;

    //Replaces default values with jsonNode values if defined.
    if("color" in jsonNode) color = jsonNode["color"];
    if("intensity" in jsonNode) intensity = jsonNode["intensity"];
    if("distance" in jsonNode) distance = jsonNode["distance"];
    if("position" in jsonNode) position = jsonNode["position"];
    if("angle" in jsonNode) angle = jsonNode["angle"];
    if("penumbra" in jsonNode) penumbra = jsonNode["penumbra"];
    if("decay" in jsonNode) decay = jsonNode["decay"];


    var c = new THREE.Color(color[0], color[1], color[2]);
    var light = new THREE.SpotLight(c, intensity, distance, angle, penumbra, decay);
    light.position.set(position[0], position[1], position[2]);
    if("castShadow" in jsonNode) light.castShadow = jsonNode["castShadow"];

    return light;
}

//----------------------------------------------------------------------//
// PARSE A MESH
//----------------------------------------------------------------------//

function parseMesh(jsonNode)
{
    //debug("parseMesh\n");
    var height = 2;
    var radius = 1;
    var heightSegments = 10;

    // Get the material
    var material = parseMaterial(jsonNode["material"]);

    // Create the mesh geometry
    var geometryType = jsonNode["geometry"];
    var geometry;

    if (geometryType == "cube") {
        var width = 2;
        var depth = 2;
        if ("width"  in jsonNode) width  = jsonNode["width"];
        if ("height" in jsonNode) height = jsonNode["height"];
        if ("depth"  in jsonNode) depth  = jsonNode["depth"];
        geometry = new THREE.BoxGeometry(width, height, depth);
        geometry.receiveShadow = true;
    }
    else if (geometryType == "sphere") {
        var widthSegments = 8;
        if ("radius"         in jsonNode) radius         = jsonNode["radius"];
        if ("widthSegments"  in jsonNode) widthSegments  = jsonNode["widthSegments"];
        if ("heightSegments" in jsonNode) heightSegments = jsonNode["heightSegments"];
        geometry = new THREE.SphereGeometry(radius, heightSegments, widthSegments);
    }else if(geometryType == "donut" || geometryType == "torus"){
        var tube = 0.5;
        var radialSegments = 80;
        var tubularSegments = 60;
        var arc = Math.PI * 2;
        if("radius" in jsonNode) radius = jsonNode["radius"];
        if("tube" in jsonNode) tube = jsonNode["tube"];
        if("radialSegments" in jsonNode) radialSegments = jsonNode["radialSegments"];
        if("tubularSegments" in jsonNode) tubularSegments = jsonNode["tubularSegments"];
        if("arc" in jsonNode) arc = jsonNode["arc"];
        geometry = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments, arc);
        geometry.visible = false;
    }else if(geometryType == "tube" || geometryType == "cylinder"){
        var radiusTop = 1;
        var radiusBottom = 1;
        var radiusSegments = 10;
        if("radiusTop" in jsonNode) radiusTop = jsonNode["radiusTop"];
        if("radiusBottom" in jsonNode) radiusBottom = jsonNode["radiusBottom"];
        if("height" in jsonNode) height = jsonNode["height"];
        if("radiusSegments" in jsonNode) radiusSegments = jsonNode["radiusSegments"];
        if("heightSegments" in jsonNode) heightSegments = jsonNode["heightSegments"];
        geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radiusSegments, heightSegments);
    }else if(geometryType == "cone"){
        var rSegments = 8;
        var hSegments = 1;
        if("radius" in jsonNode) radius = jsonNode["radius"];
        if("height" in jsonNode) height = jsonNode["height"];
        if("radiusSegments" in jsonNode) rSegments = jsonNode["radiusSegments"];
        if("heightSegments" in jsonNode) hSegments = jsonNode["heightSegments"];
        geometry = new THREE.ConeGeometry(radius, height, rSegments, hSegments);
    }else if(geometryType == "plane"){
        var width = 5;
        var height = 5;
        var wSegments = 1;
        var hSegments = 1;
        if("width" in jsonNode) width = jsonNode["width"];
        if("height" in jsonNode) height = jsonNode["height"];
        if("widthSegments" in jsonNode) wSegments = jsonNode["widthSegments"];
        if("heightSegments" in jsonNode) hSegments = jsonNode["heightSegments"];
        geometry = new THREE.PlaneGeometry(width, height, wSegments, hSegments);2
    }else if(geometryType == "sprite"){
        var sprite = new THREE.Sprite(material);
        return sprite;
    }
    if("MatCap" in jsonNode){
        // modify UVs to accommodate MatCap texture
        var faceVertexUvs = geometry.faceVertexUvs[ 0 ];
        for (var i=0; i<faceVertexUvs.length; i++) {

            var uvs = faceVertexUvs[i];
            var face = geometry.faces[i];

            for (var j=0; j<3; j++) {
                uvs[j].x = face.vertexNormals[j].x * 0.5 + 0.5;
                uvs[j].y = face.vertexNormals[j].y * 0.5 + 0.5;
            }
        }
    }
    // Create the mesh and return it
    var mesh = new THREE.Mesh( geometry, material );
    if("receiveShadow" in jsonNode) mesh.receiveShadow = jsonNode["receiveShadow"];
    if("castShadow" in jsonNode) mesh.castShadow = jsonNode["castShadow"];
    return mesh;
}

//----------------------------------------------------------------------//
// PARSE A MATERIAL
//----------------------------------------------------------------------//

function parseMaterial(jsonNode)
{
    var dColor = "diffuseColor";
    var dMap = "diffuseMap";
    var sColor = "specularColor";
    var material;

    //debug("parseMaterial\n");
    var type = jsonNode["type"];

    // Lambertian material
    if (type == "meshLambertMaterial")
    {
        material = new THREE.MeshLambertMaterial();
        if (dColor in jsonNode) material.color = new THREE.Color(jsonNode[dColor][0], jsonNode[dColor][1], jsonNode[dColor][2]);
        if (dMap in jsonNode) material.map = parseTexture(jsonNode[dMap], jsonNode);

        return material;
    }else if(type == "meshBasicMaterial"){
        material = new THREE.MeshBasicMaterial();
        if("color" in jsonNode) material.color = new THREE.Color(jsonNode["color"][0], jsonNode["color"][1], jsonNode["color"][2]);
        if("map" in jsonNode) material.map = parseTexture(jsonNode["map"], jsonNode);

        return material;
    }else if(type== "meshPhongMaterial"){
        material = new THREE.MeshPhongMaterial();
        if(dColor in jsonNode) material.color = new THREE.Color(jsonNode[dColor][0], jsonNode[dColor][1], jsonNode[dColor][2]);
        if(sColor in jsonNode) material.specular = new THREE.Color(jsonNode[sColor][0], jsonNode[sColor][1], jsonNode[sColor][2]);
        if("specularMap" in jsonNode) material.specularMap = parseTexture(jsonNode["specularMap"]);
        if("shininess" in jsonNode) material.shininess = jsonNode["shininess"];
        if("diffuseMap" in jsonNode) material.map = parseTexture(jsonNode["diffuseMap"], jsonNode);
        if("bumpMap" in jsonNode) material.bumpMap = parseTexture(jsonNode["bumpMap"], jsonNode);
        if("bumpScale" in jsonNode) material.bumpScale = jsonNode["bumpScale"];

        return material;
    }else if(type== "spriteMaterial"){
        material = new THREE.SpriteMaterial();
        if("color" in jsonNode) material.color = new THREE.Color(jsonNode["color"][0], jsonNode["color"][1], jsonNode["color"][2]);
        if("map" in jsonNode) material.map = parseTexture(jsonNode["map"], jsonNode);
        if("rotation" in jsonNode) material.rotation = jsonNode["rotation"];
        if("fog" in jsonNode) material.fog = jsonNode["fog"];

        return material;
    }

    // Failed to make a material, so return a default
    return new THREE.MeshLambertMaterial();
}

//----------------------------------------------------------------------//
// PARSE A TEXTURE MAP - ASYNCHRONOUSLY LOADS THE TEXTURE IMAGE
//----------------------------------------------------------------------//

function parseTexture(textureURL, jsonNode)
{
    textureURL = sceneFolder+textureURL;
    //debug("parseTexture: " + textureURL + "\n");
    var texture = new THREE.Texture();
    texture.anisotropy = currentRenderer.getMaxAnisotropy();
    if ("repeat" in jsonNode) {
        var repeat = jsonNode["repeat"];
        texture.repeat.x = repeat[0];
        texture.repeat.y = repeat[1];
    }
    if ("offset" in jsonNode) {
        var offset = jsonNode["offset"];
        texture.offset.x = offset[0];
        texture.offset.y = offset[1];
    }

    if (texture.anisotropy > 4.0) texture.anisotropy = 4.0;
    var loader = new THREE.ImageLoader(loadingManager);
    loader.load(
        textureURL,
        function(image) { // callback function
            texture.image = image;
            texture.needsUpdate = true;
        }
    );

    return texture;
}

//----------------------------------------------------------------------//
// ADD A SCRIPT TO THE RUNNING PAGE FROM AN EXTERNAL URL
//----------------------------------------------------------------------//

function loadScript(scriptURL)
{
    //debug("loadScript " + scriptURL + "\n");

    // Create an element for the script
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = scriptURL;

    // Add the script element to the head of the page
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(script);
}

//----------------------------------------------------------------------//
// THE MAIN FUNCTION OF THE GAME (ANIMATION) LOOP
//----------------------------------------------------------------------//

function animate()
{
    requestAnimationFrame(animate);	// schedules another call to animate
    animateFrame();					// updates the scene for the frame
    render();						// draws the scene
}

//----------------------------------------------------------------------//
// CONTROLS ANIMATING A SINGLE FRAME
//----------------------------------------------------------------------//

function animateFrame()
{
    // Update the current camera and scene
    if (currentCamera !== undefined) currentCamera.updateProjectionMatrix();
    if (currentScene  !== undefined) currentScene.traverse(runScripts);

    // Update previous mouse state here because animateFrame
    // out of sync with mouse listeners (onMouseMove, onMouseWheel)
    mousePrevX = mouseX;
    mousePrevY = mouseY;
    mousePrevScroll =  mouseScroll;

    var t = getElapsedTime();
    frameDuration = t - frameStartTime;
    frameStartTime = t;
    frameNum++;
}

//----------------------------------------------------------------------//
// CALLBACK TO RUN ALL THE SCRIPTS FOR A GIVEN sceneNode
//----------------------------------------------------------------------//

function runScripts(sceneNode)
{
    var scripts = sceneNode.userData.scripts;
    if (scripts === undefined) return;

    for (var j=0; j<scripts.length; j++) {
        var s = scripts[j];
        var f = window[s]; // look up function by name
        if (f !== undefined) f(sceneNode);
    }
}

//----------------------------------------------------------------------//
// RENDER CURRENT SCENE WITH CURRENT RENDERER USING CURRENT CAMERA
//----------------------------------------------------------------------//

function render()
{
    if (currentScene && currentCamera && currentRenderer) {
        currentRenderer.render(currentScene, currentCamera);
        //Runs an onLoad script if defined. Only runs one time even though render method called multiple times per second.
        if (!sceneLoaded && currentScene  !== undefined && typeof(scriptOnLoad) == "function"){
            scriptOnLoad(currentScene);
            sceneLoaded = true;
        }
    }
    else {
        //debug("Problem rendering\n");
    }
}

//----------------------------------------------------------------------//