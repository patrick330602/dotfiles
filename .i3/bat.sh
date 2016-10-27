#!/bin/bash
BATTERY1=`acpi | sed -n '1p' | grep -o '[A-Za-z ]*' |sed -n '2p'`
BATTERY2=`acpi | sed -n '2p' | grep -o '[A-Za-z ]*' |sed -n '2p'`
BATTERY1VALUE=$(acpi | sed -n '1p' | grep -o '[0-9]\+%' | sed 's/%$//' | bc)
BATTERY2VALUE=$(acpi | sed -n '2p' | grep -o '[0-9]\+%' | sed 's/%$//' | bc)
case $1 in
	1)
		if [ "${BATTERY1}" == " Discharging" ]
	       	then
			if [[ "$BATTERY1VALUE" -le "100" ]] && [[ "$BATTERY1VALUE" -gt "75" ]]
		       	then
				ICON=" "
				COLOR="#85ff33"
			elif [[ "$BATTERY1VALUE" -le "75" ]] && [[ "$BATTERY1VALUE" -gt "50" ]]
		       	then
				ICON=" "
				COLOR="#f2ff33"
			elif [[ "$BATTERY1VALUE" -le "50" ]] && [[ "$BATTERY1VALUE" -gt "25" ]]
			then
				ICON=""
				COLOR="#ffcc33"
			elif [[ "$BATTERY1VALUE" -le "25" ]] && [[ "$BATTERY1VALUE" -gt "10" ]]
			then
				ICON=" "
				COLOR="#ff8533"
			elif [[ "$BATTERY1VALUE" -le "10" ]] && [[ "$BATTERY1VALUE" -gt "0" ]] 
			then
				ICON=" "
				COLOR="#ff4133"
			fi	
			echo "<span color='$COLOR'>$ICON</span>"
			#echo "<span color='$COLOR'>$ICON $BATTERY1VALUE%</span>"
		else
			ICON=""
			COLOR="#338cff"
			echo "<span color='$COLOR'>$ICON</span>"
			#echo "<span color='$COLOR'>$ICON $BATTERY1VALUE%</span>"
		fi
		;;
	2)
		if [ "${BATTERY2}" == " Discharging" ]
	       	then
			if [[ "$BATTERY2VALUE" -le "100" ]] && [[ "$BATTERY2VALUE" -gt "75" ]]
		       	then
				ICON2=" "
				COLOR2="#85ff33"
			elif [[ "$BATTERY2VALUE" -le "75" ]] && [[ "$BATTERY2VALUE" -gt "50" ]]
		       	then
				ICON2=" "
				COLOR2="#f2ff33"
			elif [[ "$BATTERY2VALUE" -le "50" ]] && [[ "$BATTERY2VALUE" -gt "25" ]]
			then
				ICON2=""
				COLOR2="#ffcc33"
			elif [[ "$BATTERY2VALUE" -le "25" ]] && [[ "$BATTERY2VALUE" -gt "10" ]]
			then
				ICON2=" "
				COLOR2="#ff8533"
			elif [[ "$BATTERY2VALUE" -le "10" ]] && [[ "$BATTERY2VALUE" -gt "0" ]] 
			then
				ICON2=" "
				COLOR2="#ff4133"
			fi
			echo "<span color='$COLOR2'>$ICON2</span>"
			#echo "<span color='$COLOR2'>$ICON2 $BATTERY2VALUE%</span>"

		else
			ICON=""
			COLOR="#338cff"
			echo "<span color='$COLOR2'>$ICON2</span>"
			#echo "<span color='$COLOR2'>$ICON2 $BATTERY2VALUE%</span>"
		fi
		;;
esac
