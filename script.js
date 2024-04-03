/**
 * @author Alex Andrix <alex@alexandrix.com>
 * @since 2018-12-02
 */

var App = {};
App.setup = function() {
    // JavaScript logic from your provided code
};

App.evolve = function() {
    // JavaScript logic from your provided code
};

App.birth = function() {
    // JavaScript logic from your provided code
};

App.kill = function(particleName) {
    // JavaScript logic from your provided code
};

// More functions from your provided code

document.addEventListener('DOMContentLoaded', function() {
    App.setup();
    App.draw();

    var frame = function() {
        App.evolve();
        requestAnimationFrame(frame);
    };
    frame();
});
