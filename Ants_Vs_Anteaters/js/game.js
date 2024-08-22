(function() {
    function onEngineLoad() {
        if (typeof gse === 'undefined') {
            console.error('GSE not loaded');
            return;
        }
        
        gse.ready(function(engine) {
            console.log('GSE ready');
            
            var playerDelegate = {
                onGameReady: function(width, height) {
                    console.log('Game ready');
                    engine.play();
                }
            };

            engine.appendDelegate(playerDelegate);
            engine.setRenderFrame('gse-player');
            engine.setOptions({
                'viewport-reference': 'window',
                'viewport-fit': 'letterbox'
            });
            engine.loadOptionsFromURL();
        });
    }

    // Call onEngineLoad when the script is loaded
    onEngineLoad();
})();