JSLOG = {

	container : {
	
	},
	
	output : {
	
	},
	
	init: function() {
		this.loadStyleSheet();
		this.createConsole();
		this.wrapConsole();

		window.addEventListener("resize", function() { JSLOG.sizeConsole() });

		window.onerror = function(error, url, lineNumber) {
			JSLOG.error(error + " \n @URL:   " + url +"\n@Line:  " + lineNumber);
		};		
	},
	
	loadStyleSheet : function() {

		var scriptEl;
		var script_src;
		var style_src;
		var styleSheet;
		
		for (var i=0; i<document.scripts.length; i++) {
			if (document.scripts[i].src.match(/jslog\.js/)) {
				scriptEl 	= document.scripts[i];
				style_src 	= scriptEl.src.replace(/jslog\.js/, "jslog.css");
				styleSheet 	= document.createElement('link');
				styleSheet.rel 	= 'stylesheet';
				styleSheet.href = style_src;
				document.head.appendChild(styleSheet);				
				break;
			}
		}
	},
	
	wrapConsole : function() {
		console.log 	= JSLOG.log;		
		console.debug	= JSLOG.debug;
		console.warn 	= JSLOG.warn;
		console.error 	= JSLOG.error;
		console.info	= JSLOG.info;
	},
	
	createConsole : function(containerEl) {
		var outputContainer, o, width, height;
		if (!containerEl) {
			this.container = document.body;
		} else  {
			this.container = containerEl;
		} 

		var o = document.createElement('div');
		o.id	= "jslog";
		this.output 	= o;
		this.container.appendChild(this.output);		
		this.sizeConsole();
	},

	sizeConsole : function() {
		var containerStyle, width, height;
		containerStyle = window.getComputedStyle(this.container);
		width 	= Math.round(parseInt(containerStyle.width) * 0.99) + "px";
		height 	= Math.round(parseInt(containerStyle.height) * 0.4) + "px";
		
		this.output.style.width 		= width;
		this.output.style.height		= height;
	},	
	
	outputBlock: function(message) {
		var s = message;

		if (message instanceof HTMLDivElement)
			s = " " + message.outerHTML;
	
		var block;
		block = document.createElement('div');
		block.innerText = message;
		block.classList.add('jslog_outBlock');		

		this.output.appendChild(block);
		
		this.output.scrollTop = this.output.scrollHeight;

		return block;
	},	
	
	log: function(message) {
		var out = JSLOG.outputBlock(message);
	},
	
	error: function(message) {
		var out = JSLOG.outputBlock(message);
		out.classList.add('jslog_errorBlock');
	},
	
	debug: function(params) {
		
	},
	
	resize: function() {
		this.sizeConsole();
	}
};

JSLOG.init();