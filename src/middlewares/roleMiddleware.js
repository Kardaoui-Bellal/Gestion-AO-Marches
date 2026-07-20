// Usage: requireRole('ADMIN') or requireRole('ADMIN', 'GESTIONNAIRE')
function requireRole(...allowedCodes) {
    return (req, res, next) => {
        const userRole = req.session?.user?.role_code;

        if (!userRole) {
            return res.redirect("/auth/login");
        }

        if (!allowedCodes.includes(userRole)) {
            return res.status(403).render("errors/403", {
                message: "Vous n'avez pas les droits pour accéder à cette page.",
            });
        }

        return next();
    };
}

module.exports = { requireRole };