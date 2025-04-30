const User = require('../models/user');

// Registrer ny bruker
exports.register = async (req, res) => {
    try {
        const { brukernavn, passord, rolle } = req.body;
        
        // Valider input
        if (!brukernavn || !passord || !rolle) {
            return res.status(400).json({ message: 'Mangler påkrevde felt' });
        }
        
        if (rolle !== 'lærer' && rolle !== 'elev') {
            return res.status(400).json({ message: 'Ugyldig rolle' });
        }
        
        // Registrer bruker
        const user = await User.register(brukernavn, passord, rolle);
        
        res.status(201).json({ message: 'Bruker opprettet!', user });
    } catch (error) {
        console.error('Register error:', error);
        res.status(400).json({ message: error.message });
    }
};

// Logg inn bruker
exports.login = async (req, res) => {
    try {
        const { brukernavn, passord } = req.body;
        
        // Valider input
        if (!brukernavn || !passord) {
            return res.status(400).json({ message: 'Mangler påkrevde felt' });
        }
        
        // Logg inn bruker
        const user = await User.login(brukernavn, passord);
        
        // Lagre bruker i session
        req.session.user = user;
        
        res.json({ message: 'Innlogget!', user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ message: error.message });
    }
};

// Logg ut bruker
exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Kunne ikke logge ut' });
        }
        
        res.json({ message: 'Logget ut!' });
    });
};

// Hent den nåværende innloggede brukeren
exports.getCurrentUser = (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Ikke logget inn' });
    }
    
    res.json({ user: req.session.user });
};