var s = function (p) {
    var w=p.windowWidth, h=p.windowHeight;
    //palette
    p.colorMode(p.HSB, 100);
    var light = p.color(39/3.6, 20, 100);
    var active = p.color(20, 20, 100);
    var cursor = p.color(9/3.6, 95, 100);
    var space = p.color(236/3.6, 81, 10);

    var loneliness;
    var ts=tweets;
    var hd=heard;
    var sw=5;
    var n = 150;
    var tbw = 200, tbh = 100;
    var ev=0;
    var initialized=false;

    var lonelyverseD = new Array(maxRunning2);
    var pLonelyverseD = new Array(maxRunning2);
    var lonelyverseDTo = new Array(maxRunning2);
    var record =0;

    var adventPro = p.loadFont('assets/AdventPro-SemiBold.ttf');

    p.setup = function () {
        p.createCanvas(w,h);
        p.noFill();
        p.background (space);
        p.frameRate(24);
        //p.cursor(p.HAND);
        p.noCursor();

        //initialize an array containing objects lonely
        loneliness = new Array (maxRunning);
        for (let i=0; i < maxRunning; i++) {
            loneliness[i] = new Lonely(ts[i]);
        }
    }

    p.draw = function () {
        space.setAlpha(80);
        p.background(space);
        //console.log(p.frameRate());

        //draw background tweets
        initializeLonelyverse (hd);
        updateLonelyverse (hd);
        lonelyverse(hd);


        updateLoneliness(ts);

        //Make Mass Emerge
        if (ev == 0) {
            for (let i=0; i < maxRunning; i++) {
                loneliness[i].emerge();
            }
            for (let i=0; i < maxRunning; i++) {
                if (loneliness[i].o == maxRunning-3) {
                    if (loneliness[i].d - mapDiameter(maxRunning-3) < 100) {
                        ev = 1;
                    }
                }
            }
        }
        //Draw dMass
        if (ev == 1) {
            for (let i=0; i < maxRunning; i++) {
                loneliness[i].drawLonely();
            }
        }

        //cursor
        drawCursor();
    }






    //lonelyverse
    function initializeLonelyverse (hd) {
        if (hd[maxRunning2-1] && initialized ==false) {
            for (let i=0; i<maxRunning2; i++) {
                if (hd[i]== 0) {
                    record = i;
                }

                lonelyverseD[i]=p.dist(0,0,w,h);
                if (hd[i]>maxRunning2-maxCount2) {
                    let angle = p.map(hd[i], maxRunning2-maxCount2, maxRunning2, 0*p.PI, 0.48* p.PI);
                    lonelyverseDTo[i]= p.map(p.tan(angle), 0, p.tan(0.48*p.PI), 1.5*tbw, p.dist(0,0, w, h));
                } else {
                    lonelyverseDTo[i] = p.dist(0,0,w,h);
                }
            }
            initialized=true;
            //console.log("initialized")
        }
    }
    function updateLonelyverse (hd) {
        if (heard[record] != 0 && initialized==true) {
            hd = heard;
            for (let i=0; i<maxRunning2; i++) {
                if (hd[i]==0) {
                    record = i;
                }
                if (hd[i]>maxRunning2-maxCount2) {
                    let angle = p.map(hd[i], maxRunning2-maxCount2, maxRunning2, 0*p.PI, 0.48* p.PI);
                    lonelyverseDTo[i]= p.map(p.tan(angle), 0, p.tan(0.48*p.PI), 1.5*tbw, p.dist(0,0, w, h));
                } else {
                    lonelyverseDTo[i]= p.dist(0,0,w,h);
                    lonelyverseD[i]= p.dist(0,0,w,h);
                }
            }
            //console.log("updated");
        }
    }

    function lonelyverse (hd) {
        if (initialized==true) {
            let from = p.color(179/3.6, 81, 100);
            let to = p.color(236/3.6, 81, 100);
            let color = from;
            for (let i=0; i<maxRunning2; i++) {
                if (hd[i]>maxRunning2-maxCount2) {
                    color = mapColor(hd[i],maxCount2,from,to);
                    color.setAlpha(40);
                    p.stroke(color);
                    p.strokeWeight(1);
                    p.noFill();
                    p.ellipse(w/2, h/2, lonelyverseD[i], lonelyverseD[i]);
                    lonelyverseD[i] += 0.1*(lonelyverseDTo[i]-lonelyverseD[i]);
                    pLonelyverseD[i] = lonelyverseD[i];
                }
            }
        }
    }


    function drawCursor (){
        p.noStroke();
        let diameter = 200, color = space;
        for (let i=0; i<30; i++) {
            color.setAlpha(1/30*10*i);
            p.fill(color);
            p.ellipse(p.mouseX, p.mouseY, diameter, diameter);
            color = mapColor(i, 30, space, light);
            diameter -=4;
        }
        for (let i=0; i<10; i++) {
            color.setAlpha(10+i*(30-10)/10);
            p.fill(color);
            p.ellipse(p.mouseX, p.mouseY, diameter, diameter);
            color = mapColor(i, 10, light, cursor);
            diameter-=3;
        }
    }

    //update order and destination diameter every time when tweets is updated
    function updateLoneliness(ts) {
        if ( loneliness[0].o != tweets[0].order) {
            //console.log("Loneliness Updated")
            ts = tweets;
            for (let i=0; i < maxRunning; i++) {
                if (ts[i].order == maxRunning-1) {
                    loneliness[i] = new Lonely(ts[i]);
                } else {
                    loneliness[i].o = ts[i].order;
                    loneliness[i].dTo = mapDiameter(ts[i].order);
                    loneliness[i].color= mapColorCircles(ts[i].order);
                }
            }
        }
    }

    //Funcations for Drawing Interactive Circles
    function getVertex(d) {
        let poly = [];
        for (let i = 0; i<n; i++) {
            let c = {
              x: w/2 + d/2* p.sin(p.map(i, 0, n-1, 0, 2*p.PI)),
              y: h/2 + d/2* p.cos(p.map(i, 0, n-1, 0, 2*p.PI))
            }
            poly.push(c)
        }
        return poly;
    }

    function mapDiameter (order) {
        if (order <maxRunning && order > maxRunning-maxCount) {
            let angle = p.map(order, maxRunning-maxCount+1, maxRunning-1, 0*p.PI, 0.44* p.PI);
            return p.map(p.tan(angle), 0, p.tan(0.46*p.PI), tbw*1.5 , p.dist(0,0, w, h) )
        } else {
            return 0;
        }
    }
    function mapColorCircles (order) {
        let h = p.map (order, maxRunning-maxCount-1, maxRunning-1, 55, 85);
        let s = p.map (order, maxRunning-maxCount-1, maxRunning-1, 80, 100);
        let b = p.map (order, maxRunning-maxCount-1, maxRunning-1, 150, 20);
        p.colorMode(p.HSB, 100);
        let c = p.color(h, s, b);
        return c;
    }
    function mapColor (counter, max, from, to) {
        let h = p.map (counter, 0, max, p.hue(from), p.hue(to));
        let s = p.map (counter, 0, max, p.saturation(from), p.saturation(to));
        let b = p.map (counter, 0, max, p.brightness(from), p.brightness(to));
        p.colorMode(p.HSB, 100);
        let c = p.color(h, s, b);
        return c;
    }
    function easeColor (easing, from, to) {
        let h = p.hue(from)+ easing* (p.hue(to) - p.hue(from));
        let s = p.saturation(from)+ easing* (p.saturation(to) - p.saturation(from));
        let b = p.brightness(from)+ easing* (p.brightness(to) - p.brightness(from));
        p.colorMode(p.HSB, 100);
        let c = p.color(h, s, b);
        return c;
    }
    function mapByEase (value, d, fd) {
        let i = p.map (value, 0, fd*d/2, -0.5*p.PI, 0.5*p.PI);
        return p.map (p.sin(i), 1, -1, 0, value);
    }

    function Lonely (tt) {
        this.t = tt;
        this.st = emojiStrip(tt.tweetInfo.sliced);
        this.o = tt.order;
        this.x = w/2;
        this.y = h/2;
        this.d = p.dist(0,0,w,h);
        this.dTo = mapDiameter(this.o);

        this.color= mapColorCircles(this.o);
        this.sigma = 0;

        this.emerge = function() {
            if (this.dTo != 0) {
                let speed = p.map(this.o,maxRunning-maxCount+1, maxRunning-1, 0.1, 0.03);
                this.d = this.d + speed*(this.dTo - this.d);

                let poly = getVertex(this.d);
                p.stroke(this.color);
                p.noFill();
                p.strokeWeight(sw);

                p.beginShape();
                for (let i = 0; i < n; i++) {
                    p.vertex(poly[i].x, poly[i].y);
                }
                p.endShape();
            }
        }

		this.drawLonely = function () {
            if (this.dTo != 0) {
                //update diameter by breathing
                let dCenter = p.dist(this.x, this.y, p.mouseX, p.mouseY);
                let speed = 0.01;
                if (p.abs(dCenter) >=1.5*tbw) {
                    speed=p.map(p.abs(dCenter), 1.5*tbw, 1/2* p.sqrt(p.sq(w)+p.sq(h)), 0.01, 0.3 );
                }
                let angle = p.map(this.o,maxRunning-maxCount-1, maxRunning-1, -0.5*p.PI, 1.3*p.PI);
                let intensity = p.map(p.sin(angle), -1, 1, 0, 5);

                this.d += p.sin(this.sigma)*intensity;
                this.d = this.d + 0.05*(this.dTo - this.d);
                this.sigma+=speed;

                //freedom, representing how distant the mouse can be from the egde for the animation to happen
            	var fd = p.map(this.o, maxRunning-maxCount, maxRunning, 0.2, 0.45);
                //draw shape
                p.beginShape();
                let poly = getVertex(this.d);
                let cType = this.color;

                p.stroke(this.color);
                p.noFill();
                p.strokeWeight(sw);

                for (let i = 0; i < n; i++) {
                    //calculate parameters for vertice
        			let bias = p.dist(p.mouseX, p.mouseY, w/2, h/2) - this.d/2;
        			let a, biasM;
        			a = p.atan2(p.mouseX-poly[i].x, p.mouseY-poly[i].y);
        			if (bias > 0 && bias < fd*this.d/2) {
        					biasM = mapByEase (bias, this.d, fd);
        			} else if (bias<0 && bias > -fd*this.d/2) {
        					biasM = -mapByEase (bias, this.d, fd);
        			} else {
        					a = 0;
        					biasM = 0;
        			}

                    let distVM = (p.dist( p.mouseX, p.mouseY, poly[i].x + p.sin(a)* biasM, poly[i].y + p.cos(a)* biasM));

                    //show text if mouse is close to a vertex
                    if (distVM < 2) {
                        //type
                        p.rectMode (p.CENTER);
                        p.noStroke();
                        p.fill(space);
                        p.rect(w/2, h/2, tbw, tbh);

                        p.textSize(18);
                        p.textAlign(p.CENTER);
                        p.textLeading(26);
                        p.textFont(adventPro);
                        p.fill (255, 90);
                        let noOrphans = this.st.replace(/ ([^ ]*)$/,'\xa0$1');

                        p.text(noOrphans, w/2, h/2, tbw, tbh);

                        p.stroke(this.color);
                    }

                    //increse the brightness of activated circles
                    if (distVM < 6 ) {
                        this.color = easeColor(0.05, this.color, active);
                        p.stroke(this.color);
                    } else if ( distVM >= 6  && distVM <= 50 ){
                        this.color = easeColor(0.01, this.color, mapColorCircles(this.o));
                        p.stroke(this.color);
                    }
                    p.noFill();
                    p.vertex(poly[i].x + p.sin(a)* biasM, poly[i].y + p.cos(a)* biasM);
                }
                p.endShape();
            }
        }
        // this.showDetails = function (s) {
        //     var full = this.t.tweetInfo.fullText;
        // }
    }

}

var sketch = function () { return new p5(s)}
