(function() {
    var engine = null;

    function onEngineLoad() {
        console.log("Engine load started");
        gse.ready(function(gseEngine) {
            console.log("GSE ready");
            engine = gseEngine;
            var loadingElement = document.getElementById('gse-loading');
            
            var playerDelegate = {
                onLoadingBegin: function() {
                    engine.showOverlay();
                    loadingElement.style.visibility = 'visible';
                },
                onLoadingEnd: function() {
                    loadingElement.style.visibility = 'hidden';
                    engine.hideOverlay();
                },
                onGameReady: function(width, height) {
                    console.log("Game ready");
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