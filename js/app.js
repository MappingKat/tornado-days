/*
 * Top Tornado Outbreaks of All time
 *  
 * Brendan Heberton
 * www.brendansweather.com
 * @brendansweather
 * 
 */


$(document).ready(function(){
  var height = $(window).height() + 20;
  
  //setup UI
  $('.maps').css( { 'width': $(window).width()+'px', 'height': height+'px'});
  $('.about').css('height', height+'px');
  $('.map-blurb').css('height', height+'px');
  $('.legend-container').css('height', height - 220 + 'px');
  $('#home').css('height', height+'px');
  $('#intro-map').css( { 'width': $(window).width()+'px', 'height': $(window).height() + 100+'px' } );
  
  app = new torApp();
}); 

var torApp = function() {
  this.intro();
  this.createMap();
  this.addLand();
  this.scrollControls();
  this.updateLegend();
}
 
torApp.prototype.scrollControls = function() {
  var self = this,
    h = $(window).height() + 20, //1000
    w = document.width,
    min = 40,
    max = 95,
    m = 0;
  
  //window resize 
  $(window).on('resize', function() {
    var h = $(window).height();
    var w = $(window).width();
    
    $('.about').css('height', h + 50 +'px');
    $('#home').css('height', h+'px');
    $('#intro-map').css( { 'width': w+'px', 'height': h + 100+'px' } );
    self.intro_svg.attr('width', w ).attr('height', h + 100);
  });
  
  $window = $(window);
    $('section[data-type="background"]').each(function(){
      var $bg = $(this);
      var $wbg = $('#intro-map-window .inner.wbg');
      
      $(window).scroll(function(e) {
        
        //self.update();
        
        if ( $('body').hasClass('no-scroll') ) return;
        
        var pos = $(window).scrollTop(); //position of the scrollbar
        if ( !this.prev_pos ) this.prev_pos = pos;
        
        //fadeout introduction
        if ( pos > 10 ) {
          $('#intro-map').fadeOut();
          $('#intro-map-window-one').fadeOut();
          $('#intro-map-window-two').show();
          $('#scroll-tip-container').hide();
        } else {
          $('#intro-map-window-two').hide();
          $('#intro-map').fadeIn();
          $('#intro-map-window-one').show();
          $('#scroll-tip-container').show();
        }
        
        //Scroll to top - bounce the intro tors!
        if ( pos < 3 && this.prev_pos > 3 ) {
          self.intro_svg.selectAll(".intro-tors")
            .transition()
            .duration(1000)
            .attr("transform", function(d) {
              var random = Math.floor((Math.random()*20)+1);
              var lat = (parseFloat(d.latitude) + random);
              return "translate(" + self.intro_projection([d.longitude,lat]) + ")";
            })
            .transition()
            .duration(1000)
            .delay(function( d, i ) { return Math.floor((Math.random()*700)+50); })
            .ease('bounce') //elastic // bounce
            .attr("transform", function(d) {
              return "translate(" + self.intro_projection([d.longitude,d.latitude]) + ")";
            });
            
            $('.about').removeClass('viewed');
            self.updateLegend();
        }
        
        this.prev_pos = pos;
        
        clearTimeout($.data(this, "scrollTimer"));
        $.data(this, "scrollTimer", setTimeout(function() {
            // do something
           $('.maps').css( {'pointer-events': 'auto' });
        }, 1200));
        
        var yPos = -($window.scrollTop() / $bg.data('speed'));
        var coords = '50% '+ yPos + 'px';
        
        
        if ( $($bg).hasClass('map_two') ) {
          console.log( 'yes ')
        } else {
          $bg.css({ backgroundPosition: coords });
        }
        
      });
    });
    
    
    //Detect when sections appear 
    $('.about').appear();
    $('.about').on('appear', function() {
      var id = $(this).children('.maps').attr('id');
      
      //set current visible section
      self.active = id;
      
      //Add "viewed" class to know it has been initiated ONCE
      if ( !($(this).hasClass('viewed')) ) {
        var h = $(window).height() - 220;
        //Legend animation
        self["legend_"+id].selectAll(".legend-dots")
          .transition()
          .delay(function( d, i ) { return Math.floor((Math.random()*3000)+300); })
          .duration( 4000 )
          .ease("bounce")
            .attr("transform", function(d) { return "translate(" + d.x + "," + (d.y + ( h - d.radius )) + ")";})
            .attr('r', function(d) { return d.radius })
      }
      
      //TODO HACK! "end" not working...?
      if ( id === "map_one") {
        setTimeout(function() {
          self.playVideo( id )  
        },3500);
      } else {
        self.playVideo( id );
      }
      
      self.LoadPoints( id );
      $(this).addClass('viewed');
    });
    
    $('.about').on('disappear', function() {
      
      var id = $(this).attr('id');
      $('#'+id+'_counties').hide();
      self.RemovePoints( id );
      self.stopVideo( id );
    }); 
}

torApp.prototype.update = function() {
  var height = window.innerHeight || $(window).height();
  
  this.active = this.active || "map_one";
  $('.maps').css( {'pointer-events': 'none' });
  
  var rect = $('#'+this.active).parent()[ 0 ].getBoundingClientRect();
  var position = $('#'+this.active).css("position");
  
  if ( rect.top > 0 && rect.bottom > height ) {
    $('#'+this.active).parent().css( "overflow-y", 'hidden' );
    $('#'+this.active).css( {'position': 'relative' });
  } else if ( rect.top < 0 && rect.bottom > height ) {
    $('#'+this.active).parent().css( "overflow-y", 'auto' );
    $('#'+this.active).css( {'position': 'fixed', 'left': '0px', 'top' : '0px'});
  } else if ( rect.top < 0 && rect.bottom < height ) {
    //$('#'+this.active).parent().css( "overflow-y", 'hidden' );
    //$('#'+this.active).css( {'position': 'relative' });
  }
  
  //else
  //    $('#'+this.active).parent().css('visibility', 'visible');

  //} else {
  //    if (position != 'absolute')
         // $('#'+this.active).parent().css('position', 'absolute');
  //}
/*
  if ((rect.top > height) || (rect.bottom < 0))
      this.el.style.visibility = 'hidden';
  else
      this.el.style.visibility = 'visible';

  if (rect.top < 0 && rect.bottom > height) {
      if (position != 'fixed')
          this.$el.css('position', 'fixed');
  } else {
      if (position != 'absolute')
          this.$el.css('position', 'absolute');
  }
  if (rect.bottom <= height) {
      if (this.attachment != 'bottom') {
          this.$el.css('top', 'auto');
          this.$el.css('bottom', '0');
      }
      this.attachment = 'bottom';
  } else {
      if (this.attachment != 'top') {
          this.$el.css('top', '0');
          this.$el.css('bottom', 'auto');
      }
      this.attachment = 'top';
    }
    */
}

torApp.prototype.createMap = function() {
  var self = this,
    h = 1000,
    w = document.width,
    min = 40,
    max = 95,
    m = 0;
  
  this.maps = {
    "map_one" : { 
      "id": "map_one", 
      "projection" : d3.geo.albers().scale(1700).center([17, 33]).clipAngle(90).translate([w / 2, h / 2]), 
      "dataset" : 'data/may-24-26-2011.csv' 
    },
    "map_two" : {
      "id": "map_two", 
      "projection" : d3.geo.mercator().scale(2500).center([-95, 35]).translate([w / 2, h / 2]).precision(.1),
      "dataset" : 'data/feb-5-6-2008.csv'
    },
    "map_three" : {
      "id": "map_three", 
      "projection" : d3.geo.albers().scale(1700).center([20, 33]).clipAngle(90).translate([w / 2, h / 2]),
      "dataset" : 'data/may-22-2011.csv'
    },
    "map_four" : {
      "id": "map_four", 
      "projection" : d3.geo.albers().scale(1700).center([20, 33]).clipAngle(90).translate([w / 2, h / 2]), 
      "dataset" : 'data/may-3-1999.csv' 
    },
    "map_five" : {  
      "id": "map_five", 
      "projection" : d3.geo.albers().scale(1700).center([20, 33]).clipAngle(90).translate([w / 2, h / 2]), 
      "dataset" : 'data/nov-21-23-1992.csv'
    } ,
    "map_six" : { 
      "id": "map_six", 
      "projection" : d3.geo.albers().scale(1700).center([20, 33]).clipAngle(90).translate([w / 2, h / 2]), 
      "dataset" : 'data/apr-11-12-1965.csv'
    },
    "map_seven" : { 
      "id": "map_seven", 
      "projection" : d3.geo.albers().scale(1700).center([20, 33]).clipAngle(90).translate([w / 2, h / 2]), 
      "dataset" : "data/apr-26-27-28-2011.csv"   
    },
    "map_eight" : { 
      "id": "map_eight", 
      "projection" : d3.geo.albers().scale(1700).center([20, 33]).clipAngle(90).translate([w / 2, h / 2]),
      "dataset" : "data/apr-3-4-1974.csv"
    }
      
  }
  
  this.projection = d3.geo.albers().scale(1700).center([20, 33]).clipAngle(90).translate([w / 2, h / 2]);

  this.path = d3.geo.path()
    .projection( this.projection );

  var maps = [ "map_one", "map_two", "map_three", "map_four", "map_five", "map_six", "map_seven", "map_eight", ]
  $.each( this.maps, function( i, map) {
    
    var id = map.id;
    self[ id ] = d3.select("#"+ id).append("svg");
    self[ "legend_"+ id ] = d3.select( '.legend-container.'+ id ).append( "svg" );
  });
  
  this.scales = {
     0: 3,
     1: 5,
     2: 7,
     3: 11,
     4: 14,
     5: 19
  }
  
}

//world / state / water boundaries --- add them to map!
torApp.prototype.addLand = function () {
  var self = this;
  
  $.each( this.maps, function(i, map) {
    
    var path = d3.geo.path().projection( map[ "projection"] );
    var id = map.id;
    
    d3.json("data/world.json", function(error, world) {
      //console.log('world', world)
      /*self[ map[ "id" ] ].insert("path")
        .datum(topojson.feature(world, world.objects.world))
        .attr('class', 'world')
        .attr("d", self.path);
      */
      if ( id !== 'map_two' ) {
        self[ id ].insert("path")
          .datum(topojson.feature(world, world.objects.states))
          .attr('class', 'states')
          .attr('id', map+'_states')
          .attr("d", path);
      } else {
        self[ id ].append("g")
          .attr("class", "states")
        .selectAll("path")
          .data(topojson.feature(world, world.objects.states).features)
        .enter().append("path")
          .attr('id', function(d) { return d.id })
          .attr("class", function(d) {
            if ( d.id === 5 || d.id === 1 || d.id === 17 || d.id === 18 || d.id === 21 || d.id === 22 || d.id === 29 || d.id === 28 || d.id === 47 || d.id === 48 ) {
              return "states";
            } else {
              return "states-hidden";
            }
          })
          .attr("d", path);  
      }
      
      self[ id ].insert("path")
        .datum(topojson.feature(world, world.objects.water))
        .attr('class', 'lakes')
        .attr("d", path);
    });
    
  });
  
}

//Sets initial legend DOT positions
torApp.prototype.updateLegend = function() {
  var self = this;
  
  d3.selectAll('.legend-dots').remove();
  
  var legends = ["map_one", "map_two", "map_three", "map_four", "map_five", "map_six", "map_seven", "map_eight"];
  $.each( legends, function(i, leg) {
    var dots = self["legend_"+leg].append('g');
    var legend = [ 
      { radius: 3, x: 5, y: 4 }, 
      { radius: 5, x: 50, y: 6 }, 
      { radius: 7, x: 100, y: 8 }, 
      { radius: 10, x: 160, y: 11 }, 
      { radius: 14, x: 230, y: 15 },
      { radius: 19, x: 300, y: 20 } 
    ];
    
    dots.selectAll("circle")
      .data( legend )
    .enter().insert("circle")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")";})
      .attr("fill", "#FEFEFE")
      .attr('stroke', "rgb(255, 20, 0)")
      .attr('stroke-width', 0.6)
      .attr('opacity', 0.8)
      .attr('class', 'legend-dots')
      .attr('r', function(d) { return d.radius });
  });
  
}

//Points on a map!
torApp.prototype.LoadPoints = function( map ) {
  var self = this;
  
  if ( $('#'+map+'_graphic').length ) return;
  
  
  d3.csv( this.maps[ map ].dataset )
    .row(function(d) { return { date: d.Date, scale: d.Fujita, county: d.County1,
      state: d.State1, latitude: d.TouchdownLat, longitude: d.TouchdownLon, damages: d.Damage, injuries: d.Injuries, fatalities: d.Fatalities}; })
    .get(function(error, rows) {
      var injured = 0;
      var cost = 0;
      var count = 0;
      
      var strongTors = self[ map ].append('g');

      $('#tornado-count .count').html(rows.length);
      var projection = self.maps[ map ].projection;
      
      strongTors.selectAll("circle")
        .data(rows)
      .enter().insert("circle")
        .attr("transform", function(d) { return "translate(" + projection([d.longitude,d.latitude]) + ")";})
        .attr("fill", "#FFFFFF")
        .attr('stroke', "rgb(255, 20, 0)")
        .attr('stroke-width', 0.6)
        .attr('class', 'storm-reports-large')
        .attr('opacity', 0.5)
        .attr('id', map+'_graphic')
        .attr('d', function(d) {
          injured = injured + parseInt( d.injuries );
          
          //TODO calculate cost
          var c = parseInt( d.damages.split('-')[ 0 ].replace( /\$/, '') );
          cost = ( isNaN( c ) ) ? cost : cost + c;
          
          //number of tors
          count++;
          
        })
        .attr('r', function(d) {
          var size = ( d.scale == undefined ) ? 0 : self.scales[d.scale];
          return size;
        })
        .on('mouseover', function(d) { 
          d3.select(this)
            .attr('d', self.hover( d, map ))
            .transition()
            .duration(400)
              .attr('opacity', 0.1)
              .attr('r', function() { 
                var size = ( d.scale == undefined ) ? 1 : self.scales[d.scale] + 14;
                return size; 
              })
            .transition()
            .duration(400)
              .attr('opacity', 0.5)
              .attr('r', function() { 
                var size = ( d.scale == undefined ) ? 1 : self.scales[d.scale];
                return size; 
              })
        });
          
      //Stats
      $( '.'+map+' .injured-by-tors .number' ).html( injured );
      $( '.'+map+' .number-of-tors .number' ).html( count );
      
      var reports = self[ map ].append('g');

      $('#tornado-count .count').html(rows.length);
      var projection = self.maps[ map ].projection;
  
      reports.selectAll("circle")
        .data(rows)
      .enter().insert("circle")
        .attr("transform", function(d) { return "translate(" + projection([d.longitude,d.latitude]) + ")";})
        .attr("fill", "#ff3322") //#ff3322
        .attr('class', 'storm-reports')
        .attr('id', map+'_graphic')
        .attr('r', 0.5);
      
     });
}

torApp.prototype.RemovePoints = function( map ) {
  $('.storm-reports').remove(); 
}

torApp.prototype.hover = function( d, map ) {
  app.exit();
  
  var x2 = this.maps[ map ].projection([d.longitude,d.latitude])[0] + Math.floor(Math.random()*80) + 60;
  var y2 = this.maps[ map ].projection([d.longitude,d.latitude])[1] + Math.floor(Math.random()*160) + 20;
  
  var line = app[ map ].append("svg:line")
    .attr('class', 'tip-line')
    .style("stroke", '#FFF')
    .attr("x1", this.maps[ map ].projection([d.longitude,d.latitude])[0])
    .attr("y1", this.maps[ map ].projection([d.longitude,d.latitude])[1])
    .attr("x2", this.maps[ map ].projection([d.longitude,d.latitude])[0])
    .attr("y2", this.maps[ map ].projection([d.longitude,d.latitude])[1])
    .transition()
      .duration(900)
      .attr("x2", x2)
      .attr("y2", y2);
    
  var info = '<div id="info-window"></div>';
  $('#'+map).append( info );
  
  var damages = ( d.damages ) ? d.damages : 'n/a'
  var content = '\
    <span>Date: '+ d.date + '</span><br />\
    <span>'+ d.county + ', '+d.state+'</span><br />\
    <span>Damages: '+ damages + '</span><br />'
     
  $('#info-window').html( content ).css({'left' : (x2) + 'px', 'top' : (y2) + 'px'}).delay(500).fadeIn(1000);
  
  
  var m = this.maps[ map ];
  var path = d3.geo.path().projection( m[ "projection"] );
  app[ m.id ].selectAll("path").attr("d", path);
  
}

  
torApp.prototype.exit = function() {
  d3.selectAll('.hover')
    .transition()
      .style("fill-opacity", 0)
      .duration(2000)
      .remove();
  d3.selectAll('.tip-line')
    .transition()
      .style("stroke-opacity", 0)
      .duration(900)
      .remove();
  $('#info-window').fadeOut(600);
  $('#info-window').remove();
}

torApp.prototype.playVideo = function( id ) {
  var self = this;
  var val = id.replace(/map_/g, '');

  $('.content-container.'+id).fadeIn('slow');
  
  var canvas = document.getElementById('video-'+val+'-canvas');
  if ( !canvas ) return; 
  var ctx    = canvas.getContext('2d');
  var video  = document.getElementById('video-'+val);
  
  video.addEventListener('play', function () {
    var $this = this; //cache
    var ratio = video.videoWidth / video.videoHeight;
    var w = video.videoWidth - 50;
    var h = parseInt(w / ratio, 10);
    canvas.width = w;
    canvas.height = h;
    ctx.width = w;
    ctx.height = h;
    
    (function loop() {
        if (!$this.paused && !$this.ended) {
            ctx.drawImage($this, 10, 10);
            setTimeout(loop, 1000 / 60); // drawing at 30fps
        }
    })();
    }, 0);
    video.play();  
}

torApp.prototype.stopVideo = function( id ) {
  if (!id) return;
  var val = id.replace(/item_/g, '');
  var video  = document.getElementById('video-'+val);
  if (!video) return;
  video.pause();
}
