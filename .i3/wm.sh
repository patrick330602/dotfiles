#!/bin/sh
if curl -s --head $1 | grep "200 OK" > /dev/null
  then 
    echo "<span color='#b2ff66'></span>"
  else
    echo "<span color='#ff6666'></span>"
fi
