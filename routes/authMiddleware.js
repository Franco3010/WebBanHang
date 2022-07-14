module.exports.isAuth = (req, res, next) => {
    if (req.isAuthenticated()) {

        res.redirect('home')
    } 
}

module.exports.isnotAuth = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next();
    } 
}

module.exports.isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.admin) {
        next();
    } else {
        res.status(401).json({ msg: 'You are not authorized to view this resource because you are not an admin.' });
    }
}