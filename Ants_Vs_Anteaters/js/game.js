(function(global) {
    var engine = null;

    global.onEngineLoad = function() {
        gse.ready(function(gseEngine) {
            engine = gseEngine;
            var loadingElement = document.getElementById('gse-loading');
            var playerDelegate = {
                onLoadingBegin: function() {
                    loadingElement.style.visibility = 'visible';
                },
                onLoadingEnd: function() {
                    loadingElement.style.visibility = 'hidden';
                }
            };

            engine.appendDelegate(playerDelegate);
            engine.setRenderFrame('gse-player');
            // Remove custom options and let GameSalad use its defaults
        });
    };
})(window);