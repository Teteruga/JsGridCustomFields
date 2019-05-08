
var jsGridControllerCakePadrao;


function criarJsGridDinamicoPadrao(jsGridTarget, urlTarget, fields, nomeItem = {s: "item", p: "itens"}, pageSize = 5){

    jsGridControllerCakePadrao ={
        loadData: function(filter) {
    
            var def = $.Deferred();
    
            filter['page'] = filter['pageIndex'];
            delete filter['pageIndex'];
    
            filter['sort'] = filter['sortField'];
            delete filter['sortField'];
    
            filter['direction'] = filter['sortOrder'];
            delete filter['sortOrder'];
    
            $.ajax({
                type: 'GET',
                url: urlTarget,
                dataType: "json",
                data: filter,
            }).done(function(response) {
    
                data = {
                    data: response.itens,
                    itemsCount: response.itensTotal,
                };
    
                def.resolve(data);
            });
    
            return def.promise();
        }
    }

    criarJsGrid(jsGridTarget, fields, nomeItem, pageSize, false);
}

function criarJsGridEstaticoPadrao(jsGridTarget, data, fields, jsGridOptions, nomeItem = {s: "item", p: "itens"}, pageSize = 5){

    jsGridOptions.controller = null;
    jsGridOptions.data = data;
    jsGridOptions.pageSize = pageSize;

    criarJsGrid(jsGridTarget, fields, nomeItem, pageSize, jsGridOptions)
}

function criarJsGrid(jsGridTarget, fields, nomeItem, pageSize, jsGridOptions){

    var singular = '';
    var plural = '';

    if(typeof(nomeItem) === "object"){
        singular = nomeItem.s;
        plural = nomeItem.p
    }
    else if(typeof(nomeItem) === "string"){
        singular = plural = nomeItem+"(s)"; 
    }

    if(!jsGridOptions){

        $("#"+jsGridTarget).jsGrid({
    
            width: "100%",
            filtering: true,
            sorting: true,
            paging: true,
            autoload: true,

            pageLoading: true,
            pageSize: pageSize,
            pageIndex: 1,
            pagePrevText: "Anterior",
            pageNextText: "Próximo",
            pageFirstText: "Primeiro",
            pageLastText: "Último",
            pagerFormat: "Paginas: {first} {prev} {pages} {next} {last} &nbsp;&nbsp; {pageIndex} of {pageCount}",

            noDataContent: "Nenhum "+singular+" encontrado!",
            loadIndication: true,
            loadIndicationDelay: 500,
            loadMessage: "Buscando "+plural+"...",
            loadShading: true, 

            controller: jsGridControllerCakePadrao,
            fields: fields
        });
    }
    else{

        jsGridOptions.fields = fields;

        (jsGridOptions.hasOwnProperty("pagePrevText")) ? null : jsGridOptions.pagePrevText = "Anterior";
        (jsGridOptions.hasOwnProperty("pageNextText")) ? null : jsGridOptions.pageNextText = "Próximo";
        (jsGridOptions.hasOwnProperty("pageFirstText")) ? null : jsGridOptions.pageFirstText = "Primeiro";
        (jsGridOptions.hasOwnProperty("pageLastText")) ? null : jsGridOptions.pageLastText = "Último";
        (jsGridOptions.hasOwnProperty("pagerFormat")) ? null : jsGridOptions.pagerFormat = "Paginas: {first} {prev} {pages} {next} {last} &nbsp;&nbsp; {pageIndex} of {pageCount}";

        (jsGridOptions.hasOwnProperty("loadIndication")) ? null : true;
        (jsGridOptions.hasOwnProperty("loadIndicationDelay")) ? null : 500,
        (jsGridOptions.hasOwnProperty("noDataContent")) ? null : jsGridOptions.noDataContent = "Nenhum "+singular+" encontrado!";
        (jsGridOptions.hasOwnProperty("loadMessage")) ? null : jsGridOptions.loadMessage = "Buscando "+plural+"...";
        (jsGridOptions.hasOwnProperty("loadShading")) ? null : true;

        (jsGridOptions.hasOwnProperty("pageIndex")) ? null : 1;

        $("#"+jsGridTarget).jsGrid(jsGridOptions);
    }

}

//
//CUSTOM FIELD selectJson
//
var selectJsonField = function(config) {

    this.items = {};
    this.autoSearch = true;
    this.sortSelect =  true;
    this.sortDirection = 'ASC';
    this.selectEmpty = 'Todos';

    jsGrid.Field.call(this, config);
};

selectJsonField.prototype = new jsGrid.Field({

    css: "select-json",
    align: "center",           

    items: {},      
    sortSelect: '',
    sortDirection: '',
    selectEmpty: '',
    itemEmpty: '-',

    sortJson: function sortJson(json, direction = 'ASC'){

        var jsonIndex = {};

        var jsonEntries = Object.entries(json);

        for (const [key, value] of jsonEntries) {
            jsonIndex[value] = key;
        }

        valuesSorted = Object.values(json).sort();

        if(direction === 'DESC'){
            valuesSorted.reverse();
        }

        var jsonSorted = [];

        for(const value of valuesSorted){
            jsonSorted.push({'id': jsonIndex[value], 'value': value});
        }

        return jsonSorted;
    },

    itemTemplate: function(value) {
        var item = (this.items[value]) ? this.items[value] : this.itemEmpty;           
        return  item;
    },

    filterTemplate: function() {

        this.id = (!this.id) ? this.name : this.id;
        var className = (this.class) ? this.class : '';

        var $select = $("<select name = '"+this.name+"' id = '"+this.id+"' class = 'select-json-search "+className+"'></select>");

        $select.append($("<option>").prop("value", "0").text(this.selectEmpty));

        if(this.sortSelect){

            var options = this.sortJson(this.items, this.sortDirection);

            options.forEach(function(value, key){
                $select.append( $("<option>", { value: value['id']}).text(value['value']) );
            });

        }
        else{

            var options = Object.entries(this.items);

            for (const [key, value] of options) {
                $select.append( $("<option>", { value: key}).text(value) );
            }

        }

        $select.val(0);

        var grid = this._grid;
        if(this.autoSearch) {
            $select.on("change", function() {
                grid.search();
            });
        }

        return $select;
    },
    filterValue: function () {
        var filter = $('[name="'+this.name+'"]').val();

        if(filter !== "0")
            return filter;
        else
            return '';
    },

});

//
//CUSTOM Field sucessLabel
//
var sucessLabelField = function(config) {

    this.autoSearch = true;
    this.selectEmpty = 'Todos';

    jsGrid.Field.call(this, config);
};

sucessLabelField.prototype = new jsGrid.Field({

    css: "label-field",
    align: "center",      
         
    selectEmpty: '',

    itemTemplate: function(value) {            

        var field = (value) ? "<span class='label label-success'><span aria-hidden='true' class='glyphicon glyphicon-ok'> </span>Sim<span>"
        : "<span class='label label-danger'><span aria-hidden='true' class='glyphicon glyphicon-remove'> </span>Não<span>";

        return field;
    },

    filterTemplate: function() {

        this.id = (!this.id) ? this.name : this.id;
        var className = (this.class) ? this.class : '';

        var $select = $("<select name = '"+this.name+"' id = '"+this.id+"' class = 'sucess-label-search "+className+"'></select>");

        $select.append($("<option>").prop("value", 0).text(this.selectEmpty));

        $select.append($("<option>").prop("value", true).text('Sim'));
        $select.append($("<option>").prop("value", false).text('Não'));

        $select.val(0);

        var grid = this._grid;
        if(this.autoSearch) {
            $select.on("change", function() {
                grid.search();
            });
        }

        return $select;
    },
    filterValue: function () {
        var filter = $('[name="'+this.name+'"]').val();

        if(filter !== "0")
            return filter;
        else
            return '';
    },

});

//
//CUSTOM Field inputLike
//
var inputLikeField = function(config) {

    this.inputType = "text";
    this.inputLikeEnd = "%";
    this.inputLikeBegin = "%";
    this.autoSearch = true;
    this.autoSearchLimit = 5;
    this.link = false;
    this.linkAttribute = false;
    this.lightbox = false;
    this.lightboxName = this.name;
    this.onclick = false;

    jsGrid.Field.call(this, config);
};

inputLikeField.prototype = new jsGrid.Field({

    css: "inputLike-field",
    align: "left",      
         
    selectEmpty: '',

    itemTemplate: function(value) {
        
        var attribute = '';

        if(this.link){

            if(this.linkAttribute){

                var searchAttribute = this.name;

                attribute = $.grep(this._grid.data, function(item) {

                    return item[searchAttribute] === value;

                })[0][this.linkAttribute];
            }

            if(attribute !== '')
                var link = this.link+"/"+attribute;
            else
                var link = this.link;

            var onclick = '';
            
            if(this.lightbox){
                onclick = "'lightbox(this, `"+this.lightboxName+"`, $(window).height() / 1.3, $(window).width() / 1.5); return false;' escape = 'false'";
            }
            else if(this.onclick){

                if(attribute !== '')
                    var func = this.onclick.replace("linkAttribute", attribute);
                else
                    var func = this.onclick;
                
                onclick = func;
            }

            return "<a href = '"+link+"' onclick = '"+onclick+"'>"+value+"</a>";
        }
        else
            return value;
        
    },

    filterTemplate: function() {

        this.id = (!this.id) ? this.name : this.id;
        var className = (this.class) ? this.class : '';

        var $input = $("<input type = '"+this.inputType+"' name = '"+this.name+"' id = '"+this.id+"' class = 'input-like-search "+className+"'>");

        var grid = this._grid;
        if(this.autoSearch) {

            var autoSearchLimit = this.autoSearchLimit

            $input.on("keyup", function() {
                if( $(this).val().length >= autoSearchLimit || $(this).val().length === 0)
                    grid.search();
            });
        }

        return $input;
    },
    filterValue: function () {

        var filter = $('[name="'+this.name+'"]').val();

        return this.inputLikeBegin+filter+this.inputLikeEnd;
    },

});

//
//CUSTOM Field glyphiconAction
//
var glyphiconActionField = function(config) {

    jsGrid.Field.call(this, config);
};

glyphiconActionField.prototype = new jsGrid.Field({

    css: "inputLike-field",
    align: "center",
    width: 20,
    sorting: false,
    glyphicon: "ok",
    glyphiconPro: true,
    action: function(){},
    glyClass: "ok",
    containerClass: (this.containerClass) ? this.containerClass : this.name,
    containerId: (this.containerId) ? this.containerId : this.name,

    itemTemplate: function(value, item) {

        var glyClass = (this.glyClass) ? this.glyClass : "";
        var action = this.action;

        glyClass += (this.glyphiconPro) ? " glyphicons glyphicons-"+this.glyphicon : " glyphicon glyphicon-"+this.glyphicon;
        
        return $("<a id = '"+this.containerId+"' class = '"+this.containerClass+"' name = '"+this.name+"' >").append($('<span aria-hidden="true" class= "'+glyClass+'"> </span>'))
        .on("click", function (event) {
                action(item);
        });
    },


});





jsGrid.fields.selectJson = selectJsonField;
jsGrid.fields.sucessLabel = sucessLabelField;
jsGrid.fields.inputLike = inputLikeField;
jsGrid.fields.glyphiconAction = glyphiconActionField;