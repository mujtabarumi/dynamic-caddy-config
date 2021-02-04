HOSTS="/etc/hosts" # path to ur host file
# HOST Added!
/bin/cat >> $HOSTS <<EOF
## $1
127.0.0.1   $1 www.$1
EOF