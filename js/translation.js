(function ( $ ) {
    const dict = {
        "*headerline": {
            cs: "Simulátor a Vizualizátor Optiky",
            en: "Simulator and Visualizer of Optics",
        },
        "enviroment": {
            cs: "Prostředí",
            en: "Enviroment"
        },
        "recalculate": {
            cs: "Přepočítat",
            en: "Recalculate"
        },
        "tools": {
            cs: "Nástroje",
            en: "Tools"
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
