(function ( $ ) {
    const dict = {
        "*headerline": {
            cs: "Simulátor a Vizualizátor Optiky",
            en: "Simulator and Visualizer of Optics",
        },
        "toolbar": {
            cs: "Panel nástrojů",
            en: "Toolbar"
        },
        "enviroment": {
            cs: "Prostředí",
            en: "Enviroment"
        },
        "recalculate": {
            cs: "Přepočítat",
            en: "Recalculate"
        },
        "autoUpdate": {
            cs: "Automaticky přepočítávat",
            en: "Auto-recalculate"
        },
        "tools": {
            cs: "Nástroje",
            en: "Tools"
        },
        "advanced": {
            cs: "Pokorčilé",
            en: "Advanced"
        },
        "debug": {
            cs: "Ladění",
            en: "Debug"
        },
        "rayLength": {
            cs: "Délka paprsku",
            en: "Ray length"
        },
        "fps": {
            cs: "Snímky/s",
            en: "FPS"
        },
        "iteration": {
            cs: "Iterace",
            en: "Iterations"
        },
        "precision": {
            cs: "Přesnost",
            en: "Precision"
        },
        "vacuum": {
            cs: "Vakuum",
            en: "Vacuum"
        },
        "air": {
            cs: "Vzduch",
            en: "Air"
        },
        "helium": {
            cs: "Hélium",
            en: "Helium"
        },
        "hydrogen": {
            cs: "Vodík",
            en: "Hydrogen"
        },
        "ice": {
            cs: "Led",
            en: "Ice"
        },
        "water": {
            cs: "Voda",
            en: "Water"
        },
        "ethanol": {
            cs: "Ethanol",
            en: "Ethanol"
        },
        "glass": {
            cs: "Sklo",
            en: "Glass"
        },
        "flintglass": {
            cs: "Flintové sklo",
            en: "Flint glass"
        },
        "diamond": {
            cs: "Diamant",
            en: "Diamond"
        },
        "mirror": {
            cs: "Zrcadlo",
            en: "Mirror"
        },
        "ray": {
            cs: "Paprsek",
            en: "Ray"
        }
    };
    
    // $(selector).translate(lang)
    $.fn.translate = function(lang) {
        this.each((i, el) => {
            el = $(el);
            const trn = el.attr("data-trn");
            
            if(trn in dict){
                if(lang in dict[trn]){
                    el.text(dict[trn][lang]);
                }else{
                    el.text(dict[trn]["en"]);
                }
            }
        });
        
        return this;
    };
    
    // $.dictionary returns dictionary
    $.dictionary = dict;
 
}( jQuery ));
