#!/bin/sh
echo "1:`acpi | sed -n '1p' | cut -d ',' -f 2` 2:`acpi | sed -n '2p' | cut -d ',' -f 2`"
