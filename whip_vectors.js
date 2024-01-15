
window.addEventListener('load',main,false);
class vec
{
    constructor(x,y)
    {
        this.x = x;
        this.y = y;
    }

    scal_mult(second_vec)
    {
        return (this.x*second_vec.x + this.y*second_vec.y);  
    }

    //this vec + second_vec
    sum_vec(second_vec)
    {
        let tmp = new vec(0,0);

        tmp.x = this.x + second_vec.x;
        tmp.y = this.y + second_vec.y;

        return tmp;
    }

    minus_vec(second_vec)
    {
        let tmp = new vec(0,0);
        second_vec = second_vec.multiply_on_scalar(-1);
        tmp = this.sum_vec(second_vec);
        return tmp;
    }

    // получить еденичный вектор сонаправленный с данным (нужно тк сила напрвлена по вектору соединяющему 2 центра частиц)
    get_unit()
    {
        let tmp = new vec(0,0);
        let modulus = this.get_len();

        tmp.x = this.x / modulus;
        tmp.y = this.y / modulus;

        return tmp;
    }

    multiply_on_scalar(scalar)
    {
        let tmp = new vec(0,0);

        tmp.x = this.x * scalar;
        tmp.y = this.y * scalar;

        return tmp;
    }

    get_len()
    {
        return (Math.sqrt(this.scal_mult(this)));
    }
}

// у каждой частицы будет свойства: rvec - радиус вектор и velvec - вектор скорости
let particles = [];

var cnv = document.getElementById('cnv');
var ctx = cnv.getContext('2d');
var h = cnv.height;
var w = cnv.width;
var time = 0;
//задаем НУ N - кол-во частиц   a - начальное расстояние между частицами
function initial_cond(N,a)
{
    let len = N*a + w/2;
    cnv.width = len;
    for(var i = 0; i < N;i++)
    {
        let tmp = [];
        let rvec = new vec(i*a + w/2,h/2);
        let velvec = new vec(0,0);
        let izg = new vec(0,0);

        tmp.rvec = rvec;
        tmp.velvec = velvec;
        tmp.izg = izg;

        particles[i] = tmp;
    }

    // particles[N/2].rvec.y = h/2 - 50;
}

//Рисуем кнут
function draw(N)
{
    ctx.clearRect(0,0,cnv.width,cnv.height);
	for (var i = 0; i < N; i++)
    { 
        // let rr = particles[i+1].rvec.minus_vec(particles[i].rvec); // вектор между i и i+1 частицами
        // let rl = particles[i].rvec.minus_vec(particles[i-1].rvec); // вектор между i и i-1 частицами
        // ctx.beginPath();

        // ctx.moveTo(particles[i].rvec.x, particles[i].rvec.y); // Передвигает перо в точку (30, 50)
        // ctx.lineTo(particles[i+1].rvec.x, particles[i+1].rvec.y); // Рисует линию до точки (150, 100)

        // ctx.moveTo(particles[i].rvec.x, particles[i].rvec.y); // Передвигает перо в точку (30, 50)
        // ctx.lineTo(particles[i-1].rvec.x, particles[i-1].rvec.y); // Рисует линию до точки (150, 100)
        // ctx.stroke();
	    ctx.beginPath();
		ctx.arc(particles[i].rvec.x,particles[i].rvec.y, 5, 0, 2*Math.PI);
		ctx.fill();
	}
}
//Обновление параметров
refresh.onclick = function refresh()
{
    N = parseInt(document.getElementById('Num').value);
	cm = parseFloat(document.getElementById('CM').value);
	a = parseFloat(document.getElementById('distance').value);
	dt0 = parseFloat(document.getElementById('timestep').value);
	Betta = parseFloat(document.getElementById('B').value);
	fps = parseInt(document.getElementById('FPS').value);
	times_draw = parseInt(document.getElementById('times').value);
	amplitude = document.getElementById('ampl').value;
	frequency = document.getElementById('freq').value;

    initial_cond(N,a);
    draw(N);
    
    // setInterval(сontrol,1000/fps,N,cm,a,dt);
}
let flag = 0;
let count = 0;
//Пересчет координат
function physics(N,cm,a,dt)
{
    for(var i = 0; i < N; i++)
    {
        particles[i].izg.x = 0;
        particles[i].izg.y = 0;
    }

    for(var i = 1; i < N - 1; i++)
    {
        let csm = 50;
        let rr = particles[i+1].rvec.minus_vec(particles[i].rvec); // вектор между i и i+1 частицами
        let rl = particles[i-1].rvec.minus_vec(particles[i].rvec); // вектор между i и i-1 частицами

        let len_right = rr.get_len();
        let len_left = rl.get_len();
        let a_izg_i = new vec(0,0);
        let a_izg_left = new vec(0,0);
        let a_izg_right = new vec(0,0);
        let cos = rr.get_unit().scal_mult(rl.get_unit());
        let phi = Math.acos(cos);

        if(phi != Math.PI && phi != 0 && Math.abs(cos - 1) > 0.01)
        {
            let k = csm * (phi - Math.PI)* Math.pow(len_left*len_right,-2);
            
            let tmp = rl.multiply_on_scalar(len_right/len_left);
            a_izg_left = rr.multiply_on_scalar(len_left*len_right).minus_vec(tmp.multiply_on_scalar(rr.scal_mult(rl)));
            a_izg_left = a_izg_left.multiply_on_scalar(-k);

            tmp = rr.multiply_on_scalar(len_left/len_right).sum_vec(rl.multiply_on_scalar(len_right/len_left));
            a_izg_i = particles[i].rvec.multiply_on_scalar(2).minus_vec(rr.sum_vec(rl)).multiply_on_scalar(len_left*len_right).sum_vec(tmp.multiply_on_scalar(rr.scal_mult(rl)));
            a_izg_i = a_izg_i.multiply_on_scalar(-k);

            tmp = rr.multiply_on_scalar(len_left/len_right);
            a_izg_right = rl.multiply_on_scalar(len_left*len_right).minus_vec(tmp.multiply_on_scalar(rr.scal_mult(rl)));
            a_izg_right= a_izg_right.multiply_on_scalar(-k);

            if(rr.y > 0 && rl.y > 0)
            {
                if(a_izg_i.y < 0)
                {
                    a_izg_i.y *= -1;
                }
                // if(a_izg_right.y > 0)
                // {
                //     a_izg_i.y *= -1;
                // }
                // if(a_izg_left.y > 0)
                // {
                //     a_izg_i.y *= -1;
                // }
            }

            if(rr.y < 0 && rl.y < 0)
            {
                if(a_izg_i.y > 0)
                {
                    a_izg_i.y *= -1;
                }
                // if(a_izg_right.y < 0)
                // {
                //     a_izg_i.y *= -1;
                // }
                // if(a_izg_left.y < 0)
                // {
                //     a_izg_i.y *= -1;
                // }
            }

            
            console.log("HI",a_izg_left,a_izg_right,a_izg_i)
        }
        // particles[i-1].izg = particles[i-1].izg.sum_vec(a_izg_left);
        particles[i].izg = particles[i].izg.sum_vec(a_izg_i);
        // particles[i+1].izg = particles[i+1].izg.sum_vec(a_izg_right);
    }
    
    let rr = particles[1].rvec.minus_vec(particles[0].rvec); // вектор между i и i+1 частицами
    let len_right = rr.get_len();
    let dlr = len_right - a;
    let ar = rr.get_unit();
    ar = ar.multiply_on_scalar(cm * dlr);
    let full_a = ar.sum_vec(new vec(0,0)).minus_vec(particles[0].velvec).minus_vec(particles[0].izg).minus_vec(particles[1].izg);
    
    dv = full_a.multiply_on_scalar(dt);
    particles[0].velvec = particles[0].velvec.sum_vec(dv);

    for(var i = 1; i < N - 1; i++)
    {
        
        console.log(i , particles[i].rvec, particles[i-1].rvec, particles[i+1].rvec);

        let rr = particles[i+1].rvec.minus_vec(particles[i].rvec); // вектор между i и i+1 частицами
        let rl = particles[i-1].rvec.minus_vec(particles[i].rvec); // вектор между i и i-1 частицами

        let len_right = rr.get_len();
        let len_left = rl.get_len();

        console.log(rr,rl);
        let dlr = len_right - a;
        let dll = len_left - a;

        let ar = rr.get_unit();
        ar = ar.multiply_on_scalar(cm * dlr); // вектор ускорения от силы между i и i+1 частицами
        let al = rl.get_unit();
        al =al.multiply_on_scalar(cm * dll);// вектор ускорения от силы между i и i-1 частицами

        
        let full_a = ar.sum_vec(al).sum_vec(new vec(0,0)).minus_vec(particles[i].velvec).minus_vec(particles[i].izg).minus_vec(particles[i-1].izg).minus_vec(particles[i+1].izg);

        dv = full_a.multiply_on_scalar(dt);
        particles[i].velvec = particles[i].velvec.sum_vec(dv);
        console.log(particles[i].rvec.y);
    }

    for (var i = 0; i<N-1; i++) {
        dr = particles[i].velvec.multiply_on_scalar(dt);
        particles[i].rvec = particles[i].rvec.sum_vec(dr);
    }   
     particles[N-1].rvec.y = h/2 + 30 * Math.sin(5* time); 
}

function control(N,cm,a,dt)
{
    physics(N,cm,a,dt);
    draw(N);
    time +=dt;
}

function main()
{
    var N = document.getElementById('Num').value;
    var a = document.getElementById('distance').value;
    var fps = document.getElementById('FPS').value;
    var cm = parseFloat(document.getElementById('CM').value);
    var a = parseFloat(document.getElementById('distance').value);
	var dt = parseFloat(document.getElementById('timestep').value);
    var radio = document.getElementById('radio').value;
    var amplitude = document.getElementById('ampl').value;
    var frequency = document.getElementById('freq').value;

    initial_cond(N,a);
    draw(N);
    console.log(particles);
    // control(N,cm,a,dt);
    // control(N,cm,a,dt);
    // control(N,cm,a,dt);
    // control(N,cm,a,dt);
    // control(N,cm,a,dt);
    setInterval(control,1000/fps,N,cm,a,dt);
}
