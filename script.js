var ParticleEngine = (function() {
    // ParticleEngine class code
}());

// Utility functions

var particles;
(function(){
    particles = new ParticleEngine('projector');
    createjs.Ticker.addEventListener("tick", updateCanvas);
    window.addEventListener('resize', resizeCanvas, false);

    function updateCanvas(){
        particles.render();
    }

    function resizeCanvas(){
        particles.resize();
    }
}());
