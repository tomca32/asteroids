$(document).ready(function() {
    $('#laserSound').volume = 0;
    $('#game').focus();
    var wHeight = $(window).height();
    var wWidth = $(window).width();
    
    $('iframe').css ({
        width: wWidth+'px',
        height: wHeight+'px'
    });
     $('#game').css ({
        width: wWidth+'px',
        height: wHeight+'px'
    });
    var asteroids = [];
    var shots = [];
    var asteroidsDestroyed = 0;
    var asteroidCount = 0;
    var maxAsteroids = 20;
    var topSpeed = 10;
    var player;
    var playerAlive = false;
    var speed = 0;
    var acc = 0.03;
    var offset;
    var degree=0;
    var rads =0;
    var mX;
    var mY;
    var center_x;
    var center_y;
    var brakesOn = true;
	// your code here
    function limit(val, lim,direction){
        switch (direction){
            case "up":
                if (val>limit) return limit;
                break;
            case "down":
                if (val<limit) return limit;
                break;
            case "both":
                if (val>Math.abs(lim)) return Math.abs(lim);
                if (val<-(Math.abs(lim))) return -Math.abs(lim);
                break;
        }
        return val;
    }
    function spawnPlayer(){
        $('.asteroid').each(function(){$(this).remove();});
        asteroids=[];
        shots =[];
        asteroidsDestroyed = 0;
        asteroidCount = 0;
        maxAsteroids = 20;
        playerAlive = false;
        speed = 0;
        degree=0;
        rads =0;
        brakesOn = true;
        gHeight = $('.game').height();
        gWidth = $('.game').width();
        speedX=0;
        speedY=0;
        $('#game').append('<div class="player" id="player"></div>');
        $('#player').css({
            top: (gHeight/2)+"px",
            left: (gWidth/2)+"px"
        });
        player = $('#player');
        playerAlive = true;
        offset = player.offset();
    }
    
    $(document).mousemove(function(evt){
        mX = evt.pageX;
        mY = evt.pageY;
        updateAngle(player);
    });
    
    function updateAngle(obj) {
        offset = obj.offset();
        center_x = (offset.left) + (obj.width()/2);
        center_y = (offset.top) + (obj.height()/2);
        var mouse_x = mX; var mouse_y = mY;
        var radians = Math.atan2(mouse_x - center_x, mouse_y - center_y);
        degree = (radians * (180 / Math.PI) * -1) + 180; 
        obj.css('-moz-transform', 'rotate('+degree+'deg)');
        obj.css('-webkit-transform', 'rotate('+degree+'deg)');
        obj.css('-o-transform', 'rotate('+degree+'deg)');
        obj.css('-ms-transform', 'rotate('+degree+'deg)');
        $('.rotation').html('Angle: '+Math.round(degree));
        rads=(degree-90) *(Math.PI/180);
    }
    function updateSpeed() {
        $('.speed').html("Thrust: "+speed);
    }
    $(document).keydown(function(e){
        var code=e.which;
        if (code == 38 || code == 87){
            speed += acc;
            if (speed > 1)
                speed = 1;
        } else if (code ==40 || code == 83){
            speed -= acc;
            if (speed <-0.3)
                speed =-0.3;
        } else if(code ==81){
            
            if (brakesOn){
                speed = 1;
                brakesOn=false;
            } else {
                speed = 0;
                brakesOn = true;
            }
            
        } else if (code == 32){
            e.preventDefault();
            if (speed ===0)
                speed = 1;
            else
                speed = 0;
        }
        updateSpeed();
    });
    
    function run(){
        var speedX=0;
        var speedY=0;
        updateSpeed();
        updateAngle(player);
        window.setInterval(running, 50);
        window.setInterval(asteroidSpawn, 2000);
        function running(){
            
            if (brakesOn) braking();
            
            else {
                speedX += Math.cos(rads) * speed;
                speedY +=Math.sin(rads) * speed;    
                speedX= limit(speedX,10, 'both');
                speedY=limit(speedY,10, 'both');
            }
            
            $('.x').html('Speed X:'+Math.round(speedX*100)/100);
            $('.y').html('Speed Y:'+Math.round(speedY*100)/100);
            player.animate ({left: '+='+speedX, top:'+='+speedY},1);
            for (var i = 0; i < asteroids.length; i++) {
                var currentAsteroid = $('#'+asteroids[i]);
                if (isCollide(currentAsteroid, player,'player') && playerAlive) {
                    asteroids.splice(i--,1);
                    currentAsteroid.remove();
                    currentAsteroid = false;
                    playerDied();
                }
                if(currentAsteroid){ 
                for (var j = 0; j < shots.length; j++) {
                	var currentShot = $('#'+shots[j]);
                    if (isCollide(currentAsteroid, currentShot, 'shot')) {
                        console.log('ode asteroid!');
                        explosion(currentAsteroid);
                        currentAsteroid = false;
                        asteroids.splice(i,1);
                        asteroidCount--;
                        asteroidsDestroyed++;
                        currentShot.remove();
                        shots.splice(j--,1);
                        break;
                    }
                }}
                if(!currentAsteroid) continue;
                for (var j = 0; j < asteroids.length; j++) {
                	if(!currentAsteroid) continue;
                	var drugiAsteroid = $('#'+asteroids[j]);
                    if (!(currentAsteroid.attr('id') === drugiAsteroid.attr('id'))){
                    if (isCollide(currentAsteroid, drugiAsteroid)) {
                        console.log('ode asteroid!');
                        explosion(currentAsteroid);
                        explosion(drugiAsteroid);
                        asteroidCount-=2;
                        asteroidsDestroyed++;
                        asteroids.splice[i--,1];
                        asteroids.splice[j--,1];
                        i--;
                        j--;
                        currentAsteroid = false;
                        break;
                    }
                    }
                }
                
               //console.log ($(this).attr('data-speedX'));
               if(!currentAsteroid) continue;
               astLeft=currentAsteroid.offset().left;
               astTop=currentAsteroid.offset().top;
                currentAsteroid.css({left: '+='+currentAsteroid.data('speedx'), top:'+='+currentAsteroid.data('speedy')});
                var currentAsteroidRot = parseInt(currentAsteroid.data('currentrot'),10);
                currentAsteroidRot +=currentAsteroid.data('rot');
                //console.log (currentAsteroid.data('currentrot'));
                currentAsteroid.data('currentrot', currentAsteroidRot);
                currentAsteroid.css('-moz-transform', 'rotate('+currentAsteroidRot+'deg)');
                currentAsteroid.css('-webkit-transform', 'rotate('+currentAsteroidRot+'deg)');
                currentAsteroid.css('-o-transform', 'rotate('+currentAsteroidRot+'deg)');
                currentAsteroid.css('-ms-transform', 'rotate('+currentAsteroidRot+'deg)');
                screen(currentAsteroid);
            }
            screen(player);
            $('.laser').each(function(){
                screen($(this));
            });
            function braking() {
                brakingPower = 0.4;
                if (speed===0){
                    if (speedX > -0.5 && speedX < 0.5) speedX=0;
                    if (speedY > -0.5 && speedY < 0.5) speedY=0;
                    if (speedX > 0){
                        speedX -=brakingPower;
                        speedX = limit(speedX,0,'down');
                    } else if (speedX<0){
                        speedX+=brakingPower;
                        speedX = limit(speedX,0,'up');
                    }
                    if (speedY > 0){
                        speedY -=brakingPower;
                        speedY = limit(speedY,0,'down');
                    } else if (speedY<0){
                        speedY+=brakingPower;
                        speedY = limit(speedY,0,'up');
                    }
                } else {
                    brakesOn=false;
                }
            }
        }
    }
    function screen(item){
    	var removed = false;
        off = item.offset();
        if (off.left > gWidth+20) {
            if (item.hasClass('shot'))removed = true;
            else {
                item.stop();
                item.css({left: "-10px"});
            }
        }
        if (off.left < -20) {
            if (item.hasClass('shot'))removed = true;
            else {
                item.stop();
                item.css({left: gWidth+10+"px"});
            }
        }
        if (off.top > gHeight+20) {
            if (item.hasClass('shot'))removed = true;
            else {
                item.stop();
                item.css({top: "-10px"});
            }
        }
        if (off.top < -20) {
            if (item.hasClass('shot'))removed = true;
            else {
                item.stop();
                item.css({top: gHeight+10+"px"});
            }
        }
        if (removed)shots.splice(item.data('ind'),1);  //Removing shot from shots array
    }
    function laser (){
        updateAngle (player);
        var topSpeed = 5;
        var speedX= Math.cos(rads)*topSpeed;
        var speedY= Math.sin(rads)*topSpeed;
        var stilovi = 'top:'+center_y+'px;';
        stilovi += 'left:'+center_x+'px;';
        stilovi += '-moz-transform:rotate('+degree+'deg);';
        stilovi += '-webkit-transform:rotate('+degree+'deg);';
        stilovi += '-o-transform:rotate('+degree+'deg);';
        stilovi += '-ms-transform:rotate('+degree+'deg);';
        play_multi_sound('laserSound');
        var randomId = "x" + randomString(8);
        shots.push(randomId);
        var ind = shots.length
        $('#game').append('<div id="'+randomId+'" class="laser shot" style="'+stilovi+'" data-speedX="'+speedX+'" data-speedY="'+speedY+'" data-ind="'+ind+'"></div>');
        $('#'+randomId).animate ({left: '+='+speedX*300, top:'+='+speedY*300},3000,'linear', function(){
            this.remove();
            shots.splice(ind,1);
        });
    
    }
    function asteroidSpawn() {
        if (!playerAlive)
            return;
        if (asteroidCount >= maxAsteroids)
            return;
       
        var randomPositions= [Math.floor(Math.random()*wWidth + 1),Math.floor(Math.random()*wHeight + 1)];
        var combinations= [0, -20, +20];
        var tempPozicija = Math.floor(Math.random()*3);
        var asteroidX = randomPositions[0]+ combinations[tempPozicija];
        combinations = combinations.splice(tempPozicija);
        var asteroidY = randomPositions[1]+ combinations[Math.floor(Math.random()*2)];
        spawnAsteroid (asteroidX, asteroidY);
        //alert(asteroidY);
        function spawnAsteroid (astX,astY){
            var astID = randomString (10);
            var astAngle = (Math.random()*(2*Math.PI));
            var astSpeedX = (Math.random()*(17)-8);
            var astSpeedY = (Math.random()*(17)-8);
            var astRot = (Math.random()*(33)-16);
            $('#game').append('<div class="asteroid a'+Math.floor(Math.random()*3+1)+'" id="'+astID+'" data-currentrot="0" data-rot="'+astRot+'" data-speedX="'+astSpeedX+'" data-speedY="'+astSpeedY+'" style="left:'+astX+'px; top:'+astY+'px;"></div>');
            asteroidCount++;
            asteroids.push(astID);
        }
    }   
    $(document).click(function(){
        if (playerAlive)
            laser();
    });
    spawnPlayer();
    run();
    
    
    
    
    
    function randomString(length) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

    if (! length) {
        length = Math.floor(Math.random() * chars.length);
    }

    var str = '';
    for (var i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}
function isCollide(a, b,c) {
    return !(
        ((a.offset().top + a.height()) < (b.offset().top)) ||
        (a.offset().top > (b.offset().top + b.height())) ||
        ((a.offset().left + a.width()) < b.offset().left) ||
        (a.offset().left > (b.offset().left + b.width()))
    );
}

function explosion(exploded){
    console.log('EKSPLOZIJA!');
    var expX = exploded.offset().left;
    var expY = exploded.offset().top;
    var expName = randomString(5);
    if (exploded == player){
        play_multi_sound('playerexplosion');
        $('#game').append('<div class="playerexplosion" id="'+expName+'" style="top:'+expY+'px; left:'+expX+'px;"></div>');
        $('#'+expName).sprite({fps: 18, no_of_frames: 29, on_last_frame: function(obj) {obj.spStop();}}).active();
        $('#'+expName).animate({opacity:0},2500,function(){
            $('#'+expName).remove();
        });
    } else{
        play_multi_sound('explosionSound');
        $('#game').append('<div class="explosion" id="'+expName+'" style="top:'+expY+'px; left:'+expX+'px;"></div>');
        $('#'+expName).sprite({fps: 20, no_of_frames: 14}).active();
        $('#'+expName).animate({opacity:0},800,function(){
        $('#'+expName).remove();
        console.log(expName+"fadea!");
    });
    }
	exploded.remove();  
}

function playerDied() {
    console.log("You died!");
    explosion(player);
    playerAlive = false;
    speed = 0;
    speedX = 0;
    speedY = 0;
    $('#player').remove();
    spawnPlayer();
    
}

});

var channel_max = 10;    									// number of channels
	audiochannels = new Array();
	for (a=0;a<channel_max;a++) {									// prepare the channels
		audiochannels[a] = new Array();
		audiochannels[a]['channel'] = new Audio();						// create a new audio object
		audiochannels[a]['finished'] = -1;							// expected end time for this channel
	}
	function play_multi_sound(s) {
		for (a=0;a<audiochannels.length;a++) {
			thistime = new Date();
			if (audiochannels[a]['finished'] < thistime.getTime()) {			// is this channel finished?
				audiochannels[a]['finished'] = thistime.getTime() + document.getElementById(s).duration*1000;
				audiochannels[a]['channel'].src = document.getElementById(s).src;
				audiochannels[a]['channel'].load();
                audiochannels[a]['channel'].volume=0.2;
				audiochannels[a]['channel'].play();
				break;
			}
		}
	}
	