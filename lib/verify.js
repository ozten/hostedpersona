exports.email = function (email) {
    var parts = email.split('@');
    if (2 === parts.length &&
      2 <= parts[1].split('.').length &&
      0 < parts[0].length &&
      320 >= email.length) {
        return null;
    } else {
        return 'Not a valid email address';
    }
};

exports.password = function (password, password2) {
    if ( 5 >= password.length ) {
        return 'Password too short, must be 6 or more characters.'
    } else if (password !== password2) {
        return 'Passwords didn\'t match';
    } else {
        return null;
    }
}