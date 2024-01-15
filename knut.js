window.addEventListener('load',main,false);
function main() { 
	
	var N = document.getElementById('Num').value;
	var a = document.getElementById('distance').value;
	var fps = document.getElementById('FPS').value;
	var radio = document.getElementById('radio').value;
	var amplitude = document.getElementById('ampl').value;
	var frequency = document.getElementById('freq').value;
	var times_draw,dt,cm;
	
	particles = []; // Класс частиц
	var l_next, l_prev, dvx, dvy;
	var for_pause = 1;
	var flag = 0;
	
	var time = 0;
	var time_waves = 0;
	
	var ctx = cnv.getContext('2d');
	var h = cnv.height;
	var w = cnv.width;
	
	dot_for_paused2 = dot_for_paused = 0;


	function stop_the_render()
	{
		switch (flag)
		{
			case 0:
			{
				flag = 1;
				for_pause = 0;
				break;
			}
			case 1:
			{
				flag = 0;
				for_pause = 1;
				break;
			}
		}
	}	
	Pause.onclick = function ()
	{ 
		stop_the_render();
	}

	New.onclick = function()
	{
		stop_animate(interv);
		Update();
	}
	
	// radio.onclick = function()
	// {
	// 	radio.checked = false;
	// }

	function Update()
	{ 
		let check;
		N = parseInt(document.getElementById('Num').value);
		cm = parseFloat(document.getElementById('CM').value);
		a = parseFloat(document.getElementById('distance').value);
		dt0 = parseFloat(document.getElementById('timestep').value);
		fps = parseInt(document.getElementById('FPS').value);
		times_draw = parseInt(document.getElementById('times').value);
		amplitude = document.getElementById('ampl').value;
		frequency = document.getElementById('freq').value;

		re_render(N,a);
		a = Math.sqrt(Math.pow(particles[2].y - particles[1].y,2) + Math.pow(particles[2].x - particles[1].x,2))/2;
		time = 0;
		interv = setInterval(control,1000/fps);
	}
	
	function re_render(NUM, dist)
	{
		var len = 0.65*(NUM-1)*dist;
		global_len = len;
		var distt = len/(NUM-1);
		for (var i = 0; i< NUM; i++)
		{ 
			tmp = [];

			if(w/4 + distt*i < w)
			{
				tmp.x = w/4 + distt*i; 
			}
			else
			{
				tmp.x = w/4 + distt*i;
				cnv.width += 100;
				w+= 100;
				
			}
			tmp.y = 200;
			tmp.vx = 0;
			tmp.vy = 0;
			tmp.dvx = 0;
			tmp.dvy = 0;
			particles[i] = tmp;
		}
		return true;
		
	}
		
	
	function physics()
	{ 
		dt = dt0*for_pause;
		for (var i = 1; i<N-1; i++)
		{ 
			/*if(time_ct < 2000*dt)
			{*/
				particles[N-1].y = 200 - parseInt(amplitude)*Math.cos(parseInt(frequency)*time_waves);
			// }
			l_next = Math.sqrt(Math.pow(particles[i+1].x - particles[i].x,2) + Math.pow(particles[i+1].y - particles[i].y,2));
			l_prev = Math.sqrt(Math.pow(particles[i].x - particles[i-1].x,2) + Math.pow(particles[i].y - particles[i-1].y,2));
			if (l_next < a)
			{
				FR = (l_next - a);//0
			} else
			{  
				FR = (l_next - a);
			}
			if (l_prev < a) 
			{
				FL = (l_prev - a);//0
			} else
			{ 
				FL = (l_prev - a);
			}
			let cos_phi = ((particles[i].x - particles[i - 1].x)*(particles[i+1].x - particles[i].x) + (particles[i].y - particles[i-1].y)*(particles[i+1].y - particles[i].y))/(l_prev*l_next);
			let scalar_multiplication = ((particles[i].x - particles[i - 1].x)*(particles[i+1].x - particles[i].x) + (particles[i].y - particles[i-1].y)*(particles[i+1].y - particles[i].y));
			// console.log(cos_phi);
			let cs = 10;
			let F_izg_x = 0;
			let F_izg_y = 0;
			if(Math.abs(Math.abs(cos_phi) - 1)> 0.001 && document.getElementById('radio2').checked)
			{
				let koef = cs * (Math.acos(cos_phi) - Math.PI) * Math.pow(l_next*l_prev,-2);
				console.log(koef);
				F_izg_x = koef * (((particles[i+1].x - particles[i - 1].x - 2 * particles[i].x)*l_next*l_prev) - scalar_multiplication*((l_next*(particles[i].x - particles[i - 1].x))/(l_prev*l_prev)+(l_prev*(particles[i].x - particles[i + 1].x))/(l_next*l_next)));
				F_izg_y = koef * (((particles[i+1].y - particles[i - 1].y - 2 * particles[i].y)*l_next*l_prev) - scalar_multiplication*((l_next*(particles[i].y - particles[i - 1].y))/(l_prev*l_prev)+(l_prev*(particles[i].y - particles[i + 1].y))/(l_next*l_next)));
				console.log(F_izg_x + " " + F_izg_y + " " + cos_phi + " " + koef);
			}
			if(document.getElementById('radio').checked && i == 1)
			{
				dvx = -F_izg_x;
				dvy = - F_izg_y ;

				particles[0].dvx = dvx;
				particles[0].dvy = dvy;
				particles[0].vx += dvx*dt;
				particles[0].vy += dvy*dt;
			}
			dvx = cm*(FR*(particles[i+1].x - particles[i].x)/l_next - FL*(particles[i].x - particles[i-1].x)/l_prev) - particles[i].vx - F_izg_x;
			dvy = cm*(FR*(particles[i+1].y - particles[i].y)/l_next - FL*(particles[i].y - particles[i-1].y)/l_prev) - particles[i].vy - F_izg_y - 10;
			particles[i].dvx = dvx;
			particles[i].dvy = dvy;
			particles[i].vx += dvx*dt ;
			particles[i].vy += dvy*dt;

		}

		l_next = Math.pow(Math.pow(particles[1].x - particles[0].x,2) + Math.pow(particles[1].y - particles[0].y,2),1/2);

		if (l_next < a)
		{
			FR = (l_next - a);
		} else
		{  
			FR = (l_next - a);
		}

		dvx = cm*(FR*(particles[1].x - particles[0].x)/l_next) - particles[0].vx;
		dvy = (cm*(FR*(particles[1].y - particles[0].y)/l_next)) - particles[0].vy - 10;

		if(document.getElementById('radio').checked)
		{
			particles[0].dvx += dvx;
			particles[0].dvy += dvy;
			particles[0].vx += dvx*dt;
			particles[0].vy += dvy*dt;
		}

		for (var i = 0; i<N-1; i++)
		{ 
			particles[i].x += particles[i].vx*dt;
			particles[i].y += particles[i].vy*dt;
		}

		time_waves+=dt;		
	}
	
	function render()
	{ 
		ctx.clearRect(0,0,w,h);
		for (var i = 0; i<N; i++) { 
			ctx.beginPath();
			ctx.arc(particles[i].x,particles[i].y + 50, 5, 0, 2*Math.PI);
			ctx.fill();
		}

	}
	
	function control()
	{ 
		physics();
		if (time % times_draw == 0) { 
			render();
		}
		time++;
	}
	
	function stop_animate(intrv)
	{ 
		clearInterval(intrv);
	}
	FPS.oninput = function ()
	{ 
		fps = parseInt(document.getElementById('FPS').value);
		stop_animate(interv);
		interv = setInterval(control,1000/fps);
	}
	
	
	Update();

}