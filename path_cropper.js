/*
    This is a sample demo for how can we use path to crop image.
    Credits : Someone may be an @ngel. :D
    You are free to use this or modify this 
*/
(function () {
    // canvas related variables
    var canvas=document.getElementById("canvas"); 
    var ctx=canvas.getContext("2d");
    var cw,ch;
    var $canvas=$("#canvas");
    var canvasOffset=$canvas.offset();
    var offsetX=canvasOffset.left;
    var offsetY=canvasOffset.top;
    var isDrwawing = false;
    // set some canvas styles
    ctx.strokeStyle='Red';
    // an array to hold user's click-points that define the clipping area
    var points=[];
    var lastIndex = {mx:0, my:0}
    var img = new Image(); 
    
    // load the image 
    loadImage =  function(e){
      img.onload=start;
      img.src=URL.createObjectURL(event.target.files[0]);;
    }

    // Resize image with aspect ratio.
    function getResized(srcWidth, srcHeight, maxWidth, maxHeight) {
       var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
      return { width: srcWidth*ratio, height: srcHeight*ratio };
   }

    function start(){
      // resize canvas to fit the img
      cw=canvas.width=(img.width > 500) ? 450 : img.width;
      ch=canvas.height=(img.height > 500) ? 450 : img.height;

      // draw the image at 25% opacity
      drawImage(1); 

      // listen for mousedown and button clicks
      
      $('#canvas').mousedown(function(e){
        isDrwawing = true;
        drawOutline(e);
        })
      $('#canvas').mouseup(function(e){
        isDrwawing = false;
      
      });
      // $('#canvas').mousemove(function(e){handleMouseDown(e);});
      $('#reset').click(function(){ points.length=0; drawImage(1); });
    }

    // Trigger if the mouse down function is activated.
    function drawOutline(e){
        handleMouseDown(e);
        $('#canvas').mousemove(function(e){handleMouseDown(e);});
    }
    // Handle the mouse up event
    function handleMouseUp(e){
      // tell the browser that we're handling this event
      e.preventDefault();
      e.stopPropagation();
    }
    function handleMouseDown(e){

      // tell the browser that we're handling this event
      e.preventDefault();
      e.stopPropagation();

      // calculate mouseX & mouseY
      mx=parseInt(e.clientX-offsetX);
      my=parseInt(e.clientY-offsetY);
      if(isDrwawing){
        // push the pointer point to the points[] array
        points.push({x:mx,y:my});
        lastIndex.mx = mx;
        lastIndex.my = my;

      // show the user an outline of their current clipping path
        outlineIt();
      }
    }

    clipImage = function (){
      var el= document.getElementById('notification')
      var html = document.createElement('div');
      html.setAttribute('class', 'alert alert-warning');
      if(!points.length){
        html.innerHTML = `<strong>Warning!</strong> No image or no path to clip`;
        el.appendChild(html);
        var timer = setTimeout(function(){
          el.removeChild(html);
          clearTimeout(timer)
        }, 2000) 
        return false;
     }
      if(points.length>1){
        var dx = lastIndex.mx-points[0].x;
        var dy = lastIndex.my-points[0].y;
        if(dx*dx+dy*dy<10*10){
          clipIt();
        }else{
          html.innerHTML = `<strong>Warning!</strong> Points needs to be closed`;
          el.appendChild(html);
          var timer = setTimeout(function(){
            el.removeChild(html);
            clearTimeout(timer)
          }, 2000) 
        }
      }
    }
    // redraw the image at the specified opacity
    function drawImage(alpha){
      ctx.clearRect(0,0,cw,ch);
      ctx.globalAlpha=alpha;
      // get resized aspect ratio
      var ratio = getResized(img.width, img.height, 500, 500);
      ctx.drawImage(img,0,0, img.width, img.height, 0, 0, ratio.width, ratio.height);
      ctx.globalAlpha=1.00;
    }

    // show the current potential clipping path
    function outlineIt(){
      drawImage(1);
      ctx.beginPath();
      ctx.moveTo(points[0].x,points[0].y);
      for(var i=0;i<points.length;i++){
        ctx.lineTo(points[i].x,points[i].y);
      }
      // ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.strokeStyle = "#FF0000";
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.arc(points[0].x,points[0].y,5,0,Math.PI*2);
      ctx.closePath();
      ctx.stroke();
    }

    // clip the selected path to a new canvas
    function clipIt(){

      // calculate the size of the user's clipping area
      var minX=10000;
      var minY=10000;
      var maxX=-10000;
      var maxY=-10000;
      for(var i=1;i<points.length;i++){
        var p=points[i];
        if(p.x<minX){minX=p.x;}
        if(p.y<minY){minY=p.y;}
        if(p.x>maxX){maxX=p.x;}
        if(p.y>maxY){maxY=p.y;}
      }
      var width=maxX-minX;
      var height=maxY-minY;

      // clip the image into the user's clipping area
      ctx.save();
      ctx.clearRect(0,0,cw,ch);
      ctx.beginPath();
      ctx.moveTo(points[0].x,points[0].y);
      for(var i=1;i<points.length;i++){
        var p=points[i];
        ctx.lineTo(points[i].x,points[i].y);
      }
      ctx.closePath();
      ctx.clip();
      // get resized aspect ratio and clip
      var ratio = getResized(img.width, img.height, 500, 500);
      ctx.drawImage(img,0,0, img.width, img.height, 0, 0, ratio.width, ratio.height);
      ctx.restore();

      // create a new canvas 
      var c=document.createElement('canvas');
      var cx=c.getContext('2d');

      // resize the new canvas to the size of the clipping area
      c.width=width;
      c.height=height;

      // draw the clipped image from the main canvas to the new canvas
      cx.drawImage(canvas, minX,minY,width,height, 0,0,width,height);

      // create a new Image() from the new canvas
      var clippedImage=new Image();
      clippedImage.onload=function(){
        // append the new image to the page
        var el = document.getElementById('clipped-image');
        el.appendChild(clippedImage);
      }
      clippedImage.src=c.toDataURL();


      // clear the previous points 
      points.length=0;

      // redraw the image on the main canvas for further clipping
      drawImage(1);
    }
})();
