mongo -- "$MONGO_INITDB_DATABASE" <<EOF
    var rootUser = '$MONGO_INITDB_ROOT_USERNAME';
    var rootPwd = '$MONGO_INITDB_ROOT_PASSWORD';
    var admin = db.getSiblingDB('admin');
    admin.auth(rootUser, rootPwd);

    var user = '$MONGO_USERNAME';
    var pwd = '$MONGO_PASSWORD';
    db.createUser({user: user, pwd: pwd, roles: ["readWrite"]});
EOF