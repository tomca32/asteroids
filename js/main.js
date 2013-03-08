var wHeight = window.innerHeight;
var wWidth = window.innerWidth;
$(window).resize(function(){
	wHeight = window.innerHeight;
    wWidth = window.innerWidth;
	
	$('#game').css ({
        width: wWidth+'px',
        height: wHeight+'px'
    });
})


$(window).load(function() {
	
	$(window).resize();
    $('#laserSound').volume = 0;
    $('#game').focus();
    
    var FPS = 18;
    var spawnTime = 2000; // miliseconds between asteroid spawns
    var maxAsteroids = 20; //maximum number of asteroids at one time
    var asteroids = [];
    var shots = [];
    var shotsRemove =[];
    var asteroidsRemove = [];
    var asteroidsDestroyed = 0;
    var asteroidCount = 0;
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
    var cursorHeight = $('#cursor').height()/2;
    var cursorWidth = $('#cursor').width()/2;
    
    var thrustHUD = $('#thrust');
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
        
        $('#cursor').css({top: mY - cursorHeight, left: mX - cursorWidth});
    });
    
    function updateAngle(obj) {
        offset = obj.offset();
        center_x = (offset.left) + (obj.width()/2);
        center_y = (offset.top) + (obj.height()/2);
        var mouse_x = mX; var mouse_y = mY;
        var radians = Math.atan2(mouse_x - center_x, mouse_y - center_y);
        degree = Math.floor((radians * (180 / Math.PI) * -1) + 180); 
        obj.css('-moz-transform', 'rotate('+degree+'deg)');
        obj.css('-webkit-transform', 'rotate('+degree+'deg)');
        obj.css('-o-transform', 'rotate('+degree+'deg)');
        obj.css('-ms-transform', 'rotate('+degree+'deg)');
        $('.rotation').html('Angle: '+Math.round(degree));
        rads=(degree-90) *(Math.PI/180);
    }
    function updateThrust() {
        thrustHUD.html("Thrust: "+speed);
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
        updateThrust();
    });
    
    function run(){
        var speedX=0;
        var speedY=0;
        window.setInterval(running, 1000/FPS);
        window.setInterval(asteroidSpawn, spawnTime);
        function running(){
            updateAngle(player);
            if (brakesOn) braking();
            
            else {
                speedX += Math.cos(rads) * speed;
                speedY +=Math.sin(rads) * speed;    
                speedX= limit(speedX,10, 'both');
                speedY=limit(speedY,10, 'both');
            }
            
            $('.x').html('Speed X:'+Math.round(speedX*100)/100);
            $('.y').html('Speed Y:'+Math.round(speedY*100)/100);
            player.css ({left: '+='+speedX+'px', top:'+='+speedY+'px'});
            var len = asteroids.length;
            while (len--){
                var currentAsteroid = $('#'+asteroids[len]);
                if (isCollide(currentAsteroid, player,'player') && playerAlive) {
                    asteroids.splice(len,1);
                    currentAsteroid.remove();
                    currentAsteroid = false;
                    playerDied();
                }
                if(currentAsteroid){
                var lenShots = shots.length;
                while(lenShots--) {
                	var currentShot = $('#'+shots[lenShots]);
                	if (screen(currentShot)=='removed') {
                		currentShot.remove();
                        shots.splice(lenShots,1);
                	} else {
                    if (isCollide(currentAsteroid, currentShot, 'shot')) {
                        console.log('ode asteroid!');
                        explosion(currentAsteroid);
                        currentAsteroid = false;
                        asteroids.splice(len,1);
                        asteroidCount--;
                        asteroidsDestroyed++;
                        currentShot.remove();
                        shots.splice(lenShots,1);
                        break;
                    }
                   }
                }}
                if(!currentAsteroid) continue;
                var len2 = asteroids.length;
                while (len2--) {
                	if(!currentAsteroid) continue;
                	var drugiAsteroid = $('#'+asteroids[len2]);
                	if(drugiAsteroid == [] || drugiAsteroid ==undefined) break;
                    if (!(currentAsteroid.attr('id') === drugiAsteroid.attr('id'))){
                    if (isCollide(currentAsteroid, drugiAsteroid)) {
                        console.log('ode asteroid!');
                        explosion(currentAsteroid);
                        explosion(drugiAsteroid);
                        asteroidCount-=2;
                        if (len>len2){
                        	asteroids.splice(len,1);
                        	asteroids.splice(len2,1);
                        } else {
                        	asteroids.splice(len2,1);
                        	asteroids.splice(len,1);
                        }
                        currentAsteroid = false;
                        len--;
                        len2--;
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
                if (shotsRemove.length >0){
                	console.log("Before removal,count: " +shotsRemove.length);
                	var id = [shotsRemove.shift()];
                	console.log("Removing shot ID:" + id + ", should be the same as: " + shots.shift());
                	$('#'+id).remove();
                }
                
            }
            screen(player);
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
        return removed;
        //if (removed)shots.splice(item.data('ind'),1);  //Removing shot from shots array
    }
    function laser (){
        var topSpeed = 5;
        var speedX= Math.cos(rads)*topSpeed;
        var speedY= Math.sin(rads)*topSpeed;
        var stilovi = 'top:'+center_y+'px;';
        stilovi += 'left:'+center_x+'px;';
        stilovi += '-moz-transform:rotate('+degree+'deg);';
        stilovi += '-webkit-transform:rotate('+degree+'deg);';
        stilovi += '-o-transform:rotate('+degree+'deg);';
        stilovi += '-ms-transform:rotate('+degree+'deg);';
        sounds.laser.play();
        var randomId = "x" + randomString(8);
        var ind = shots.length;
        shots.push(randomId);
        
        $('#game').append('<div id="'+randomId+'" class="laser shot" style="'+stilovi+'" data-speedX="'+speedX+'" data-speedY="'+speedY+'" data-ind="'+ind+'"></div>');
        $('#'+randomId).animate ({left: '+='+speedX*300, top:'+='+speedY*300},3000,'linear', function(){
        	shotsRemove.push(randomId);
            //shots.splice(ind,1);
            //$(this).remove();
        });
    
    }
    function asteroidSpawn() {
        if (!playerAlive)
            return;
        if (asteroidCount >= maxAsteroids)
            return;
        var pozicija = Math.floor(Math.random()*3);
        console.log (pozicija);
        switch (pozicija){
        	case 0:
        		var asteroidX = Math.floor(Math.random()*wWidth + 1);
        		var asteroidY = -10;
        		break;
        	case 1:
        		var asteroidX = wWidth + 11;
        		var asteroidY = Math.floor(Math.random()*wHeight + 1);
        		break;
        	case 2:
        		var asteroidX = Math.floor(Math.random()*wWidth + 1);
        		var asteroidY = wHeight+11;
        		break;
        	case 3:
        		var asteroidX = -10;
        		var asteroidY = Math.floor(Math.random()*wHeight + 1);
        		break;
        }
        spawnAsteroid (asteroidX, asteroidY);
        //alert(asteroidY);
        function spawnAsteroid (astX,astY){
            var astID = randomString (10);
            var astAngle = (Math.random()*(2*Math.PI));
            var astSpeedX = (Math.random()*(17)-8);
            var astSpeedY = (Math.random()*(17)-8);
            var astRot = Math.floor((Math.random()*(33)-16));
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
        sounds.playerExplosion.play();
        $('#game').append('<div class="playerexplosion" id="'+expName+'" style="top:'+expY+'px; left:'+expX+'px;"></div>');
        $('#'+expName).sprite({fps: 18, no_of_frames: 29, on_last_frame: function(obj) {obj.spStop();}}).active();
        $('#'+expName).animate({opacity:0},2500,function(){
            $('#'+expName).remove();
        });
    } else{
        sounds.explosion.play();
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
	