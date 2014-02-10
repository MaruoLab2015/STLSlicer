document.write('<script type="text/javascript" src="js/jquery-1.10.2.js"></script>');
$(function(){
    $('div#createIS p').css('color', 'red');
    $("#ui-tab").tabs();
    $('#progressbar').progressbar({});
    $('#btnRotationX').button();
    $('#btnRotationY').button();
    $('#btnRotationZ').button();
    $('#sliderMoveX, #sliderMoveY, #sliderMoveZ').slider({
	
        min: -1000,
        max: 1000,
        value: 0      
    });
    $('#sliderScaleX, #sliderScaleY, #sliderScaleZ').slider({

        min: -1000,
        max: 1000,
        value: 1
    });

    $('#menu').droppy();
});

$('#open').click(function(){

    console.log()
});
